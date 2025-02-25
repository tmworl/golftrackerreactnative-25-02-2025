// src/screens/TrackerScreen.js

import React, { useState, useEffect, useContext } from "react";
import { View, Text, Button, ScrollView, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Layout from "../ui/Layout";
import theme from "../ui/theme";
import { createRound, insertShots, completeRound } from "../services/roundservice";
import ShotTable from "../components/ShotTable";
import HoleNavigator from "../components/HoleNavigator";
import { AuthContext } from "../context/AuthContext";
import { findOrCreateCourse } from "../services/courseService";

export default function TrackerScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  
  // Local state for current hole and shot counts per hole.
  const [currentHole, setCurrentHole] = useState(1);
  // Maintain shot data per hole. Initialize hole 1.
  const [holeShots, setHoleShots] = useState({
    1: {
      drive: { Good: 0, Neutral: 0, Bad: 0 },
      iron: { Good: 0, Neutral: 0, Bad: 0 },
      chip: { Good: 0, Neutral: 0, Bad: 0 },
      putt: { Good: 0, Neutral: 0, Bad: 0 },
    },
  });
  
  const [round, setRound] = useState(null);
  const [activeColumn, setActiveColumn] = useState("Good");

  // Initialize round on mount.
  useEffect(() => {
    const initializeRound = async () => {
      try {
        if (!user) {
          console.warn("No user found. Cannot create a round without a signed-in user.");
          return;
        }
        const storedCourse = await AsyncStorage.getItem("selectedCourse");
        const courseData = storedCourse ? JSON.parse(storedCourse) : { name: "Pebble Beach (White Tees)" };
        const courseRecord = await findOrCreateCourse(courseData);
        console.log("Course record obtained:", courseRecord);
        const newRound = await createRound(user.id, courseRecord.id);
        console.log("New round created:", newRound);
        setRound(newRound);
        await AsyncStorage.setItem("currentRound", JSON.stringify(newRound));
      } catch (error) {
        console.error("Error creating round:", error);
      }
    };
    initializeRound();
  }, [user]);

  // Update shot counts for the current hole.
  const addShot = (type, outcome) => {
    setHoleShots(prev => ({
      ...prev,
      [currentHole]: {
        ...prev[currentHole],
        [type]: {
          ...prev[currentHole][type],
          [outcome]: prev[currentHole][type][outcome] + 1,
        },
      },
    }));
  };

  const removeShot = (type, outcome) => {
    setHoleShots(prev => ({
      ...prev,
      [currentHole]: {
        ...prev[currentHole],
        [type]: {
          ...prev[currentHole][type],
          [outcome]: Math.max(prev[currentHole][type][outcome] - 1, 0),
        },
      },
    }));
  };

  // Handle navigation between holes.
  const handleNextHole = () => {
    setCurrentHole(prev => {
      const next = prev + 1;
      if (!holeShots[next]) {
        setHoleShots(shots => ({
          ...shots,
          [next]: {
            drive: { Good: 0, Neutral: 0, Bad: 0 },
            iron: { Good: 0, Neutral: 0, Bad: 0 },
            chip: { Good: 0, Neutral: 0, Bad: 0 },
            putt: { Good: 0, Neutral: 0, Bad: 0 },
          },
        }));
      }
      return next;
    });
  };

  const handlePreviousHole = () => {
    setCurrentHole(prev => (prev > 1 ? prev - 1 : prev));
  };

  // When user taps "Complete Hole", insert shots for current hole; finish round if on last hole.
  const finishRound = async () => {
    try {
      if (round) {
        const shotResponse = await insertShots(round.id, currentHole, holeShots[currentHole]);
        console.log("Shots inserted for hole", currentHole, shotResponse);
      }
    } catch (error) {
      console.error("Error saving shots:", error);
    }
    if (currentHole < 18) {
      handleNextHole();
    } else {
      try {
        if (round) {
          await completeRound(round.id);
        }
      } catch (error) {
        console.error("Error completing round:", error);
      }
      navigation.navigate("Scorecard");
    }
  };

  return (
    <Layout>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerContainer}>
          {/* Display header and inline hole navigation */}
          <Text style={styles.title}>Tracker</Text>
          <HoleNavigator
            currentHole={currentHole}
            onPreviousHole={handlePreviousHole}
            onNextHole={handleNextHole}
          />
        </View>
        <ShotTable
          shotCounts={holeShots[currentHole]}
          activeColumn={activeColumn}
          setActiveColumn={setActiveColumn}
          addShot={addShot}
          removeShot={removeShot}
        />
        <Button title="Complete Hole" onPress={finishRound} color={theme.colors.primary} />
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
    textAlign: "left",
  },
});