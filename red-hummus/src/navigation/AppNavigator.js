// src/navigation/AppNavigator.js

import React, { useContext } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import AuthScreen from "../screens/AuthScreen"; // New custom auth screen
import MainNavigator from "./MainNavigator";
import { AuthContext } from "../context/AuthContext";

const Stack = createStackNavigator();

export default function AppNavigator() {
  // Retrieve the current user from our global auth state.
  const { user } = useContext(AuthContext);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
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
