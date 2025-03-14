// src/screens/InsightsScreen.js

import React, { useState, useContext } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator, 
  ScrollView,
  Alert
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Layout from "../ui/Layout";
import theme from "../ui/theme";
import { AuthContext } from "../context/AuthContext";
import { supabase } from "../services/supabase";

/**
 * InsightsScreen Component
 * 
 * This screen displays AI-generated insights about the user's golf game.
 * It directly calls the Edge Function to get insights and displays them
 * in a structured card format.
 */
export default function InsightsScreen() {
  // Get current authenticated user
  const { user } = useContext(AuthContext);
  
  // State management
  const [insights, setInsights] = useState(null);  // Stores the insights data
  const [loading, setLoading] = useState(false);   // Tracks loading state during API calls
  const [error, setError] = useState(null);        // Stores any error messages
  const [rawResponse, setRawResponse] = useState(null); // For debugging

  /**
   * Handles the generation of new insights by directly calling the edge function
   * Includes CORS handling for the request
   */
  const handleGenerateInsights = async () => {
    if (!user) {
      Alert.alert("Error", "You must be logged in to generate insights");
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      console.log("Starting Edge Function call for golf insights");
      
      // Get the current session and access token
      const { data: { session } } = await supabase.auth.getSession();
      console.log("Session obtained, has token:", !!session?.access_token);
      
      if (!session) {
        throw new Error("No active session found. Please log in again.");
      }
      
      // Configure headers to avoid CORS issues
      const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.access_token}`
      };
      
      // Direct fetch approach to have more control over headers
      const response = await fetch(`${supabase.functions.url}/analyze-golf-performance`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({})
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Edge Function error:", response.status, errorText);
        throw new Error(`Edge Function returned ${response.status}: ${errorText}`);
      }
      
      // Parse the JSON response
      const data = await response.json();
      console.log("Edge Function response:", data);
      setRawResponse(data);
      
      // Process the response to extract insights
      if (data && data.insights) {
        setInsights(data.insights);
      } 
      else if (data && data.insights_markdown) {
        // If we get markdown instead of structured JSON
        setInsights({
          summary: "Insights available in markdown format",
          rawMarkdown: data.insights_markdown
        });
      }
      else if (data && data.summary) {
        // Direct insights in response
        setInsights(data);
      }
      else {
        // Fallback for unexpected response format
        setError("Received response in unexpected format. Check debug data.");
        console.warn("Unexpected response format:", data);
      }
      
    } catch (err) {
      console.error("Error generating insights:", err);
      setError(err.message || "Failed to generate insights");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Performance Insights</Text>
        
        {/* Show error state if applicable */}
        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={36} color="#d32f2f" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
        
        {/* Raw response data for debugging */}
        {rawResponse && !insights && (
          <View style={styles.debugContainer}>
            <Text style={styles.debugTitle}>Debug: Raw Response</Text>
            <Text style={styles.debugText}>
              {JSON.stringify(rawResponse, null, 2)}
            </Text>
          </View>
        )}
        
        {/* Insights card - shown when insights are available */}
        {insights && (
          <View style={styles.insightsCard}>
            {/* Summary Section */}
            {insights.summary && (
              <View style={styles.summarySection}>
                <Text style={styles.summaryText}>{insights.summary}</Text>
              </View>
            )}
            
            {/* Primary Issue Section */}
            {insights.primaryIssue && (
              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="warning-outline" size={22} color="#f57c00" />
                  <Text style={styles.sectionTitle}>Primary Issue</Text>
                </View>
                <Text style={styles.sectionContent}>{insights.primaryIssue}</Text>
              </View>
            )}
            
            {/* Reason Section */}
            {insights.reason && (
              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="information-circle-outline" size={22} color="#0288d1" />
                  <Text style={styles.sectionTitle}>Reason</Text>
                </View>
                <Text style={styles.sectionContent}>{insights.reason}</Text>
              </View>
            )}
            
            {/* Practice Focus Section */}
            {insights.practiceFocus && (
              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="basketball-outline" size={22} color="#4caf50" />
                  <Text style={styles.sectionTitle}>Practice Focus</Text>
                </View>
                <Text style={styles.sectionContent}>{insights.practiceFocus}</Text>
              </View>
            )}
            
            {/* Management Tip Section */}
            {insights.managementTip && (
              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="bulb-outline" size={22} color="#ffc107" />
                  <Text style={styles.sectionTitle}>Management Tip</Text>
                </View>
                <Text style={styles.sectionContent}>{insights.managementTip}</Text>
              </View>
            )}
            
            {/* Progress Section - Only shown if available */}
            {insights.progress && insights.progress !== null && (
              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="trending-up-outline" size={22} color="#9c27b0" />
                  <Text style={styles.sectionTitle}>Progress</Text>
                </View>
                <Text style={styles.sectionContent}>{insights.progress}</Text>
              </View>
            )}
            
            {/* Raw Markdown - Only if we couldn't parse structured data */}
            {insights.rawMarkdown && (
              <View style={styles.sectionContainer}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="document-text-outline" size={22} color="#607d8b" />
                  <Text style={styles.sectionTitle}>Detailed Analysis</Text>
                </View>
                <Text style={styles.sectionContent}>{insights.rawMarkdown}</Text>
              </View>
            )}
            
            {/* Refresh insights button */}
            <TouchableOpacity 
              style={styles.refreshButton}
              onPress={handleGenerateInsights}
              disabled={loading}
            >
              <Ionicons name="refresh-outline" size={18} color="#fff" />
              <Text style={styles.buttonTextSmall}>Refresh Insights</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {/* Empty state with Generate button */}
        {!insights && !loading && !rawResponse && (
          <View style={styles.emptyContainer}>
            {/* Golf insights icon */}
            <View style={styles.iconContainer}>
              <Ionicons name="golf-outline" size={64} color={theme.colors.primary} />
              <View style={styles.lightbulbIcon}>
                <Ionicons name="bulb-outline" size={28} color={theme.colors.primary} />
              </View>
            </View>
            
            <Text style={styles.emptyTitle}>AI Golf Insights</Text>
            <Text style={styles.emptyText}>
              Get AI-powered analysis of your golf game to identify patterns 
              and receive specific tips to help lower your score.
            </Text>
            
            {/* Generate insights button */}
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={handleGenerateInsights}
              disabled={loading}
            >
              {loading ? (
                <>
                  <ActivityIndicator size="small" color="#fff" />
                  <Text style={styles.buttonText}>Analyzing Your Game...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="analytics-outline" size={20} color="#fff" style={styles.buttonIcon} />
                  <Text style={styles.buttonText}>Generate Insights</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
        
        {/* Loading state */}
        {loading && (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Analyzing your golf performance...</Text>
            <Text style={styles.loadingSubText}>This may take a few moments</Text>
          </View>
        )}
      </ScrollView>
    </Layout>
  );
}

// Styles with Material Design influences
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    minHeight: 300,
  },
  emptyContainer: {
    alignItems: "center",
    padding: 20,
    minHeight: 400,
    justifyContent: "center",
  },
  iconContainer: {
    position: "relative",
    marginBottom: 24,
  },
  lightbulbIcon: {
    position: "absolute",
    top: -5,
    right: -15,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 2,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    minWidth: 200,
    marginVertical: 16,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
  },
  buttonTextSmall: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 6,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  loadingSubText: {
    marginTop: 8,
    fontSize: 14,
    color: "#888",
    fontStyle: "italic"
  },
  insightsCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summarySection: {
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    paddingBottom: 16,
    marginBottom: 16,
  },
  summaryText: {
    fontSize: 18,
    lineHeight: 26,
    color: "#333",
  },
  sectionContainer: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
    color: "#444",
  },
  sectionContent: {
    fontSize: 15,
    lineHeight: 22,
    color: "#555",
    paddingLeft: 30, // Indent to align with section title
  },
  errorContainer: {
    backgroundColor: "#ffebee",
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  errorText: {
    color: "#d32f2f",
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },
  refreshButton: {
    backgroundColor: theme.colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignSelf: "center",
    marginTop: 8,
  },
  debugContainer: {
    backgroundColor: "#f5f5f5",
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  debugTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  debugText: {
    fontFamily: "monospace",
    fontSize: 12,
  }
});