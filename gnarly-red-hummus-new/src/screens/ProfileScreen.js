// src/screens/ProfileScreen.js
import React, { useContext, useState } from "react";
import { View, Text, Button, StyleSheet, Alert, ScrollView } from "react-native";
import { supabase } from "../services/supabase";
import { AuthContext } from "../context/AuthContext";
import Layout from "../ui/Layout";
import theme from "../ui/theme";

export default function ProfileScreen({ navigation }) {
  const { user, signOut } = useContext(AuthContext);
  const [testResponse, setTestResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  // Direct test function for Edge Function
  const testEdgeFunction = async () => {
    if (!user) {
      Alert.alert("Error", "No user logged in");
      return;
    }

    setLoading(true);
    try {
      console.log("Starting Claude API Edge Function test");

      // Call the Edge Function - no need to send any parameters
      // for our simple Hello World test
      const { data, error } = await supabase.functions.invoke(
        'analyze-golf-performance',
        {
          // We can leave the body empty since our simplified function
          // doesn't require any parameters
          body: {}
        }
      );
      
      // Check for errors from the function call itself
      if (error) {
        console.error("Edge Function error:", error);
        Alert.alert("Edge Function Error", JSON.stringify(error, null, 2));
        setTestResponse({ error });
        return;
      }
      
      console.log("Edge Function response:", data);
      
      // Store the response data for display
      setTestResponse(data);
      
      // Show a success alert with Claude's response
      if (data?.claude_message) {
        Alert.alert(
          "Test Successful", 
          `Claude responded with: ${data.claude_message}`
        );
      } else if (data?.response?.content?.[0]?.text) {
        // Handle the direct Claude API response format
        Alert.alert(
          "Test Successful", 
          `Claude responded with: ${data.response.content[0].text}`
        );
      } else if (data?.message) {
        // Handle simple message format
        Alert.alert(
          "Test Successful", 
          `Response: ${data.message}`
        );
      } else {
        Alert.alert(
          "Test Successful", 
          "Received response but no text found."
        );
      }
      
    } catch (error) {
      console.error("Test failed:", error);
      Alert.alert("Test Failed", error.message);
      setTestResponse({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  // Function to render a more readable response
  const renderFormattedResponse = () => {
    if (!testResponse) return null;
    
    // If we have a Claude message in the format from our edge function
    if (testResponse.claude_message) {
      return (
        <View>
          <Text style={styles.responseSubtitle}>Claude Message:</Text>
          <Text style={styles.responseValue}>{testResponse.claude_message}</Text>
          <Text style={styles.responseSubtitle}>Timestamp:</Text>
          <Text style={styles.responseValue}>{testResponse.timestamp}</Text>
        </View>
      );
    }
    
    // If we have the full Claude API response structure
    if (testResponse.response?.content?.[0]?.text) {
      return (
        <View>
          <Text style={styles.responseSubtitle}>Claude Message:</Text>
          <Text style={styles.responseValue}>{testResponse.response.content[0].text}</Text>
          <Text style={styles.responseSubtitle}>Model:</Text>
          <Text style={styles.responseValue}>{testResponse.response.model}</Text>
        </View>
      );
    }
    
    // Handle insights format if present
    if (testResponse.insights) {
      return (
        <View>
          <Text style={styles.responseSubtitle}>Summary:</Text>
          <Text style={styles.responseValue}>{testResponse.insights.summary}</Text>
          {testResponse.insights.primary_issue && (
            <>
              <Text style={styles.responseSubtitle}>Primary Issue:</Text>
              <Text style={styles.responseValue}>{testResponse.insights.primary_issue}</Text>
            </>
          )}
          {testResponse.insights.practice_focus && (
            <>
              <Text style={styles.responseSubtitle}>Practice Focus:</Text>
              <Text style={styles.responseValue}>{testResponse.insights.practice_focus}</Text>
            </>
          )}
          {testResponse.insights.management_tip && (
            <>
              <Text style={styles.responseSubtitle}>Management Tip:</Text>
              <Text style={styles.responseValue}>{testResponse.insights.management_tip}</Text>
            </>
          )}
        </View>
      );
    }
    
    // Fallback to JSON string
    return (
      <Text style={styles.responseText}>
        {JSON.stringify(testResponse, null, 2)}
      </Text>
    );
  };

  return (
    <Layout>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.text}>Email: {user?.email}</Text>
        
        {/* Test Edge Function Button */}
        <Button 
          title={loading ? "Testing..." : "Test Claude Hello World"} 
          onPress={testEdgeFunction} 
          color="#FF8800" 
          disabled={loading}
        />
        
        {/* Display test response if available */}
        {testResponse && (
          <View style={styles.responseContainer}>
            <Text style={styles.responseTitle}>Claude's Response:</Text>
            {renderFormattedResponse()}
          </View>
        )}
        
        <View style={styles.spacer} />
        
        <Button title="Sign Out" onPress={signOut} color={theme.colors.primary} />
      </ScrollView>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.medium,
    alignItems: "center",
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
  },
  responseContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    width: "100%",
    maxHeight: 300,
  },
  responseTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  responseSubtitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 8,
    marginBottom: 4,
    color: theme.colors.primary,
  },
  responseValue: {
    fontSize: 14,
    marginBottom: 8,
  },
  responseText: {
    fontSize: 12,
    fontFamily: "monospace",
  }
});