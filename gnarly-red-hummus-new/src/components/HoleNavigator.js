// src/components/HoleNavigator.js

import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import theme from "../ui/theme";

/**
 * HoleNavigator Component
 *
 * Renders the current hole and inline left/right arrow buttons for navigation.
 *
 * Props:
 * - currentHole: The current hole number.
 * - onPreviousHole: Callback function to navigate to the previous hole.
 * - onNextHole: Callback function to navigate to the next hole.
 */
export default function HoleNavigator({ currentHole, onPreviousHole, onNextHole }) {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onPreviousHole} style={styles.arrowButton}>
        <Text style={styles.arrowText}>{"<"}</Text>
      </TouchableOpacity>
      <Text style={styles.holeLabel}>Hole {currentHole}</Text>
      <TouchableOpacity onPress={onNextHole} style={styles.arrowButton}>
        <Text style={styles.arrowText}>{">"}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  arrowButton: {
    padding: 10,
  },
  arrowText: {
    fontSize: 24,
    color: theme.colors.primary,
  },
  holeLabel: {
    fontSize: 20,
    fontWeight: "bold",
    marginHorizontal: 10,
    color: theme.colors.text,
  },
});
