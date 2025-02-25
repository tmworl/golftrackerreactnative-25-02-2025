// src/screens/ProfileScreen.js
import React, { useContext } from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { supabase } from "../services/supabase";
import { AuthContext } from "../context/AuthContext";
import Layout from "../ui/Layout";
import theme from "../ui/theme";

export default function ProfileScreen({ navigation }) {
  const { user, setUser } = useContext(AuthContext);

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
});
