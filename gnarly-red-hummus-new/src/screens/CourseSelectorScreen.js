// src/screens/CourseSelectorScreen.js

import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Layout from "../ui/Layout";

const dummyCourse = { id: "550e8400-e29b-41d4-a716-446655440000", name: "Pebble Beach (White Tees)" };

export default function CourseSelectorScreen({ navigation }) {
  const selectCourse = async () => {
    // Store the dummy course data in AsyncStorage for testing.
    await AsyncStorage.setItem("selectedCourse", JSON.stringify(dummyCourse));
    navigation.navigate("Tracker");
  };

  return (
    <Layout>
      <View style={styles.center}>
        <Text style={styles.title}>Course Selector</Text>
        <Text style={styles.text}>Selected Course: {dummyCourse.name}</Text>
        <Button title="Select This Course and Start Round" onPress={selectCourse} />
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
  text: {
    fontSize: 18,
    marginBottom: 10,
  },
});
