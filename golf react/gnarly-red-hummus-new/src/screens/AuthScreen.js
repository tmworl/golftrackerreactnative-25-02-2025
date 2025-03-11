// src/screens/AuthScreen.js

import React, { useState, useContext, useEffect } from "react";
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator } from "react-native";
import { AuthContext } from "../context/AuthContext";

export default function AuthScreen({ navigation }) {
  // Retrieve auth state and methods from our context.
  const { user, loading, error, signIn, signUp, setError } = useContext(AuthContext);
  // isLogin toggles between "Sign In" and "Create Account" modes.
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // formError is for local validation errors (e.g., empty fields).
  const [formError, setFormError] = useState("");

  // When a user is authenticated, immediately navigate to the main app.
  useEffect(() => {
    if (user) {
      navigation.replace("Main");
    }
  }, [user, navigation]);

  // Validate that email and password are provided and meet basic criteria.
  const validateForm = () => {
    if (!email || !password) {
      setFormError("Please fill in all fields");
      return false;
    }
    if (password.length < 6) {
      setFormError("Password must be at least 6 characters");
      return false;
    }
    return true;
  };

  // On form submission, either call signIn or signUp based on the current mode.
  const handleSubmit = async () => {
    setFormError("");
    setError(null);
    if (!validateForm()) return;

    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
    } catch (err) {
      console.error("Authentication error:", err);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isLogin ? "Sign In" : "Create Account"}</Text>

      {formError ? <Text style={styles.error}>{formError}</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <Button title={isLogin ? "Sign In" : "Create Account"} onPress={handleSubmit} />
      )}

      <Button
        title={isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
        onPress={() => {
          setIsLogin(!isLogin);
          setFormError("");
          setError(null);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff"
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: "center"
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginVertical: 10,
    borderRadius: 5
  },
  error: {
    color: "red",
    textAlign: "center",
    marginBottom: 10
  }
});
