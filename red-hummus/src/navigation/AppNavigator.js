// src/navigation/AppNavigator.js

import React, { useContext } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import AuthScreen from "../screens/AuthScreen";
import MainNavigator from "./MainNavigator";
import { AuthContext } from "../context/AuthContext";

// Import our navigation styling system
import { createAppNavigatorScreenOptions } from "../ui/navigation/configs/appNavigator";

const Stack = createStackNavigator();

export default function AppNavigator() {
  // Preserve the existing authentication context integration
  const { user } = useContext(AuthContext);

  // Get styling configuration from our system
  const screenOptions = createAppNavigatorScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      {user ? (
        // If a user is authenticated, show the main app navigator.
        <Stack.Screen name="Main" component={MainNavigator} />
      ) : (
        // Otherwise, show our custom auth screen.
        <Stack.Screen name="Auth" component={AuthScreen} />
      )}
    </Stack.Navigator>
  );
}