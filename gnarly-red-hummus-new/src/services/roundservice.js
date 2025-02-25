// src/services/roundService.js

import { supabase } from "./supabase";

/**
 * Create a new round record in Supabase.
 * 
 * Database Schema (rounds):
 * - profile_id: uuid NOT NULL  (current user's profile ID)
 * - course_id: uuid NOT NULL   (ID of the course being played)
 * - is_complete: boolean NULL DEFAULT false
 * - date, created_at, updated_at default automatically
 * 
 * @param {string} profile_id - The current user's profile ID.
 * @param {string} course_id - The ID of the course.
 * @returns {object} The newly created round record.
 */
export const createRound = async (profile_id, course_id) => {
  console.log("[createRound] Attempting to create a new round", { profile_id, course_id });
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
 * - round_id: uuid NOT NULL,  (round to which these shots belong)
 * - hole_number: integer NOT NULL,
 * - shot_type: text NOT NULL, (e.g., "drive", "iron", etc. — using lowercase keys)
 * - result: text NOT NULL,    (e.g., "Good", "Neutral", "Bad")
 * - created_at defaults to now()
 * 
 * @param {string} round_id - The ID of the current round.
 * @param {number} hole_number - The current hole number.
 * @param {object} shotCounts - Object with shot counts per shot type and outcome.
 *                              Expected format: 
 *                              {
 *                                drive: { Good: 0, Neutral: 0, Bad: 0 },
 *                                iron: { Good: 0, Neutral: 0, Bad: 0 },
 *                                chip: { Good: 0, Neutral: 0, Bad: 0 },
 *                                putt: { Good: 0, Neutral: 0, Bad: 0 }
 *                              }
 * @returns {array} The inserted shot records.
 */
export const insertShots = async (round_id, hole_number, shotCounts) => {
  console.log("[insertShots] Preparing to insert shots", { round_id, hole_number, shotCounts });
  // Build an array of shot records from shotCounts.
  const shots = [];
  Object.keys(shotCounts).forEach((shotType) => {
    const outcomes = shotCounts[shotType];
    Object.keys(outcomes).forEach((result) => {
      const count = outcomes[result];
      // For each shot count, push that many shot records.
      for (let i = 0; i < count; i++) {
        shots.push({
          round_id,
          hole_number,
          shot_type: shotType, // Use lowercase key (e.g., "drive")
          result,            // Outcome string (e.g., "Good", "Neutral", "Bad")
        });
      }
    });
  });

  if (shots.length === 0) {
    console.log("[insertShots] No shots to insert.");
    return [];
  }

  console.log("[insertShots] Inserting shots:", shots);
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
 * Mark a round as completed by updating its is_complete flag.
 * 
 * @param {string} round_id - The ID of the round to complete.
 * @returns {object} The updated round record.
 */
export const completeRound = async (round_id) => {
  console.log("[completeRound] Attempting to complete round with ID:", round_id);
  const { data, error } = await supabase
    .from("rounds")
    .update({ is_complete: true })
    .eq("id", round_id);

  if (error) {
    console.error("[completeRound] Error completing round:", error);
    throw error;
  }

  console.log("[completeRound] Round completed successfully:", data);
  return data;
};
