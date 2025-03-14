// src/services/insightsService.js

import { supabase } from "./supabase";

/**
 * Generate insights for a user's golf performance
 * 
 * This function calls our Edge Function which:
 * 1. Fetches the user's recent rounds and shot data
 * 2. Processes this data into a format suitable for analysis
 * 3. Calls Claude AI to analyze patterns and generate actionable advice
 * 4. Processes the JSON response and returns structured insights
 * 
 * @param {string} userId - The user's ID (from auth)
 * @param {string} roundId - Optional specific round ID to focus on
 * @returns {Promise<Object>} The insights object with structured advice fields
 */
export const generateInsights = async (userId, roundId = null) => {
  try {
    console.log(`Generating insights for user ${userId}${roundId ? `, round ${roundId}` : ''}`);
    
    // Call the Edge Function we deployed
    const { data, error } = await supabase.functions.invoke(
      'analyze-golf-performance',
      {
        body: { userId, roundId }
      }
    );
    
    if (error) {
      console.error("Error invoking insights function:", error);
      throw error;
    }
    
    // Handle different response formats that might come back
    let insights;
    
    // Case 1: If the response has a structured insights object
    if (data.insights) {
      insights = data.insights;
    }
    // Case 2: If the entire data object is the insights
    else if (data.summary && data.primaryIssue) {
      insights = data;
    }
    // Case 3: If there's a nested structure we need to navigate
    else if (data.response && data.response.insights) {
      insights = data.response.insights;
    }
    // Case 4: Parse from raw text if needed (fallback)
    else if (data.insights_markdown || data.claude_message) {
      const rawText = data.insights_markdown || data.claude_message;
      // Attempt to extract insights from markdown (simplified approach)
      insights = extractInsightsFromMarkdown(rawText);
    }
    // Default case: Return raw data if we can't identify structured insights
    else {
      console.warn("Unrecognized insights format - returning raw data");
      insights = data;
    }
    
    // If insights were successfully generated, store them in the database
    if (insights && userId) {
      try {
        await storeInsights(userId, roundId, insights);
      } catch (storeError) {
        console.error("Error storing insights:", storeError);
        // Continue even if storing fails - we'll still return insights to the UI
      }
    }
    
    console.log("Insights generated successfully");
    return insights;
  } catch (error) {
    console.error("Error generating insights:", error);
    throw error;
  }
};

/**
 * Fetch the most recent insights for a user
 * 
 * This function directly queries the insights table to get
 * the latest analysis for a user, useful for displaying insights
 * without generating new ones.
 * 
 * @param {string} userId - The user's ID
 * @returns {Promise<Object|null>} The most recent insight or null if none exists
 */
export const getLatestInsights = async (userId) => {
  try {
    // Query the insights table, sorting by creation date
    const { data, error } = await supabase
      .from('insights')
      .select('*')
      .eq('profile_id', userId)
      .order('created_at', { ascending: false })
      .limit(1);
      
    if (error) {
      console.error("Error fetching insights:", error);
      throw error;
    }
    
    // Return the first insight if any exist, otherwise null
    return data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error("Error fetching insights:", error);
    throw error;
  }
};

/**
 * Submit feedback on an insight's helpfulness
 * 
 * This allows users to rate insights, which can help improve
 * future analysis and track which advice is most valuable.
 * 
 * @param {string} insightId - The ID of the insight to rate
 * @param {number} rating - Feedback rating (1-3)
 * @returns {Promise<void>}
 */
export const submitInsightFeedback = async (insightId, rating) => {
  try {
    // Validate rating is in expected range
    if (![1, 2, 3].includes(rating)) {
      throw new Error("Rating must be 1, 2, or 3");
    }
    
    // Update the insight record with user's feedback
    const { error } = await supabase
      .from('insights')
      .update({ feedback_rating: rating })
      .eq('id', insightId);
      
    if (error) {
      console.error("Error submitting feedback:", error);
      throw error;
    }
    
    console.log(`Feedback (rating: ${rating}) submitted for insight ${insightId}`);
  } catch (error) {
    console.error("Error submitting feedback:", error);
    throw error;
  }
};

/**
 * Helper function to store insights in the database
 * 
 * @param {string} userId - The user's ID
 * @param {string|null} roundId - Optional round ID that the insights are for
 * @param {Object} insights - The insights object
 * @returns {Promise<Object>} The stored insights record
 * @private
 */
const storeInsights = async (userId, roundId, insights) => {
  // Prepare the data to be stored
  const insightData = {
    profile_id: userId,
    round_id: roundId,
    data: insights,
    created_at: new Date().toISOString()
  };
  
  // Insert the insight into the database
  const { data, error } = await supabase
    .from('insights')
    .insert([insightData])
    .select();
    
  if (error) {
    console.error("Error storing insights:", error);
    throw error;
  }
  
  return data[0];
};

/**
 * Helper function to extract structured insights from markdown text
 * This is a fallback method in case we receive markdown instead of JSON
 * 
 * @param {string} markdownText - The raw markdown text from Claude
 * @returns {Object} A structured insights object
 * @private
 */
const extractInsightsFromMarkdown = (markdownText) => {
  // Initialize empty insights object
  const insights = {
    summary: null,
    primaryIssue: null,
    reason: null,
    practiceFocus: null,
    managementTip: null,
    progress: null
  };
  
  // Extract summary (all text until first heading)
  const summaryMatch = markdownText.match(/^([\s\S]*?)(?:#|$)/);
  if (summaryMatch && summaryMatch[1].trim()) {
    insights.summary = summaryMatch[1].trim();
  }
  
  // Extract other sections based on headings or bold text markers
  const sections = [
    { key: 'primaryIssue', patterns: [/Primary Issue[:\s]*([\s\S]*?)(?=#|\*\*|$)/, /\*\*Primary Issue\*\*[:\s]*([\s\S]*?)(?=#|\*\*|$)/] },
    { key: 'reason', patterns: [/Reason[:\s]*([\s\S]*?)(?=#|\*\*|$)/, /\*\*Reason\*\*[:\s]*([\s\S]*?)(?=#|\*\*|$)/] },
    { key: 'practiceFocus', patterns: [/Practice Focus[:\s]*([\s\S]*?)(?=#|\*\*|$)/, /\*\*Practice Focus\*\*[:\s]*([\s\S]*?)(?=#|\*\*|$)/] },
    { key: 'managementTip', patterns: [/Management Tip[:\s]*([\s\S]*?)(?=#|\*\*|$)/, /\*\*Management Tip\*\*[:\s]*([\s\S]*?)(?=#|\*\*|$)/] },
    { key: 'progress', patterns: [/Progress[:\s]*([\s\S]*?)(?=#|\*\*|$)/, /\*\*Progress\*\*[:\s]*([\s\S]*?)(?=#|\*\*|$)/] }
  ];
  
  // Try to extract each section
  sections.forEach(section => {
    for (const pattern of section.patterns) {
      const match = markdownText.match(pattern);
      if (match && match[1] && match[1].trim()) {
        insights[section.key] = match[1].trim();
        break;
      }
    }
  });
  
  return insights;
};