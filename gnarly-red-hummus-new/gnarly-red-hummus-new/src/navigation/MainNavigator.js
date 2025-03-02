// src/navigation/MainNavigator.js

import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeStack from "./HomeStack";
import RoundsScreen from "../screens/RoundScreen";
import ProfileScreen from "../screens/ProfileScreen";
import Ionicons from "react-native-vector-icons/Ionicons";
import theme from "../ui/theme";

const Tab = createBottomTabNavigator();

/**
 * MainNavigator Component
 * 
 * Creates the bottom tab navigation for the app with three tabs:
 * - Home: For starting new rounds and seeing recent activity
 * - Rounds: For viewing completed rounds and scorecards
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

          if (route.name === "HomeTab") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Rounds") {
            iconName = focused ? "golf" : "golf-outline";
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
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: "Profile" }}
      />
    </Tab.Navigator>
  );
}