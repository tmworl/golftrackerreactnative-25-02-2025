// src/screens/InsightsScreen.js

import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Layout from "../ui/Layout";
import theme from "../ui/theme";

/**
 * InsightsScreen Component
 * 
 * This screen will display AI-generated insights about the user's golf game.
 * Initially, it shows an empty state until we implement the insights functionality.
 */
export default function InsightsScreen() {
  // Eventually we'll fetch insights data here
  const hasInsights = false; // This will be replaced with actual data check

  return (
    <Layout>
      <View style={styles.container}>
        <Text style={styles.title}>Performance Insights</Text>
        
        {/* Empty state - displayed when no insights are available */}
        {!hasInsights && (
          <View style={styles.emptyContainer}>
            {/* Golf insights icon */}
            <View style={styles.iconContainer}>
              <Ionicons name="golf-outline" size={64} color={theme.colors.primary} />
              <View style={styles.lightbulbIcon}>
                <Ionicons name="bulb-outline" size={28} color={theme.colors.primary} />
              </View>
            </View>
            
            <Text style={styles.emptyTitle}>No Insights Yet</Text>
            <Text style={styles.emptyText}>
              Complete rounds to get AI-powered analysis of your golf game. 
              We'll identify patterns and provide specific tips to help lower your score.
            </Text>
            
            <View style={styles.comingSoonBadge}>
              <Text style={styles.comingSoonText}>Coming Soon</Text>
            </View>
          </View>
        )}
        
        {/* Insight content will go here when implemented */}
        {hasInsights && (
          <View>
            {/* This section will be populated with actual insights in future phases */}
            <Text>Insights will appear here</Text>
          </View>
        )}
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.medium,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
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
  comingSoonBadge: {
    backgroundColor: "#E3F2FD", // Light blue background
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginTop: 10,
  },
  comingSoonText: {
    color: theme.colors.primary,
    fontWeight: "500",
    fontSize: 12,
  },
});