// src/screens/HomeScreen.js

import React, { useState, useEffect, useContext } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from "react-native";
import Layout from "../ui/Layout";
import theme from "../ui/theme";
import { supabase } from "../services/supabase";
import { AuthContext } from "../context/AuthContext";

/**
 * HomeScreen Component
 * 
 * This screen shows a "Start New Round" button and displays cards for recent completed rounds.
 */
export default function HomeScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const [recentRounds, setRecentRounds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecentRounds() {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Fetch rounds including score and gross_shots if they exist
        const { data, error } = await supabase
          .from("rounds")
          .select(`
            id, 
            profile_id,
            course_id,
            created_at,
            score,
            gross_shots,
            is_complete
          `)
          .eq("profile_id", user.id)
          .order("created_at", { ascending: false })
          .limit(5);
          
        console.log("Rounds data:", data);
        
        if (error) {
          console.error("Error fetching rounds:", error);
          throw error;
        }
        
        if (data && data.length > 0) {
          // Get course information
          const courseIds = data.map(round => round.course_id);
          const { data: coursesData, error: coursesError } = await supabase
            .from("courses")
            .select("id, name")
            .in("id", courseIds);
            
          if (coursesError) {
            console.error("Error fetching courses:", coursesError);
          }
          
          // Map courses to rounds
          const coursesById = {};
          if (coursesData) {
            coursesData.forEach(course => {
              coursesById[course.id] = course;
            });
          }
          
          // Format data for display
          const formattedRounds = data.map(round => ({
            id: round.id,
            date: round.created_at,
            courseName: coursesById[round.course_id] ? coursesById[round.course_id].name : "Unknown Course",
            score: round.score,
            grossShots: round.gross_shots,
            isComplete: round.is_complete
          }));
          
          setRecentRounds(formattedRounds);
        } else {
          setRecentRounds([]);
        }
      } catch (error) {
        console.error("Error in fetchRecentRounds:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchRecentRounds();
  }, [user]);

  // Handle navigation to scorecard
  const handleRoundPress = (roundId) => {
    console.log("Round pressed:", roundId);
    navigation.navigate("ScorecardScreen", { roundId });
  };

  return (
    <Layout>
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={true}
      >
        <View style={styles.container}>
          <Text style={styles.title}>Golf Score Tracker</Text>
          
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => navigation.navigate("CourseSelector")}
          >
            <Text style={styles.buttonText}>Start New Round</Text>
          </TouchableOpacity>
          
          <View style={styles.recentRoundsSection}>
            <Text style={styles.sectionTitle}>Recent Rounds</Text>
            
            {loading ? (
              <ActivityIndicator size="large" color={theme.colors.primary} />
            ) : recentRounds.length > 0 ? (
              <View style={styles.roundsList}>
                {recentRounds.map((round) => (
                  <TouchableOpacity 
                    key={round.id} 
                    style={styles.roundCard}
                    onPress={() => handleRoundPress(round.id)}
                    activeOpacity={0.7}
                  >
                    {/* Course name and date row */}
                    <View style={styles.cardTopRow}>
                      <Text style={styles.courseName}>{round.courseName}</Text>
                      <Text style={styles.roundDate}>
                        {new Date(round.date).toLocaleDateString()}
                      </Text>
                    </View>
                    
                    {/* Stats row - only show for completed rounds */}
                    {round.isComplete && (
                      <View style={styles.cardStatsRow}>
                        {/* Gross shots (more prominent) */}
                        <View style={styles.statContainer}>
                          <Text style={styles.grossShotsValue}>
                            {round.grossShots !== null ? round.grossShots : "-"}
                          </Text>
                          <Text style={styles.statLabel}>Total</Text>
                        </View>
                        
                        {/* Divider */}
                        <View style={styles.statDivider} />
                        
                        {/* Score to par (less prominent) */}
                        <View style={styles.statContainer}>
                          <Text style={styles.scoreValue}>
                            {round.score !== null 
                              ? (round.score > 0 ? `+${round.score}` : round.score) 
                              : "-"}
                          </Text>
                          <Text style={styles.statLabel}>To Par</Text>
                        </View>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <Text style={styles.noDataText}>
                No rounds played yet. Start tracking your game!
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
    </Layout>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    alignItems: "center",
    padding: theme.spacing.medium,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
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
  recentRoundsSection: {
    width: "100%",
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  roundsList: {
    width: "100%",
  },
  roundCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cardStatsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  courseName: {
    fontSize: 16,
    fontWeight: "bold",
    flex: 1,
  },
  roundDate: {
    fontSize: 12,
    color: "#666",
  },
  statContainer: {
    alignItems: "center",
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: "#e0e0e0",
  },
  grossShotsValue: {
    fontSize: 20,
    fontWeight: "bold",
  },
  scoreValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: theme.colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  noDataText: {
    textAlign: "center",
    padding: 16,
    color: "#666",
    fontStyle: "italic",
  }
});