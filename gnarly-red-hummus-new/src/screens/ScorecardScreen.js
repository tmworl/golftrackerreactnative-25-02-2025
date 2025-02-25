// src/screens/ScorecardScreen.js
import React, { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Layout from "../ui/Layout";
import theme from "../ui/theme";

export default function ScorecardScreen({ navigation }) {
  const [round, setRound] = useState(null);

  useEffect(() => {
    (async () => {
      const roundData = await AsyncStorage.getItem("currentRound");
      if (roundData) {
        setRound(JSON.parse(roundData));
      }
    })();
  }, []);

  return (
    <Layout>
      <View style={styles.container}>
        <Text style={styles.title}>Scorecard for {round?.course || "Unknown Course"}</Text>
        {/* Display aggregated shot details if available */}
        <Button title="Home" onPress={() => navigation.navigate("HomeScreen")} color={theme.colors.primary} />
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
    marginBottom: theme.spacing.large,
    textAlign: "center",
  },
});
