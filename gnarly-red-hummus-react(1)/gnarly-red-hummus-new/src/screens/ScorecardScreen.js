// src/screens/ScorecardScreen.js

import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../services/supabase";
import Layout from "../ui/Layout";
import theme from "../ui/theme";

/**
 * ScorecardScreen Component
 * 
 * Displays a detailed scorecard for a completed round.
 * Shows hole-by-hole scores and outcome breakdowns.
 * Allows navigation back to home screen.
 */
export default function ScorecardScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  // Get roundId from navigation params
  const { roundId } = route.params || {};
  
  // State variables for scorecard data
  const [roundData, setRoundData] = useState(null);
  const [courseData, setCourseData] = useState(null);
  const [shotsData, setShotsData] = useState(null);
  const [holeResults, setHoleResults] = useState({});
  const [loading, setLoading] = useState(true);

  // Fetch all data for this round when component mounts
  useEffect(() => {
    async function fetchRoundData() {
      if (!roundId) {
        console.error("No roundId provided to ScorecardScreen");
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // 1. Fetch the round data
        const { data: round, error: roundError } = await supabase
          .from("rounds")
          .select(`
            id,
            profile_id,
            course_id,
            score,
            gross_shots,
            created_at,
            is_complete
          `)
          .eq("id", roundId)
          .single();
          
        console.log("Round data:", round);
        
        if (roundError) {
          console.error("Error fetching round:", roundError);
          throw roundError;
        }
        setRoundData(round);
        
        // 2. Fetch the course data
        const { data: course, error: courseError } = await supabase
          .from("courses")
          .select("id, name, par")
          .eq("id", round.course_id)
          .single();
          
        console.log("Course data:", course);
        
        if (courseError) {
          console.error("Error fetching course:", courseError);
          throw courseError;
        }
        setCourseData(course);
        
        // 3. Fetch all shots for this round
        const { data: shots, error: shotsError } = await supabase
          .from("shots")
          .select("id, round_id, hole_number, shot_type, result")
          .eq("round_id", roundId);
          
        console.log("Shots count:", shots?.length);
        
        if (shotsError) {
          console.error("Error fetching shots:", shotsError);
          throw shotsError;
        }
        setShotsData(shots);
        
        // 4. Process the shots data to organize by hole
        const holeData = {};
        const totalHoles = 18;
        
        // Initialize hole data structure
        for (let i = 1; i <= totalHoles; i++) {
          holeData[i] = {
            score: 0,
            outcomes: {
              Good: 0,
              Neutral: 0,
              Bad: 0
            }
          };
        }
        
        // Count shots per hole and by outcome
        shots.forEach(shot => {
          const holeNum = shot.hole_number;
          
          // Count total shots for score
          holeData[holeNum].score += 1;
          
          // Count by outcome
          if (shot.result in holeData[holeNum].outcomes) {
            holeData[holeNum].outcomes[shot.result] += 1;
          }
        });
        
        setHoleResults(holeData);
      } catch (error) {
        console.error("Error fetching scorecard data:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchRoundData();
  }, [roundId]);

  // Calculate front nine, back nine, and total scores
  const calculateTotals = () => {
    let frontNine = 0;
    let backNine = 0;
    let totalGood = 0;
    let totalNeutral = 0;
    let totalBad = 0;
    
    Object.keys(holeResults).forEach(hole => {
      const holeNum = parseInt(hole);
      const score = holeResults[hole].score;
      
      // Add to front or back nine
      if (holeNum <= 9) {
        frontNine += score;
      } else {
        backNine += score;
      }
      
      // Count outcomes
      totalGood += holeResults[hole].outcomes.Good;
      totalNeutral += holeResults[hole].outcomes.Neutral;
      totalBad += holeResults[hole].outcomes.Bad;
    });
    
    return {
      frontNine,
      backNine,
      total: frontNine + backNine,
      outcomes: {
        Good: totalGood,
        Neutral: totalNeutral,
        Bad: totalBad
      }
    };
  };

  // Navigate back to previous screen
  const handleBack = () => {
    navigation.goBack();
  };

  // Navigate directly to home screen
  const handleGoHome = () => {
    navigation.navigate("HomeScreen");
  };

  // If still loading, show loading indicator
  if (loading) {
    return (
      <Layout>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading scorecard...</Text>
        </View>
      </Layout>
    );
  }

  // Calculate totals for display
  const totals = calculateTotals();

  return (
    <Layout>
      <View style={styles.container}>
        {/* Header with back button */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={handleBack}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>Scorecard</Text>
          <View style={styles.placeholder} />
        </View>
        
        {/* Course info */}
        <View style={styles.courseInfo}>
          <Text style={styles.courseName}>{courseData?.name || "Unknown Course"}</Text>
          <Text style={styles.roundDate}>
            {roundData?.created_at ? new Date(roundData.created_at).toLocaleDateString() : ""}
          </Text>
        </View>
        
        {/* Scorecard */}
        <ScrollView style={styles.scorecard}>
          {/* Header row */}
          <View style={styles.headerRow}>
            <Text style={[styles.holeColumn, styles.headerText]}>Hole</Text>
            <Text style={[styles.parColumn, styles.headerText]}>Par</Text>
            <Text style={[styles.scoreColumn, styles.headerText]}>Score</Text>
            <Text style={[styles.outcomeColumn, styles.headerText]}>Good</Text>
            <Text style={[styles.outcomeColumn, styles.headerText]}>Neutral</Text>
            <Text style={[styles.outcomeColumn, styles.headerText]}>Bad</Text>
          </View>
          
          {/* Hole rows - Front Nine */}
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(hole => (
            <View key={`hole-${hole}`} style={styles.holeRow}>
              <Text style={styles.holeColumn}>{hole}</Text>
              <Text style={styles.parColumn}>{courseData?.par ? Math.floor(courseData.par / 18) : "-"}</Text>
              <Text style={styles.scoreColumn}>{holeResults[hole]?.score || 0}</Text>
              <Text style={styles.outcomeColumn}>{holeResults[hole]?.outcomes.Good || 0}</Text>
              <Text style={styles.outcomeColumn}>{holeResults[hole]?.outcomes.Neutral || 0}</Text>
              <Text style={styles.outcomeColumn}>{holeResults[hole]?.outcomes.Bad || 0}</Text>
            </View>
          ))}
          
          {/* Out (Front Nine) totals */}
          <View style={[styles.holeRow, styles.totalRow]}>
            <Text style={[styles.holeColumn, styles.totalText]}>Out</Text>
            <Text style={[styles.parColumn, styles.totalText]}>{courseData?.par ? Math.floor(courseData.par / 2) : "-"}</Text>
            <Text style={[styles.scoreColumn, styles.totalText]}>{totals.frontNine}</Text>
            <Text style={styles.outcomeColumn}></Text>
            <Text style={styles.outcomeColumn}></Text>
            <Text style={styles.outcomeColumn}></Text>
          </View>
          
          {/* Hole rows - Back Nine */}
          {[10, 11, 12, 13, 14, 15, 16, 17, 18].map(hole => (
            <View key={`hole-${hole}`} style={styles.holeRow}>
              <Text style={styles.holeColumn}>{hole}</Text>
              <Text style={styles.parColumn}>{courseData?.par ? Math.floor(courseData.par / 18) : "-"}</Text>
              <Text style={styles.scoreColumn}>{holeResults[hole]?.score || 0}</Text>
              <Text style={styles.outcomeColumn}>{holeResults[hole]?.outcomes.Good || 0}</Text>
              <Text style={styles.outcomeColumn}>{holeResults[hole]?.outcomes.Neutral || 0}</Text>
              <Text style={styles.outcomeColumn}>{holeResults[hole]?.outcomes.Bad || 0}</Text>
            </View>
          ))}
          
          {/* In (Back Nine) totals */}
          <View style={[styles.holeRow, styles.totalRow]}>
            <Text style={[styles.holeColumn, styles.totalText]}>In</Text>
            <Text style={[styles.parColumn, styles.totalText]}>{courseData?.par ? Math.floor(courseData.par / 2) : "-"}</Text>
            <Text style={[styles.scoreColumn, styles.totalText]}>{totals.backNine}</Text>
            <Text style={styles.outcomeColumn}></Text>
            <Text style={styles.outcomeColumn}></Text>
            <Text style={styles.outcomeColumn}></Text>
          </View>
          
          {/* Total row */}
          <View style={[styles.holeRow, styles.totalRow]}>
            <Text style={[styles.holeColumn, styles.totalText]}>Total</Text>
            <Text style={[styles.parColumn, styles.totalText]}>{courseData?.par || "-"}</Text>
            <Text style={[styles.scoreColumn, styles.totalText]}>{totals.total}</Text>
            <Text style={[styles.outcomeColumn, styles.totalText]}>{totals.outcomes.Good}</Text>
            <Text style={[styles.outcomeColumn, styles.totalText]}>{totals.outcomes.Neutral}</Text>
            <Text style={[styles.outcomeColumn, styles.totalText]}>{totals.outcomes.Bad}</Text>
          </View>
        </ScrollView>
        
        {/* Round summary */}
        <View style={styles.summary}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Score</Text>
            <Text style={styles.summaryValue}>{totals.total}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Vs Par</Text>
            <Text style={styles.summaryValue}>
              {roundData?.score !== null ? (roundData.score > 0 ? `+${roundData.score}` : roundData.score) : "N/A"}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Good Shots</Text>
            <Text style={styles.summaryValue}>{totals.outcomes.Good}</Text>
          </View>
        </View>
        
        {/* Return to Home button - Material Design styled */}
        <TouchableOpacity 
          style={styles.homeButton}
          onPress={handleGoHome}
        >
          <Text style={styles.homeButtonText}>Return to Home</Text>
        </TouchableOpacity>
      </View>
    </Layout>
  );
}

// Styles with Material Design guidelines
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  placeholder: {
    width: 40, // Same size as back button for alignment
  },
  courseInfo: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 8,
  },
  courseName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  roundDate: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  scorecard: {
    backgroundColor: "#fff",
    flex: 1,
    marginBottom: 8,
  },
  headerRow: {
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  holeRow: {
    flexDirection: "row",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  totalRow: {
    backgroundColor: "#f5f5f5",
  },
  holeColumn: {
    width: 50,
    textAlign: "center",
    fontWeight: "500",
  },
  parColumn: {
    width: 50,
    textAlign: "center",
  },
  scoreColumn: {
    width: 50,
    textAlign: "center",
  },
  outcomeColumn: {
    flex: 1,
    textAlign: "center",
  },
  headerText: {
    fontWeight: "bold",
  },
  totalText: {
    fontWeight: "bold",
  },
  summary: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 16,
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  summaryItem: {
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: theme.colors.primary,
  },
  // Return to Home button styling
  homeButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 20,
    alignSelf: 'center',
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    minWidth: 200,
  },
  homeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});