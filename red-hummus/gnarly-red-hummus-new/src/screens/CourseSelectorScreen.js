// src/screens/CourseSelectorScreen.js

import React, { useState, useEffect, useCallback, useContext } from "react";
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  StyleSheet,
  SafeAreaView,
  TextInput,
  Alert
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Layout from "../ui/Layout";
import theme from "../ui/theme";
import { getAllCourses, searchCourses, getRecentCourses } from "../services/courseService";
import AppText from "../components/AppText";
import SkeletonCourseCard from "../components/SkeletonCourseCard";
import { AuthContext } from "../context/AuthContext";

/**
 * CourseSelectorScreen Component
 * 
 * This screen displays a list of available golf courses from the database
 * and allows the user to select one and a tee to play.
 * Shows recently played courses by default, with search functionality.
 */
export default function CourseSelectorScreen({ navigation }) {
  // Get the current user from context
  const { user } = useContext(AuthContext);
  
  // State for courses and selection
  const [allCourses, setAllCourses] = useState([]);
  const [recentCourses, setRecentCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedTeeId, setSelectedTeeId] = useState(null);
  
  // Loading states
  const [isLoadingAll, setIsLoadingAll] = useState(true);
  const [isLoadingRecent, setIsLoadingRecent] = useState(true);
  
  // Search related state
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showSkeletons, setShowSkeletons] = useState(false);
  
  // Debounced search function to avoid too many API calls
  const debouncedSearch = useCallback(
    debounce(async (query) => {
      if (query.length >= 3) {
        setIsSearching(true);
        setShowSkeletons(true);
        
        try {
          const results = await searchCourses(query);
          setSearchResults(results);
        } catch (error) {
          console.error("Error searching courses:", error);
        } finally {
          setShowSkeletons(false);
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 400),
    []
  );
  
  // Load recent courses when component mounts
  useEffect(() => {
    const loadRecentCourses = async () => {
      if (!user) return;
      
      try {
        setIsLoadingRecent(true);
        const recentCoursesData = await getRecentCourses(user.id);
        console.log("Loaded recent courses:", recentCoursesData.length);
        setRecentCourses(recentCoursesData);
      } catch (error) {
        console.error("Error loading recent courses:", error);
      } finally {
        setIsLoadingRecent(false);
      }
    };
    
    loadRecentCourses();
  }, [user]);
  
  // Load all courses as a fallback when component mounts
  useEffect(() => {
    const loadAllCourses = async () => {
      try {
        setIsLoadingAll(true);
        const coursesData = await getAllCourses();
        setAllCourses(coursesData);
      } catch (error) {
        console.error("Error loading all courses:", error);
      } finally {
        setIsLoadingAll(false);
      }
    };
    
    loadAllCourses();
  }, []);
  
  // Effect to trigger search when query changes
  useEffect(() => {
    if (searchQuery.trim()) {
      setShowSkeletons(true);
      debouncedSearch(searchQuery);
    } else {
      setSearchResults([]);
      setShowSkeletons(false);
    }
  }, [searchQuery, debouncedSearch]);
  
  /**
   * Handle search query changes
   */
  const handleSearchChange = (text) => {
    setSearchQuery(text);
    if (text.trim().length < 3) {
      setSearchResults([]);
    }
  };
  
  /**
   * Clear search and results
   */
  const handleClearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
  };
  
  /**
   * Handle selecting a course
   */
  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
    setSelectedTeeId(null); // Reset tee selection
    
    // If there's only one tee, select it automatically
    if (course.tees && course.tees.length === 1) {
      setSelectedTeeId(course.tees[0].id);
    }
  };
  
  /**
   * Handle selecting a tee
   */
  const handleTeeSelect = (teeId) => {
    setSelectedTeeId(teeId);
  };
  
  /**
   * Start a round with the selected course and tee
   * Enhanced to ensure proper data flow and direct navigation to tracker
   */
  const handleStartRound = async () => {
    try {
      if (!selectedCourse || !selectedTeeId) {
        return;
      }
      
      // Get the selected tee object
      const selectedTee = selectedCourse.tees.find(tee => tee.id === selectedTeeId);
      
      if (!selectedTee) {
        console.error("Selected tee not found");
        return;
      }
      
      console.log("Starting round with:", {
        courseId: selectedCourse.id,
        courseName: selectedCourse.name,
        teeId: selectedTeeId,
        teeName: selectedTee.name
      });
      
      // Store the selected course and tee in AsyncStorage
      await AsyncStorage.setItem("selectedCourse", JSON.stringify({
        id: selectedCourse.id,
        name: selectedCourse.name,
        club_name: selectedCourse.club_name || "",
        location: selectedCourse.location || "",
        teeId: selectedTeeId,
        teeName: selectedTee.name,
        teeColor: selectedTee.color
      }));
      
      // Navigate directly to the tracker screen with replace
      // This removes the course selector from the back stack for a cleaner navigation flow
      navigation.replace("Tracker");
    } catch (error) {
      console.error("Error starting round:", error);
      Alert.alert("Error", "There was a problem starting your round. Please try again.");
    }
  };
  
  /**
   * Render a course item in the list
   */
  const renderCourseItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.courseItem,
        selectedCourse?.id === item.id && styles.selectedCourseItem
      ]}
      onPress={() => handleCourseSelect(item)}
    >
      <View style={styles.courseItemContent}>
        <AppText variant="body" bold style={styles.courseName}>
          {item.name}
        </AppText>
        
        {item.club_name && item.club_name !== item.name && (
          <AppText variant="body" style={styles.clubName}>
            {item.club_name}
          </AppText>
        )}
        
        <AppText variant="caption" style={styles.location}>
          {item.location}
        </AppText>
      </View>
    </TouchableOpacity>
  );
  
  /**
   * Render a tee option
   */
  const renderTeeOption = (tee) => (
    <TouchableOpacity
      key={tee.id}
      style={[
        styles.teeOption,
        selectedTeeId === tee.id && styles.selectedTeeOption
      ]}
      onPress={() => handleTeeSelect(tee.id)}
    >
      <View 
        style={[
          styles.teeColor,
          { backgroundColor: tee.color || "#CCCCCC" }
        ]} 
      />
      <View style={styles.teeInfo}>
        <AppText variant="body" style={styles.teeName}>
          {tee.name}
        </AppText>
        {tee.total_distance && (
          <AppText variant="caption">
            {tee.total_distance} yards
          </AppText>
        )}
      </View>
    </TouchableOpacity>
  );
  
  // Determine which courses to display based on search and recent courses
  let displayCourses = [];
  let isLoading = false;
  let showRecent = false;
  
  if (searchQuery.trim().length >= 3) {
    // If searching, show search results
    displayCourses = searchResults;
    isLoading = isSearching;
  } else if (recentCourses.length > 0) {
    // If not searching and has recent courses, show those
    displayCourses = recentCourses;
    isLoading = isLoadingRecent;
    showRecent = true;
  } else {
    // Fallback to all courses
    displayCourses = allCourses;
    isLoading = isLoadingAll;
  }
  
  return (
    <Layout>
      <SafeAreaView style={styles.container}>
        {/* Title */}
        <View style={styles.titleContainer}>
          <AppText variant="title" style={styles.title}>
            Select a Course
          </AppText>
        </View>
        
        {/* Search input */}
        <View style={styles.searchContainer}>
          <Ionicons 
            name="search" 
            size={20} 
            color="#666" 
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for a course..."
            value={searchQuery}
            onChangeText={handleSearchChange}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={handleClearSearch} style={styles.clearButton}>
              <Ionicons name="close-circle" size={18} color="#999" />
            </TouchableOpacity>
          )}
        </View>
        
        {/* Course List Section Header */}
        {!searchQuery.trim() && recentCourses.length > 0 && (
          <View style={styles.sectionHeader}>
            <AppText variant="subtitle" style={styles.sectionTitle}>
              Recently Played
            </AppText>
          </View>
        )}
        
        {/* Course List */}
        <View style={styles.courseListContainer}>
          {isLoading ? (
            /* Show loading indicators based on context */
            showSkeletons ? (
              // Show skeleton loaders while searching
              <View style={styles.skeletonContainer}>
                {[1, 2, 3, 4, 5].map(i => (
                  <SkeletonCourseCard key={`skeleton-${i}`} />
                ))}
              </View>
            ) : (
              <ActivityIndicator size="large" color={theme.colors.primary} />
            )
          ) : displayCourses.length > 0 ? (
            <FlatList
              data={displayCourses}
              renderItem={renderCourseItem}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.courseList}
            />
          ) : searchQuery.trim().length >= 3 ? (
            <AppText variant="body" style={styles.noCoursesText}>
              No courses found for "{searchQuery}". Try a different search term.
            </AppText>
          ) : (
            <AppText variant="body" style={styles.noCoursesText}>
              {showRecent ? 
                "No recently played courses found." :
                "No courses available."
              }
            </AppText>
          )}
        </View>
        
        {/* Tee Selection */}
        {selectedCourse && (
          <View style={styles.teeSelectionContainer}>
            <AppText variant="subtitle" style={styles.teeSelectionTitle}>
              Select Tee
            </AppText>
            
            <View style={styles.teesList}>
              {selectedCourse.tees && selectedCourse.tees.length > 0 ? (
                selectedCourse.tees.map(tee => renderTeeOption(tee))
              ) : (
                <AppText variant="body" style={styles.noTeesText}>
                  No tee information available for this course
                </AppText>
              )}
            </View>
          </View>
        )}
        
        {/* Start Round Button */}
        <TouchableOpacity
          style={[
            styles.startButton,
            (!selectedCourse || !selectedTeeId) && styles.disabledButton
          ]}
          onPress={handleStartRound}
          disabled={!selectedCourse || !selectedTeeId}
        >
          <AppText 
            variant="button" 
            color="#FFFFFF" 
            bold
          >
            Start Round
          </AppText>
        </TouchableOpacity>
      </SafeAreaView>
    </Layout>
  );
}

/**
 * Debounce helper function to limit search frequency
 */
function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  titleContainer: {
    marginBottom: 16,
    alignItems: 'center',
  },
  title: {
    marginBottom: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    padding: 4,
  },
  sectionHeader: {
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 16,
    color: '#555',
  },
  skeletonContainer: {
    paddingHorizontal: 4,
  },
  courseListContainer: {
    flex: 1,
  },
  courseList: {
    paddingBottom: 16,
  },
  courseItem: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedCourseItem: {
    borderColor: theme.colors.primary,
    borderWidth: 2,
  },
  courseItemContent: {
    flex: 1,
  },
  courseName: {
    marginBottom: 4,
  },
  clubName: {
    marginBottom: 4,
  },
  location: {
    color: "#666",
  },
  noCoursesText: {
    fontStyle: "italic",
    color: "#666",
    textAlign: "center",
    padding: 16,
  },
  teeSelectionContainer: {
    marginTop: 16,
    marginBottom: 16,
  },
  teeSelectionTitle: {
    marginBottom: 8,
  },
  teesList: {
    marginBottom: 8,
  },
  teeOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  selectedTeeOption: {
    borderColor: theme.colors.primary,
    borderWidth: 2,
  },
  teeColor: {
    width: 24,
    height: 24,
    borderRadius: 4,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  teeInfo: {
    flex: 1,
  },
  teeName: {
    fontWeight: "500",
    marginBottom: 2,
  },
  noTeesText: {
    fontStyle: "italic",
    color: "#666",
    textAlign: "center",
    padding: 8,
  },
  startButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
});