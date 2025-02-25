// src/screens/HomeScreen.js
import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import Layout from "../ui/Layout";

export default function HomeScreen({ navigation }) {
  return (
    <Layout>
      <View style={styles.center}>
        <Text style={styles.title}>Welcome to the Home Screen</Text>
        <Button title="Select Course" onPress={() => navigation.navigate("CourseSelector")} />
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
});
