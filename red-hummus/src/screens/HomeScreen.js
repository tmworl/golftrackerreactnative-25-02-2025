// src/screens/HomeScreen.js

import React, { useState, useEffect, useContext } from "react";
import { View, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from "react-native";
import Layout from "../ui/Layout";
import theme from "../ui/theme";
import { supabase } from "../services/supabase";
import { AuthContext } from "../context/AuthContext";
import InsightsSummaryCard from "../components/InsightsSummaryCard";
import { getLatestInsights } from "../services/insightsService";
import AppText from "../components/AppText";

/**
 * HomeScreen Component
 * 
 * This screen shows the insights summary card, "Start New Round" button 
 * and displays cards for recent completed rounds.
 * 
 * Note: Title is now in the navigation header instead of in-screen.
 */
export default function HomeScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const [recentRounds, setRecentRounds] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Add new state for insights
  const [insightsSummary, setInsightsSummary] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(true);

  // Fetch recent rounds when component mounts
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

  // New useEffect to fetch insights summary
  useEffect(() => {
    async function fetchInsightsSummary() {
      if (!user) return;
      
      try {
        setInsightsLoading(true);
        
        // Use our new service function to get just the summary
        const summary = await getLatestInsights(user.id, 'summary');
        console.log("Fetched insights summary:", summary);
        
        // Update state with the summary text
        setInsightsSummary(summary);
      } catch (error) {
        console.error("Error fetching insights summary:", error);
        // Set to null on error so we show the empty state
        setInsightsSummary(null);
      } finally {
        setInsightsLoading(false);
      }
    }
    
    fetchInsightsSummary();
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
          {/* Insights Summary Card */}
          <InsightsSummaryCard 
            summary={insightsSummary} 
            loading={insightsLoading} 
          />
          
          {/* Start New Round button */}
          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => navigation.navigate("CourseSelector")}
          >
            <AppText variant="button" color="#FFFFFF" semibold>
              Start New Round
            </AppText>
          </TouchableOpacity>
          
          <View style={styles.recentRoundsSection}>
            {/* Section title for Recent Rounds */}
            <AppText variant="subtitle" style={styles.sectionTitle}>Recent Rounds</AppText>
            
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
                      <AppText variant="body" semibold style={styles.courseName}>
                        {round.courseName}
                      </AppText>
                      <AppText variant="caption">
                        {new Date(round.date).toLocaleDateString()}
                      </AppText>
                    </View>
                    
                    {/* Stats row - only show for completed rounds */}
                    {round.isComplete && (
                      <View style={styles.cardStatsRow}>
                        {/* Gross shots (more prominent) */}
                        <View style={styles.statContainer}>
                          <AppText variant="subtitle" bold>
                            {round.grossShots !== null ? round.grossShots : "-"}
                          </AppText>
                          <AppText variant="caption">Total</AppText>
                        </View>
                        
                        {/* Divider */}
                        <View style={styles.statDivider} />
                        
                        {/* Score to par (less prominent) */}
                        <View style={styles.statContainer}>
                          <AppText
                            variant="body"
                            semibold
                            color={theme.colors.primary}
                          >
                            {round.score !== null 
                              ? (round.score > 0 ? `+${round.score}` : round.score) 
                              : "-"}
                          </AppText>
                          <AppText variant="caption">To Par</AppText>
                        </View>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <AppText 
                variant="secondary" 
                italic 
                style={styles.noDataText}
              >
                No rounds played yet. Start tracking your game!
              </AppText>
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
  recentRoundsSection: {
    width: "100%",
    marginTop: 24,
  },
  sectionTitle: {
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
    flex: 1,
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
  noDataText: {
    textAlign: "center",
    padding: 16,
  }
});