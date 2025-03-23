// src/navigation/MainNavigator.js

import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import HomeStack from "./HomeStack";
import RoundsScreen from "../screens/RoundScreen";
import InsightsScreen from "../screens/InsightsScreen";
import ProfileScreen from "../screens/ProfileScreen";
import ScorecardScreen from "../screens/ScorecardScreen";
import Ionicons from "react-native-vector-icons/Ionicons";
import theme from "../ui/theme";
import { headerConfig, getHeaderOptions } from "../ui/headerConfig";

// Create stack navigators for each tab that needs nested navigation
const RoundsStack = createStackNavigator();
const InsightsStack = createStackNavigator();
const ProfileStack = createStackNavigator();

/**
 * RoundsStackScreen Component
 * 
 * Creates a stack navigator for the Rounds tab with consistent headers
 * This allows navigation from the rounds list to the scorecard view
 */
function RoundsStackScreen() {
  return (
    <RoundsStack.Navigator screenOptions={headerConfig}>
      <RoundsStack.Screen 
        name="RoundsScreen" 
        component={RoundsScreen} 
        options={getHeaderOptions("Your Rounds")}
      />
      <RoundsStack.Screen 
        name="ScorecardScreen" 
        component={ScorecardScreen} 
        options={getHeaderOptions("Scorecard")}
      />
    </RoundsStack.Navigator>
  );
}

/**
 * InsightsStackScreen Component
 * 
 * Creates a stack navigator for the Insights tab with consistent headers
 */
function InsightsStackScreen() {
  return (
    <InsightsStack.Navigator screenOptions={headerConfig}>
      <InsightsStack.Screen 
        name="InsightsScreen" 
        component={InsightsScreen}
        options={getHeaderOptions("Golf Insights")}
      />
    </InsightsStack.Navigator>
  );
}

/**
 * ProfileStackScreen Component
 * 
 * Creates a stack navigator for the Profile tab with consistent headers
 */
function ProfileStackScreen() {
  return (
    <ProfileStack.Navigator screenOptions={headerConfig}>
      <ProfileStack.Screen 
        name="ProfileScreen" 
        component={ProfileScreen}
        options={getHeaderOptions("Profile")}
      />
    </ProfileStack.Navigator>
  );
}

const Tab = createBottomTabNavigator();

/**
 * MainNavigator Component
 * 
 * Creates the bottom tab navigation for the app with four tabs:
 * - Home: For starting new rounds and seeing recent activity
 * - Rounds: For viewing completed rounds and scorecards
 * - Insights: For viewing AI-powered game analysis and improvement tips
 * - Profile: For user account settings
 */
export default function MainNavigator() {
  // Function to determine tab bar visibility based on the current screen
  const getTabBarVisibility = (route) => {
    // Get the name of the focused route in the stack
    const routeName = getFocusedRouteNameFromRoute(route);
    
    // Hide the tab bar for these specific screens
    if (routeName === 'CourseSelector' || routeName === 'Tracker' || routeName === 'ScorecardScreen') {
      return { display: 'none' };
    }
    
    // Otherwise, show the tab bar with default styling
    return undefined;
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        // Hide the tab-level header since each stack has its own headers
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
        options={({ route }) => ({
          tabBarLabel: "Clubhouse",
          // Dynamic tab bar styling based on current route
          tabBarStyle: getTabBarVisibility(route)
        })}
      />
      <Tab.Screen
        name="Rounds"
        component={RoundsStackScreen}
        options={{ tabBarLabel: "Rounds" }}
      />
      <Tab.Screen
        name="Insights"
        component={InsightsStackScreen}
        options={{ 
          tabBarLabel: "Insights",
          tabBarBadge: "New" 
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStackScreen}
        options={{ tabBarLabel: "Profile" }}
      />
    </Tab.Navigator>
  );
}