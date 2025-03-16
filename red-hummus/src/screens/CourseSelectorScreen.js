// src/screens/CourseSelectorScreen.js

import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Layout from "../ui/Layout";
import theme from "../ui/theme";
import AppText from "../components/AppText";

// Dummy course for testing - in a production app, this would come from an API or database
const dummyCourse = { 
  id: "550e8400-e29b-41d4-a716-446655440000", 
  name: "Pebble Beach (White Tees)",
  par: 72 // Added par value for the course
};

/**
 * CourseSelectorScreen Component
 * 
 * Allows users to select a golf course to play.
 * Currently uses a dummy course, but would be expanded to fetch from database
 * or API in a full implementation.
 * 
 * Note: Title "Select Course" is now in the navigation header instead of in-screen.
 */
export default function CourseSelectorScreen({ navigation }) {
  // Function to select a course and navigate to the tracker
  const selectCourse = async () => {
    try {
      // Store the course data in AsyncStorage for use in TrackerScreen
      await AsyncStorage.setItem("selectedCourse", JSON.stringify(dummyCourse));
      // Navigate to the tracker screen
      navigation.navigate("Tracker");
    } catch (error) {
      console.error("Error saving course data:", error);
    }
  };

  return (
    <Layout>
      <View style={styles.center}>
        {/* Course information display */}
        <View style={styles.courseCard}>
          <AppText variant="subtitle" style={styles.courseName}>
            {dummyCourse.name}
          </AppText>
          <AppText variant="body" style={styles.coursePar}>
            Par: {dummyCourse.par}
          </AppText>
        </View>
        
        {/* Material Design styled button */}
        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={selectCourse}
        >
          <AppText variant="button" color="#FFFFFF" bold>
            Select This Course and Start Round
          </AppText>
        </TouchableOpacity>
      </View>
    </Layout>
  );
}

// Styles with Material Design guidelines
const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  courseCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    width: "100%",
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  courseName: {
    marginBottom: 8,
  },
  coursePar: {
    color: "#666",
  },
  // Material Design button styling
  primaryButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    alignItems: 'center',
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    minWidth: 200,
    marginVertical: 16,
  },
});