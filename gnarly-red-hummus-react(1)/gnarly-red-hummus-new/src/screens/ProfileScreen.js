// src/screens/ProfileScreen.js
import React, { useContext } from "react";
import { View, Text, Button, StyleSheet, Alert } from "react-native";
import { supabase } from "../services/supabase";
import { AuthContext } from "../context/AuthContext";
import Layout from "../ui/Layout";
import theme from "../ui/theme";
import { getLatestInsights, generateInsights } from "../services/insightsService";

export default function ProfileScreen({ navigation }) {
  const { user, setUser } = useContext(AuthContext);

  // Test function for insights service
  const testInsightsService = async () => {
    try {
      // First test fetching existing insights
      const existingInsights = await getLatestInsights(user.id);
      console.log("Existing insights:", existingInsights);
      
      // Then test generating new insights
      const newInsights = await generateInsights(user.id);
      console.log("New insights generated:", newInsights);
      
      // Show success alert
      Alert.alert("Test Results", "Check console logs for detailed output");
    } catch (error) {
      console.error("Test failed:", error);
      Alert.alert("Test Failed", error.message);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigation.replace("AuthLoading");
  };

  return (
    <Layout>
      <View style={styles.container}>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.text}>Email: {user?.email}</Text>
        
        {/* Test button - will be removed after testing */}
        <Button 
          title="Test Insights Service" 
          onPress={testInsightsService} 
          color="#FF8800" 
        />
        
        <View style={styles.spacer} />
        
        <Button title="Sign Out" onPress={signOut} color={theme.colors.primary} />
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.medium,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    marginBottom: theme.spacing.medium,
  },
  text: {
    fontSize: 18,
    marginBottom: theme.spacing.small,
  },
  spacer: {
    height: 16,
  }
});