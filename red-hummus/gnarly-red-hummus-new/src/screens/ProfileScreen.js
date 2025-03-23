// src/screens/ProfileScreen.js
import React, { useContext, useState } from "react";
import { View, Button, StyleSheet, Alert, ScrollView } from "react-native";
import { supabase } from "../services/supabase";
import { AuthContext } from "../context/AuthContext";
import Layout from "../ui/Layout";
import theme from "../ui/theme";
import AppText from "../components/AppText";

/**
 * ProfileScreen Component
 * 
 * Displays user information and provides account options.
 * 
 * Note: Title "Profile" is now in the navigation header instead of in-screen.
 */
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
          <AppText variant="subtitle" style={styles.responseSubtitle}>Claude Message:</AppText>
          <AppText variant="body" style={styles.responseValue}>{testResponse.claude_message}</AppText>
          <AppText variant="subtitle" style={styles.responseSubtitle}>Timestamp:</AppText>
          <AppText variant="body" style={styles.responseValue}>{testResponse.timestamp}</AppText>
        </View>
      );
    }
    
    // If we have the full Claude API response structure
    if (testResponse.response?.content?.[0]?.text) {
      return (
        <View>
          <AppText variant="subtitle" style={styles.responseSubtitle}>Claude Message:</AppText>
          <AppText variant="body" style={styles.responseValue}>{testResponse.response.content[0].text}</AppText>
          <AppText variant="subtitle" style={styles.responseSubtitle}>Model:</AppText>
          <AppText variant="body" style={styles.responseValue}>{testResponse.response.model}</AppText>
        </View>
      );
    }
    
    // Handle insights format if present
    if (testResponse.insights) {
      return (
        <View>
          <AppText variant="subtitle" style={styles.responseSubtitle}>Summary:</AppText>
          <AppText variant="body" style={styles.responseValue}>{testResponse.insights.summary}</AppText>
          {testResponse.insights.primary_issue && (
            <>
              <AppText variant="subtitle" style={styles.responseSubtitle}>Primary Issue:</AppText>
              <AppText variant="body" style={styles.responseValue}>{testResponse.insights.primary_issue}</AppText>
            </>
          )}
          {testResponse.insights.practice_focus && (
            <>
              <AppText variant="subtitle" style={styles.responseSubtitle}>Practice Focus:</AppText>
              <AppText variant="body" style={styles.responseValue}>{testResponse.insights.practice_focus}</AppText>
            </>
          )}
          {testResponse.insights.management_tip && (
            <>
              <AppText variant="subtitle" style={styles.responseSubtitle}>Management Tip:</AppText>
              <AppText variant="body" style={styles.responseValue}>{testResponse.insights.management_tip}</AppText>
            </>
          )}
        </View>
      );
    }
    
    // Fallback to JSON string
    return (
      <AppText 
        variant="caption" 
        style={styles.responseText}
      >
        {JSON.stringify(testResponse, null, 2)}
      </AppText>
    );
  };

  return (
    <Layout>
      <ScrollView contentContainerStyle={styles.container}>
        <AppText variant="body" style={styles.text}>
          Email: {user?.email}
        </AppText>
        
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
            <AppText variant="subtitle" style={styles.responseTitle}>
              Claude's Response:
            </AppText>
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
  text: {
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
    marginBottom: 10,
  },
  responseSubtitle: {
    marginTop: 8,
    marginBottom: 4,
    color: theme.colors.primary,
  },
  responseValue: {
    marginBottom: 8,
  },
  responseText: {
    fontFamily: 'monospace',
    fontSize: 12,
  }
});