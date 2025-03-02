// src/screens/CourseSelectorScreen.js

import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Layout from "../ui/Layout";
import theme from "../ui/theme";

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
        <Text style={styles.title}>Select a Course</Text>
        
        {/* Course information display */}
        <View style={styles.courseCard}>
          <Text style={styles.courseName}>{dummyCourse.name}</Text>
          <Text style={styles.coursePar}>Par: {dummyCourse.par}</Text>
        </View>
        
        {/* Material Design styled button */}
        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={selectCourse}
        >
          <Text style={styles.buttonText}>Select This Course and Start Round</Text>
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
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
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
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  coursePar: {
    fontSize: 16,
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
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});