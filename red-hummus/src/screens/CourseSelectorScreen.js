// src/screens/CourseSelectorScreen.js

import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  StyleSheet,
  SafeAreaView
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Layout from "../ui/Layout";
import theme from "../ui/theme";
import { getAllCourses } from "../services/courseService";
import AppText from "../components/AppText";

/**
 * CourseSelectorScreen Component
 * 
 * This screen displays a list of available golf courses from the database
 * and allows the user to select one and a tee to play.
 */
export default function CourseSelectorScreen({ navigation }) {
  // State for courses and selection
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedTeeId, setSelectedTeeId] = useState(null);
  
  // Load all courses from the database when component mounts
  useEffect(() => {
    const loadCourses = async () => {
      try {
        setIsLoading(true);
        const coursesData = await getAllCourses();
        setCourses(coursesData);
      } catch (error) {
        console.error("Error loading courses:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadCourses();
  }, []);
  
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
        teeId: selectedTeeId,
        teeName: selectedTee.name,
        teeColor: selectedTee.color
      }));
      
      // Navigate to the tracker screen
      navigation.navigate("Tracker");
    } catch (error) {
      console.error("Error starting round:", error);
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
  
  return (
    <Layout>
      <SafeAreaView style={styles.container}>
        {/* Title */}
        <View style={styles.titleContainer}>
          <AppText variant="title" style={styles.title}>
            Select a Course
          </AppText>
        </View>
        
        {/* Course List */}
        <View style={styles.courseListContainer}>
          {isLoading ? (
            <ActivityIndicator size="large" color={theme.colors.primary} />
          ) : courses.length > 0 ? (
            <FlatList
              data={courses}
              renderItem={renderCourseItem}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.courseList}
            />
          ) : (
            <AppText variant="body" style={styles.noCoursesText}>
              No courses available. Please add courses to the database.
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