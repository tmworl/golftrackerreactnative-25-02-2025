// src/components/InsightsSummaryCard.js
//
// This component displays a card with a golf coach icon and insights summary.
// It has been updated to use the AppText component with system fonts.

import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import theme from "../ui/theme";
import AppText from "./AppText"; // Import our new AppText component

/**
 * InsightsSummaryCard Component
 * 
 * Displays a card with a golf coach icon and insights summary.
 * Shows appropriate content for both when insights exist and when they don't.
 * Uses the AppText component with system fonts for consistent typography.
 * Now includes a refresh button to allow users to manually refresh insights.
 * 
 * @param {object} props
 * @param {string|null} props.summary - The insights summary text to display
 * @param {boolean} props.loading - Whether the insights are currently loading
 * @param {function} props.onRefresh - Function to call when refresh button is pressed
 */
const InsightsSummaryCard = ({ summary, loading = false, onRefresh }) => {
  // If we're loading, show a loading state
  if (loading) {
    return (
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="golf-outline" size={24} color={theme.colors.primary} />
          </View>
          {/* Use AppText with 'subtitle' variant for the title */}
          <AppText variant="subtitle">Coach's Corner</AppText>
        </View>
        {/* Use AppText with 'secondary' variant and italic style for loading text */}
        <AppText variant="secondary" italic>Analyzing your golf game...</AppText>
      </View>
    );
  }
  
  // Define content based on whether we have a summary or not
  const cardContent = summary ? (
    // We have a summary - show the insights with AppText
    <AppText variant="body">{summary}</AppText>
  ) : (
    // No summary - show the empty state message with AppText
    <AppText variant="secondary" italic>
      Complete a round to get personalized insights from your golf coach. 
      Track your shots to see patterns and get tips to improve your game.
    </AppText>
  );
  
  return (
    <View style={styles.card}>
      {/* Card header with golf coach icon and title */}
      <View style={styles.header}>
        <View style={styles.leftHeader}>
          <View style={styles.iconContainer}>
            <Ionicons name="golf-outline" size={24} color={theme.colors.primary} />
          </View>
          {/* Use AppText with 'subtitle' variant for the title */}
          <AppText variant="subtitle">Coach's Corner</AppText>
        </View>
        
        {/* Add refresh button - only shown when not loading */}
        {onRefresh && (
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={onRefresh}
            activeOpacity={0.6}
          >
            <Ionicons 
              name="refresh-outline" 
              size={22} 
              color={theme.colors.primary} 
            />
          </TouchableOpacity>
        )}
      </View>
      
      {/* Card content - either insights summary or empty state */}
      <View style={styles.content}>
        {cardContent}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    // Add shadow for iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    // Add elevation for Android
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", // Changed to space-between to put refresh button on right
    marginBottom: 12,
  },
  leftHeader: {
    flexDirection: "row", 
    alignItems: "center",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f8ff", // Light blue background for the icon
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  content: {
    marginLeft: 4, // Slight indent from the icon
  },
  refreshButton: {
    padding: 6,
    borderRadius: 20,
  },
});

export default InsightsSummaryCard;