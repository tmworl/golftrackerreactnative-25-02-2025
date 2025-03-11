// src/services/courseService.js

import { supabase } from "./supabase";

/**
 * findOrCreateCourse
 *
 * Checks the 'courses' table in Supabase to see if a course with the provided
 * business key (in this case, the normalized course name including tee info) exists.
 * If it exists, returns the course record with its UUID. Otherwise, inserts a new course record.
 *
 * @param {Object} courseData - An object with course details.
 *        Expected property:
 *          - name: Course name with tee details (e.g., "Pebble Beach (White Tees)")
 *
 * @returns {Promise<Object>} - The course record from Supabase, including the auto-generated UUID.
 *
 * @example
 * const courseData = { name: "Pebble Beach (White Tees)" };
 * const courseRecord = await findOrCreateCourse(courseData);
 */
export const findOrCreateCourse = async (courseData) => {
  // Normalize the course name for case-insensitive lookup.
  const normalizedName = courseData.name.toLowerCase();

  // 1. Query the courses table for an existing record.
  let { data: course, error } = await supabase
    .from("courses")
    .select("*")
    .eq("name", normalizedName)
    .single();

  // If there's an error other than a "not found" type error, throw it.
  if (error && error.code !== "PGRST116") {
    throw error;
  }

  if (course) {
    // Course exists; return the existing course record.
    return course;
  }

  // 2. (Optional: When integrating a third-party API, add the API call here to fetch additional details.)
  // For now, we proceed with the data we have.

  // 3. Insert a new course record into the courses table.
  const { data: newCourse, error: insertError } = await supabase
    .from("courses")
    .insert({
      name: normalizedName,
      // Optionally include other fields, e.g., location, yardages, etc.
    })
    .select()
    .single();

  if (insertError) {
    throw insertError;
  }

  return newCourse;
};
