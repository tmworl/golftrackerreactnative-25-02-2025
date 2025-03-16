// src/services/roundservice.js

import { supabase } from "./supabase";

/**
 * Create a new round record in Supabase.
 * 
 * Database Schema (rounds):
 * - profile_id: uuid NOT NULL  (current user's profile ID)
 * - course_id: uuid NOT NULL   (ID of the course being played)
 * - is_complete: boolean NULL DEFAULT false
 * - score: integer  (player's score relative to par)
 * - gross_shots: integer  (total number of shots taken)
 * - date, created_at, updated_at default automatically
 * 
 * @param {string} profile_id - The current user's profile ID.
 * @param {string} course_id - The ID of the course.
 * @returns {object} The newly created round record.
 */
export const createRound = async (profile_id, course_id) => {
  console.log("[createRound] Attempting to create a new round", { profile_id, course_id });
  
  // Insert a new round record into the rounds table
  const { data, error } = await supabase
    .from("rounds")
    .insert({
      profile_id,
      course_id,
      is_complete: false, // New round is not complete
    })
    .select(); // Returns the inserted record(s)

  if (error) {
    console.error("[createRound] Error creating round:", error);
    throw error;
  }

  console.log("[createRound] Round created successfully:", data[0]);
  return data[0]; // Return the newly created round record
};

/**
 * Insert shot records for a given hole based on shotCounts.
 * 
 * Database Schema (shots):
 * - round_id: uuid NOT NULL  (round to which these shots belong)
 * - hole_number: integer NOT NULL
 * - shot_type: text NOT NULL (e.g., "Tee Shot", "Long Shot", etc.)
 * - result: text NOT NULL    (e.g., "On Target", "Slightly Off", "Recovery Needed")
 * - created_at defaults to now()
 * 
 * @param {string} round_id - The ID of the current round.
 * @param {number} hole_number - The current hole number.
 * @param {object} shotCounts - Object with shot counts per shot type and outcome.
 * @returns {array} The inserted shot records.
 */
export const insertShots = async (round_id, hole_number, shotCounts) => {
  console.log("[insertShots] Preparing to insert shots", { round_id, hole_number, shotCounts });
  
  // Build an array of shot records from shotCounts
  const shots = [];
  
  // Loop through each shot type in the shotCounts object
  // shotCounts structure example:
  // {
  //   "Tee Shot": { "On Target": 2, "Slightly Off": 1, "Recovery Needed": 0 },
  //   "Approach": { "On Target": 0, "Slightly Off": 2, "Recovery Needed": 1 },
  //   ...
  // }
  Object.keys(shotCounts).forEach((shotType) => {
    const outcomes = shotCounts[shotType];
    
    // Loop through each outcome for this shot type
    Object.keys(outcomes).forEach((result) => {
      const count = outcomes[result];
      
      // Add a shot record for each count
      for (let i = 0; i < count; i++) {
        shots.push({
          round_id,
          hole_number,
          shot_type: shotType,  // e.g., "Tee Shot", "Approach"
          result,               // e.g., "On Target", "Slightly Off"
        });
      }
    });
  });

  // If no shots to insert, return early
  if (shots.length === 0) {
    console.log("[insertShots] No shots to insert.");
    return [];
  }

  console.log("[insertShots] Inserting shots:", shots);

  // Insert the shots into the shots table
  const { data, error } = await supabase
    .from("shots")
    .insert(shots);

  if (error) {
    console.error("[insertShots] Error inserting shots:", error);
    throw error;
  }
  
  console.log("[insertShots] Shots inserted successfully:", data);
  return data;
};

/**
 * Complete a round by updating its is_complete flag and calculating final statistics.
 * This function:
 * 1. Counts the total shots taken during the round (gross_shots)
 * 2. Calculates the score relative to par
 * 3. Updates the round record with these values and marks it complete
 * 4. Triggers the Edge Function to generate AI insights for the completed round
 * 
 * @param {string} round_id - The ID of the round to complete.
 * @returns {object} The updated round record.
 */
export const completeRound = async (round_id) => {
  try {
    console.log("[completeRound] Calculating final statistics for round:", round_id);
    
    // 1. Get the course par value
    // First, get the course_id from the round
    const { data: roundData, error: roundError } = await supabase
      .from("rounds")
      .select("course_id, profile_id") // Now also get profile_id for the Edge Function
      .eq("id", round_id)
      .single();
      
    if (roundError) throw roundError;
    
    // Then get the par value for that course
    const { data: courseData, error: courseError } = await supabase
      .from("courses")
      .select("par")
      .eq("id", roundData.course_id)
      .single();
      
    if (courseError) throw courseError;
    
    const coursePar = courseData.par || 72; // Default to 72 if par is not set
    
    // 2. Count total shots for the round
    const { count: grossShots, error: countError } = await supabase
      .from("shots")
      .select("id", { count: "exact" })
      .eq("round_id", round_id);
      
    if (countError) throw countError;
    
    // 3. Calculate score relative to par
    const score = grossShots - coursePar;
    
    console.log("[completeRound] Statistics calculated:", {
      coursePar,
      grossShots,
      score
    });
    
    // 4. Update the round record with calculated values and mark as complete
    const { data, error } = await supabase
      .from("rounds")
      .update({ 
        is_complete: true,
        gross_shots: grossShots,
        score: score
      })
      .eq("id", round_id)
      .select();

    if (error) {
      console.error("[completeRound] Error completing round:", error);
      throw error;
    }

    console.log("[completeRound] Round completed successfully:", data);
    
    // 5. Now that the round is complete, trigger the Edge Function to generate insights
    // This is done asynchronously so we don't block the UI
    try {
      console.log("[completeRound] Triggering insights generation Edge Function");
      
      // Call the Edge Function with the user ID and round ID
      supabase.functions.invoke('analyze-golf-performance', {
        body: { 
          userId: roundData.profile_id,
          roundId: round_id
        }
      }).then(({ data: insightsData, error: insightsError }) => {
        if (insightsError) {
          console.error("[completeRound] Error from insights Edge Function:", insightsError);
        } else {
          console.log("[completeRound] Insights generated successfully:", insightsData);
          // Note: We're not storing the insights in the database yet
          // That will be implemented in a future update
        }
      }).catch(err => {
        console.error("[completeRound] Exception calling insights Edge Function:", err);
      });
      
      // Note: We're not awaiting this call, so it happens in the background
      // The function will continue to return the round data without waiting
      
    } catch (insightsError) {
      // If there's an error generating insights, log it but don't fail the round completion
      console.error("[completeRound] Failed to trigger insights generation:", insightsError);
      // The error is caught here so it doesn't affect the round completion process
    }

    // Return the updated round data regardless of insights generation status
    return data;
  } catch (error) {
    console.error("[completeRound] Error in complete round process:", error);
    throw error;
  }
};