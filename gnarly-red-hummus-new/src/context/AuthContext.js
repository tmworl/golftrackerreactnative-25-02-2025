// src/context/AuthContext.js

import React, { createContext, useState, useEffect } from "react";
import { supabase } from "../services/supabase";

// Create an authentication context
export const AuthContext = createContext();

// AuthProvider wraps the entire app and provides auth state and functions
export const AuthProvider = ({ children }) => {
  // 'user' holds the currently authenticated user, or null if not authenticated.
  const [user, setUser] = useState(null);
  // 'loading' tracks whether an auth operation is in progress.
  const [loading, setLoading] = useState(true);
  // 'error' stores any error messages from auth operations.
  const [error, setError] = useState(null);

  // On mount, check if a session already exists.
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data?.session?.user || null);
      setLoading(false);
    });

    // Subscribe to auth state changes. This ensures our UI always reflects the latest auth state.
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    // Clean up the subscription when the component unmounts.
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // signIn: Calls Supabase to sign in with email and password.
  const signIn = async (email, password) => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
    } else {
      setUser(data.user);
    }
    setLoading(false);
  };

  // signUp: Calls Supabase to create a new account.
  // Note: You can adjust the emailRedirectTo option based on your native environment.
  const signUp = async (email, password) => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: "exp://127.0.0.1:19000" // Update this to match your local/native URL if needed
      }
    });
    if (error) {
      setError(error.message);
    } else {
      // Depending on your Supabase settings, the user might be returned immediately
      // or require email confirmation. Adjust as needed.
      setUser(data.user);
    }
    setLoading(false);
  };

  // signOut: Calls Supabase to end the session.
  const signOut = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      setError(error.message);
    } else {
      setUser(null);
    }
    setLoading(false);
  };

  // Provide the state and functions to any child component.
  return (
    <AuthContext.Provider value={{ user, loading, error, signIn, signUp, signOut, setError }}>
      {children}
    </AuthContext.Provider>
  );
};
