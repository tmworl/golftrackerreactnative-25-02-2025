// src/components/InsightsSummaryCard.js
//
// This component displays a card with a golf coach icon and insights summary.
// It has been updated to use the AppText component with system fonts.

import React from "react";
import { View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import theme from "../ui/theme";
import AppText from "./AppText"; // Import our new AppText component

/**
 * InsightsSummaryCard Component
 * 
 * Displays a card with a golf coach icon and insights summary.
 * Shows appropriate content for both when insights exist and when they don't.
 * Uses the AppText component with system fonts for consistent typography.
 * 
 * @param {object} props
 * @param {string|null} props.summary - The insights summary text to display
 * @param {boolean} props.loading - Whether the insights are currently loading
 */
const InsightsSummaryCard = ({ summary, loading = false }) => {
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
        <View style={styles.iconContainer}>
          <Ionicons name="golf-outline" size={24} color={theme.colors.primary} />
        </View>
        {/* Use AppText with 'subtitle' variant for the title */}
        <AppText variant="subtitle">Coach's Corner</AppText>
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
    marginBottom: 12,
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
});

export default InsightsSummaryCard;