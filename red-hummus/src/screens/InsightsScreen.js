// src/screens/InsightsScreen.js

import React, { useState, useEffect, useContext } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator, 
  ScrollView,
  RefreshControl
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Layout from "../ui/Layout";
import theme from "../ui/theme";
import { AuthContext } from "../context/AuthContext";
import { getLatestInsights } from "../services/insightsService";

/**
 * InsightsScreen Component
 * 
 * This screen displays AI-generated insights about the user's golf game.
 * It shows all sections of the insights data in an organized, readable format.
 */
export default function InsightsScreen() {
  // Get current authenticated user
  const { user } = useContext(AuthContext);
  
  // State management
  const [insights, setInsights] = useState(null);        // Stores the complete insights data
  const [loading, setLoading] = useState(true);          // Tracks loading state during initial load
  const [refreshing, setRefreshing] = useState(false);   // Tracks pull-to-refresh state
  const [error, setError] = useState(null);              // Stores any error messages

  /**
   * Fetch insights data from the database
   */
  const fetchInsights = async () => {
    if (!user) {
      setError("You must be logged in to view insights");
      setLoading(false);
      return;
    }
    
    try {
      setError(null);
      
      // Get the full insights object from our service
      const insightsData = await getLatestInsights(user.id);
      
      if (insightsData) {
        console.log("Insights data loaded:", Object.keys(insightsData));
        setInsights(insightsData);
      } else {
        // No insights found - will show empty state
        setInsights(null);
      }
    } catch (err) {
      console.error("Error fetching insights:", err);
      setError("Failed to load insights. Please try again later.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load insights when component mounts
  useEffect(() => {
    fetchInsights();
  }, [user]);

  // Handle pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchInsights();
  };

  // Render an insights section with icon and content
  const renderInsightSection = (title, content, iconName, iconColor) => {
    // Don't render if content is empty or null
    if (!content) return null;
    
    return (
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Ionicons name={iconName} size={22} color={iconColor} />
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        <Text style={styles.sectionContent}>{content}</Text>
      </View>
    );
  };
  
  // Render the loading view
  if (loading) {
    return (
      <Layout>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading your insights...</Text>
        </View>
      </Layout>
    );
  }
  
  // Render the error state
  if (error) {
    return (
      <Layout>
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle" size={48} color="#d32f2f" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={fetchInsights}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </Layout>
    );
  }
  
  // Render the empty state when no insights exist
  if (!insights) {
    return (
      <Layout>
        <View style={styles.centerContainer}>
          <Ionicons name="golf-outline" size={64} color={theme.colors.primary} />
          <Text style={styles.emptyTitleText}>No Insights Yet</Text>
          <Text style={styles.emptyText}>
            Complete a round to get personalized insights from your golf coach.
            Track your shots to see patterns and get tips to improve your game.
          </Text>
        </View>
      </Layout>
    );
  }
  
  // Render the insights content
  return (
    <Layout>
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
          />
        }
      >
        <Text style={styles.title}>Golf Insights</Text>
        
        <View style={styles.insightsCard}>
          {/* Summary Section */}
          {insights.summary && (
            <View style={styles.summarySection}>
              <Text style={styles.summaryText}>{insights.summary}</Text>
            </View>
          )}
          
          {/* Primary Issue Section */}
          {renderInsightSection(
            "Primary Issue",
            insights.primaryIssue,
            "warning-outline", 
            "#f57c00" // Orange
          )}
          
          {/* Reason Section */}
          {renderInsightSection(
            "Reason",
            insights.reason,
            "information-circle-outline", 
            "#0288d1" // Blue
          )}
          
          {/* Practice Focus Section */}
          {renderInsightSection(
            "Practice Focus",
            insights.practiceFocus,
            "basketball-outline", 
            "#4caf50" // Green
          )}
          
          {/* Management Tip Section */}
          {renderInsightSection(
            "Management Tip",
            insights.managementTip,
            "bulb-outline", 
            "#ffc107" // Amber
          )}
          
          {/* Progress Section - Only shown if available and not null */}
          {insights.progress && insights.progress !== "null" && (
            renderInsightSection(
              "Progress",
              insights.progress,
              "trending-up-outline", 
              "#9c27b0" // Purple
            )
          )}
          
          {/* Show when the insights were generated */}
          {insights.generatedAt && (
            <Text style={styles.generatedAtText}>
              Generated on {new Date(insights.generatedAt).toLocaleDateString()}
            </Text>
          )}
        </View>
      </ScrollView>
    </Layout>
  );
}

// Styles for the component
const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    marginHorizontal: 20,
  },
  insightsCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    margin: 16,
    // Shadow for iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    // Elevation for Android
    elevation: 2,
  },
  summarySection: {
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    paddingBottom: 16,
    marginBottom: 16,
  },
  summaryText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#333",
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
    color: "#444",
  },
  sectionContent: {
    fontSize: 16,
    lineHeight: 24,
    color: "#555",
    paddingLeft: 30, // Indent to align with section title
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: "#d32f2f",
    textAlign: "center",
    marginBottom: 24,
  },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: theme.colors.primary,
    borderRadius: 20,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "500",
  },
  emptyTitleText: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 24,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
    paddingHorizontal: 24,
    lineHeight: 24,
  },
  generatedAtText: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
    marginTop: 16,
    fontStyle: "italic",
  },
});