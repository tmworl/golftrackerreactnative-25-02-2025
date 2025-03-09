// src/navigation/MainNavigator.js

import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeStack from "./HomeStack";
import RoundsScreen from "../screens/RoundScreen";
import InsightsScreen from "../screens/InsightsScreen"; // Import the new InsightsScreen
import ProfileScreen from "../screens/ProfileScreen";
import Ionicons from "react-native-vector-icons/Ionicons";
import theme from "../ui/theme";

const Tab = createBottomTabNavigator();

/**
 * MainNavigator Component
 * 
 * Creates the bottom tab navigation for the app with four tabs:
 * - Home: For starting new rounds and seeing recent activity
 * - Rounds: For viewing completed rounds and scorecards
 * - Insights: For viewing AI-powered game analysis and improvement tips (New!)
 * - Profile: For user account settings
 */
export default function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        // Hide the tab-level header
        headerShown: false,

        // Set up the tab bar icons
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          // Define icons for each tab route
          if (route.name === "HomeTab") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Rounds") {
            iconName = focused ? "golf" : "golf-outline";
          } else if (route.name === "Insights") {
            // New icon for the Insights tab - a lightbulb
            iconName = focused ? "bulb" : "bulb-outline";
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline";
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        
        // Tab styling
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: "gray",
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{ tabBarLabel: "Home" }}
      />
      <Tab.Screen
        name="Rounds"
        component={RoundsScreen}
        options={{ tabBarLabel: "Rounds" }}
      />
      {/* New Insights Tab */}
      <Tab.Screen
        name="Insights"
        component={InsightsScreen}
        options={{ 
          tabBarLabel: "Insights",
          // Optional: Add a badge to draw attention to the new feature
          tabBarBadge: "New" 
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: "Profile" }}
      />
    </Tab.Navigator>
  );
}