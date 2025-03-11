// src/screens/TrackerScreen.js

import React, { useState, useEffect, useContext, useCallback } from "react";
import { View, Text, Button, ScrollView, StyleSheet, Alert, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Layout from "../ui/Layout";
import theme from "../ui/theme";
import { createRound, insertShots, completeRound } from "../services/roundservice";
import ShotTable from "../components/ShotTable";
import HoleNavigator from "../components/HoleNavigator";
import { AuthContext } from "../context/AuthContext";
import { findOrCreateCourse } from "../services/courseService";
import useSwipegesture from "../hook/useSwipegesture"; // Import the swipe hook

export default function TrackerScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  
  // Local state for tracking current hole and shots
  const [currentHole, setCurrentHole] = useState(1);
  const [totalHoles] = useState(18); // Standard golf round is 18 holes
  
  // Initialize shot data for all holes
  const initialShotState = {};
  for (let i = 1; i <= 18; i++) {
    initialShotState[i] = {
      drive: { Good: 0, Neutral: 0, Bad: 0 },
      iron: { Good: 0, Neutral: 0, Bad: 0 },
      chip: { Good: 0, Neutral: 0, Bad: 0 },
      putt: { Good: 0, Neutral: 0, Bad: 0 },
    };
  }
  
  // State for tracking shots, round info, and UI state
  const [holeShots, setHoleShots] = useState(initialShotState);
  const [round, setRound] = useState(null);
  const [activeColumn, setActiveColumn] = useState("Good");
  const [loading, setLoading] = useState(false);
  const [course, setCourse] = useState(null);

  // Function to handle navigating to the next hole
  const handleNextHole = useCallback(() => {
    if (currentHole < totalHoles) {
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

  // Function to handle navigating to the previous hole
  const handlePreviousHole = useCallback(() => {
    if (currentHole > 1) {
      setCurrentHole(prev => prev - 1);
    }
  }, [currentHole]);

  // Setup swipe gesture support for hole navigation
  const swipeHandlers = useSwipegesture({
    onSwipeLeft: handleNextHole,
    onSwipeRight: handlePreviousHole
  });

  // Initialize round on component mount
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

  // Function to add a shot
  const addShot = useCallback((type, outcome) => {
    console.log(`Adding ${outcome} ${type} shot for hole ${currentHole}`);
    
    setHoleShots(prev => {
      // Create a deep copy to avoid state mutation issues
      const newState = JSON.parse(JSON.stringify(prev));
      
      // Increment the shot count
      if (newState[currentHole] && newState[currentHole][type]) {
        newState[currentHole][type][outcome] += 1;
      } else {
        console.warn(`Unable to add shot: Invalid path [${currentHole}][${type}][${outcome}]`);
      }
      
      return newState;
    });
  }, [currentHole]);

  // Function to remove a shot
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

  // Handle completing a hole or the entire round
  const finishRound = async () => {
    try {
      // Show loading state
      setLoading(true);
      
      // 1. Save shots for the current hole
      if (round) {
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
    <Layout>
      <ScrollView 
        contentContainerStyle={styles.container}
        {...swipeHandlers} // Enable swipe gestures for the entire screen
      >
        <View style={styles.headerContainer}>
          {/* Display course name and hole navigation */}
          <Text style={styles.title}>
            {course?.name || "Round Tracker"}
          </Text>
          <HoleNavigator
            currentHole={currentHole}
            onPreviousHole={handlePreviousHole}
            onNextHole={handleNextHole}
            totalHoles={totalHoles}
          />
        </View>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Saving your data...</Text>
          </View>
        ) : (
          <>
            <View style={styles.instructionContainer}>
              <Text style={styles.instructionText}>
                Tap a column header to activate it, then use + and - to record shots
              </Text>
            </View>
            
            {/* Shot tracking table */}
            <ShotTable
              shotCounts={holeShots[currentHole]}
              activeColumn={activeColumn}
              setActiveColumn={setActiveColumn}
              addShot={addShot}
              removeShot={removeShot}
            />
            
            {/* Complete hole/round button */}
            <Button 
              title={currentHole === totalHoles ? "Complete Round" : "Complete Hole"} 
              onPress={finishRound}
              color={theme.colors.primary} 
            />
            
            <Text style={styles.swipeHint}>
              Swipe left/right to navigate between holes
            </Text>
          </>
        )}
      </ScrollView>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "stretch",
    justifyContent: "flex-start",
    padding: theme.spacing.medium,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing.medium,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "left",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  instructionContainer: {
    backgroundColor: "#f8f8f8",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  instructionText: {
    textAlign: "center",
    fontSize: 14,
    color: "#555",
  },
  swipeHint: {
    textAlign: "center",
    marginTop: 20,
    color: "#777",
    fontSize: 14,
    marginBottom: 20,
  }
});