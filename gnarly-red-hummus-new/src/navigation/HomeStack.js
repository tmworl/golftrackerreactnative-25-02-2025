// src/navigation/HomeStack.js
import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "../screens/HomeScreen";
import CourseSelectorScreen from "../screens/CourseSelectorScreen";
import TrackerScreen from "../screens/TrackerScreen";
import ScorecardScreen from "../screens/ScorecardScreen"; // Optional screen

const Stack = createStackNavigator();

export default function HomeStack() {
  return (
    <Stack.Navigator initialRouteName="HomeScreen">
      <Stack.Screen 
        name="HomeScreen" 
        component={HomeScreen} 
        options={{ title: "Home" }} 
      />
      <Stack.Screen 
        name="CourseSelector" 
        component={CourseSelectorScreen} 
        options={{ title: "Select Course" }} 
      />
      <Stack.Screen 
        name="Tracker" 
        component={TrackerScreen} 
        options={{ title: "Round Tracker" }} 
      />
      <Stack.Screen 
        name="Scorecard" 
        component={ScorecardScreen} 
        options={{ title: "Scorecard" }} 
      />
    </Stack.Navigator>
  );
}
