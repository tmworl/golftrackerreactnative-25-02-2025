// src/navigation/HomeStack.js

import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "../screens/HomeScreen";
import CourseSelectorScreen from "../screens/CourseSelectorScreen";
import TrackerScreen from "../screens/TrackerScreen";
import ScorecardScreen from "../screens/ScorecardScreen";
import { headerConfig, getHeaderOptions } from "../ui/headerConfig";

const Stack = createStackNavigator();

/**
 * HomeStack Component
 * 
 * Creates the navigation stack for the home tab with consistent native headers:
 * - HomeScreen: Starting point with recent rounds and "Start New Round" button
 * - CourseSelectorScreen: For selecting a course
 * - TrackerScreen: For tracking shots during a round
 * - ScorecardScreen: For viewing detailed scorecard after completing a round
 * 
 * Key changes:
 * - Navigation flow is now more linear and focused
 * - TrackerScreen has customized navigation options to prevent accidental back navigation
 * - ScorecardScreen now provides a clear path back to home
 */
export default function HomeStack() {
  return (
    <Stack.Navigator 
      initialRouteName="HomeScreen"
      screenOptions={headerConfig}
    >
      <Stack.Screen 
        name="HomeScreen" 
        component={HomeScreen} 
        options={getHeaderOptions("Clubhouse")} 
      />
      
      <Stack.Screen 
        name="CourseSelector" 
        component={CourseSelectorScreen} 
        options={getHeaderOptions("Select Course")} 
      />
      
      <Stack.Screen 
        name="Tracker" 
        component={TrackerScreen} 
        options={({ navigation }) => ({
          ...getHeaderOptions("Round Tracker"),
          // Prevent going back directly from tracker without completing the round
          headerLeft: () => null,
          // Hide the tab bar during round tracking for a more focused experience
          tabBarVisible: false,
        })}
      />
      
      <Stack.Screen 
        name="ScorecardScreen" 
        component={ScorecardScreen} 
        options={({ navigation }) => ({
          ...getHeaderOptions("Scorecard"),
          // Prevent back navigation to the tracker screen
          headerLeft: () => null,
        })}
      />
    </Stack.Navigator>
  );
}