// src/screens/TrackerScreen.js

import React, { useState, useEffect, useContext, useCallback } from "react";
import { View, Text, Button, StyleSheet, Alert, ActivityIndicator, ScrollView, SafeAreaView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Layout from "../ui/Layout";
import theme from "../ui/theme";
import { createRound, insertShots, completeRound } from "../services/roundservice";
import ShotTable from "../components/ShotTable";
import HoleNavigator from "../components/HoleNavigator";
import { AuthContext } from "../context/AuthContext";
import { findOrCreateCourse } from "../services/courseService";

/**
 * TrackerScreen Component
 * 
 * This screen allows users to track shots during a round of golf.
 * Uses the direct approach to save shots - no data transformation needed.
 */
export default function TrackerScreen({ navigation }) {
  // Get the authenticated user from context
  const { user } = useContext(AuthContext);
  
  // Local state for tracking current hole and shots
  const [currentHole, setCurrentHole] = useState(1);
  const [totalHoles] = useState(18); // Standard golf round is 18 holes
  
  // Initialize shot data for all holes with new shot types and outcomes
  // This matches exactly what will be saved to the database
  const initialShotState = {};
  for (let i = 1; i <= 18; i++) {
    initialShotState[i] = {
      "Tee Shot": { "On Target": 0, "Slightly Off": 0, "Recovery Needed": 0 },
      "Long Shot": { "On Target": 0, "Slightly Off": 0, "Recovery Needed": 0 },
      "Approach": { "On Target": 0, "Slightly Off": 0, "Recovery Needed": 0 },
      "Chip": { "On Target": 0, "Slightly Off": 0, "Recovery Needed": 0 },
      "Putts": { "On Target": 0, "Slightly Off": 0, "Recovery Needed": 0 },
      "Sand": { "On Target": 0, "Slightly Off": 0, "Recovery Needed": 0 },
      "Penalties": { "On Target": 0, "Slightly Off": 0, "Recovery Needed": 0 }
    };
  }
  
  // Main state variables for the component
  const [holeShots, setHoleShots] = useState(initialShotState); // Tracks shots for all holes
  const [round, setRound] = useState(null);                    // Current round data
  const [activeColumn, setActiveColumn] = useState("On Target"); // Currently selected outcome column
  const [loading, setLoading] = useState(false);                // Loading state for async operations
  const [course, setCourse] = useState(null);                   // Current course data

  /**
   * Function to navigate to the next hole
   * If we're on the last hole, prompt to finish the round
   */
  const handleNextHole = useCallback(() => {
    if (currentHole < totalHoles) {
      // Move to the next hole
      setCurrentHole(prev => prev + 1);
    } else {
      // If on the last hole, prompt to finish the round
      Alert.alert(
        "End of Round",
        "You've reached the last hole. Would you like to finish the round?",
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Finish Round", 
            onPress: () => finishRound(),
            style: "default" 
          }
        ]
      );
    }
  }, [currentHole, totalHoles]);

  /**
   * Function to navigate to the previous hole
   */
  const handlePreviousHole = useCallback(() => {
    if (currentHole > 1) {
      setCurrentHole(prev => prev - 1);
    }
  }, [currentHole]);

  /**
   * Initialize round on component mount
   * This effect runs once when the component is first loaded
   */
  useEffect(() => {
    const initializeRound = async () => {
      try {
        if (!user) {
          console.warn("No user found. Cannot create a round without a signed-in user.");
          return;
        }
        
        // Get the selected course data from AsyncStorage
        const storedCourse = await AsyncStorage.getItem("selectedCourse");
        const courseData = storedCourse ? JSON.parse(storedCourse) : { name: "Pebble Beach (White Tees)" };
        setCourse(courseData);
        
        // Find or create the course in the database
        const courseRecord = await findOrCreateCourse(courseData);
        console.log("Course record obtained:", courseRecord);
        
        // Create a new round in the database
        const newRound = await createRound(user.id, courseRecord.id);
        console.log("New round created:", newRound);
        
        // Set the round in state and store in AsyncStorage
        setRound(newRound);
        await AsyncStorage.setItem("currentRound", JSON.stringify(newRound));
      } catch (error) {
        console.error("Error creating round:", error);
        Alert.alert(
          "Error",
          "There was a problem starting your round. Please try again."
        );
      }
    };
    
    initializeRound();
  }, [user]);

  /**
   * Function to add a shot of a specific type and outcome
   * @param {string} type - The shot type (e.g., "Tee Shot", "Approach")
   * @param {string} outcome - The shot outcome (e.g., "On Target", "Slightly Off")
   */
  const addShot = useCallback((type, outcome) => {
    console.log(`Adding ${outcome} ${type} shot for hole ${currentHole}`);
    
    setHoleShots(prev => {
      // Create a deep copy to avoid state mutation issues
      const newState = JSON.parse(JSON.stringify(prev));
      
      // Increment the shot count for this type and outcome
      if (newState[currentHole] && newState[currentHole][type]) {
        newState[currentHole][type][outcome] += 1;
      } else {
        console.warn(`Unable to add shot: Invalid path [${currentHole}][${type}][${outcome}]`);
      }
      
      return newState;
    });
  }, [currentHole]);

  /**
   * Function to remove a shot of a specific type and outcome
   * @param {string} type - The shot type (e.g., "Tee Shot", "Approach")
   * @param {string} outcome - The shot outcome (e.g., "On Target", "Slightly Off")
   */
  const removeShot = useCallback((type, outcome) => {
    console.log(`Removing ${outcome} ${type} shot for hole ${currentHole}`);
    
    setHoleShots(prev => {
      // Create a deep copy to avoid state mutation issues
      const newState = JSON.parse(JSON.stringify(prev));
      
      // Decrement the shot count but not below zero
      if (newState[currentHole] && newState[currentHole][type]) {
        newState[currentHole][type][outcome] = Math.max(0, newState[currentHole][type][outcome] - 1);
      } else {
        console.warn(`Unable to remove shot: Invalid path [${currentHole}][${type}][${outcome}]`);
      }
      
      return newState;
    });
  }, [currentHole]);

  /**
   * Handle completing a hole or the entire round
   * This saves the shots for the current hole and either moves to the next hole
   * or completes the round if we're on the last hole
   */
  const finishRound = async () => {
    try {
      // Show loading state
      setLoading(true);
      
      // 1. Save shots for the current hole - pass shot counts directly to insertShots
      if (round) {
        console.log("Saving shots for hole:", currentHole, holeShots[currentHole]);
        const shotResponse = await insertShots(round.id, currentHole, holeShots[currentHole]);
        console.log("Shots inserted for hole", currentHole, shotResponse);
      }
      
      if (currentHole < totalHoles) {
        // If not the last hole, move to the next hole
        handleNextHole();
        setLoading(false);
      } else {
        try {
          if (round) {
            // 2. Complete the round - this will calculate total shots and score
            await completeRound(round.id);
            console.log("Round completed successfully");
            
            // 3. Clear the current round data from AsyncStorage
            await AsyncStorage.removeItem("currentRound");
            
            // 4. Navigate to the scorecard screen with the round ID
            navigation.navigate("ScorecardScreen", { roundId: round.id });
          }
        } catch (error) {
          console.error("Error completing round:", error);
          Alert.alert(
            "Error",
            "There was a problem completing your round. Please try again."
          );
        }
      }
    } catch (error) {
      console.error("Error saving shots:", error);
      Alert.alert(
        "Error",
        "There was a problem saving your shots. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Use ScrollView to allow scrolling on smaller devices if needed */}
      <ScrollView contentContainerStyle={styles.container}>
        {/* Only show the hole navigator - removed course name */}
        <View style={styles.navigatorContainer}>
          <HoleNavigator
            currentHole={currentHole}
            onPreviousHole={handlePreviousHole}
            onNextHole={handleNextHole}
            totalHoles={totalHoles}
          />
        </View>
        
        {/* Show loading indicator when saving data */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Saving your data...</Text>
          </View>
        ) : (
          <View style={styles.contentContainer}>
            {/* Shot tracking table - optimized for space with color coding */}
            <View style={styles.tableContainer}>
              <ShotTable
                shotCounts={holeShots[currentHole]}
                activeColumn={activeColumn}
                setActiveColumn={setActiveColumn}
                addShot={addShot}
                removeShot={removeShot}
              />
            </View>
            
            {/* Button to complete current hole or the entire round */}
            <View style={styles.buttonContainer}>
              <Button 
                title={currentHole === totalHoles ? "Complete Round" : "Complete Hole"} 
                onPress={finishRound}
                color={theme.colors.primary} 
              />
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// Styles for the component - optimized for iPhone screens with ability to scroll if needed
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 8, // Reduced horizontal padding to maximize width
    paddingVertical: 8,   // Enough padding for visual comfort
    minHeight: '100%',    // Allows scrolling on small screens if needed
  },
  navigatorContainer: {
    marginBottom: 12,     // Adequate margin for visual separation
    alignItems: 'center', // Center the navigator
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  contentContainer: {
    flex: 1,
    justifyContent: "space-between", // Space between table and button
  },
  tableContainer: {
    width: '100%',        // Full width
    marginBottom: 12,     // Margin before button
  },
  buttonContainer: {
    marginBottom: 8,      // Small margin at bottom
    paddingHorizontal: 8, // Padding for button
  }
});