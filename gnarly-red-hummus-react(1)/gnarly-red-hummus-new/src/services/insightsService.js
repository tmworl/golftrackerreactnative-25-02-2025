// src/services/insightsService.js

import { supabase } from "./supabase";

/**
 * Generate insights for a user's golf performance
 * 
 * This function calls our Edge Function which:
 * 1. Fetches the user's recent rounds and shot data
 * 2. Processes this data into a format suitable for analysis
 * 3. Calls Claude AI to analyze patterns and generate actionable advice
 * 4. Stores the insights in the database
 * 
 * @param {string} userId - The user's ID (from auth)
 * @param {string} roundId - Optional specific round ID to focus on
 * @returns {Promise<Object>} The insights object with advice fields
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
    
    console.log("Insights generated successfully");
    return data.insights;
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