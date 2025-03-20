// src/services/courseService.js

import { supabase } from './supabase';

/**
 * Course Service
 * 
 * This service handles all interactions with the courses table in the database.
 * It provides functions for searching courses and getting course details.
 */

/**
 * Get all courses from the database
 * 
 * This function fetches all courses from the database with basic information
 * and tee options. It doesn't include the full hole data to keep the query lightweight.
 * 
 * @return {Promise<Array>} - Array of course objects
 */
export const getAllCourses = async () => {
  try {
    console.log('[courseService] Fetching all courses');
    
    // Query the database for all courses
    const { data, error } = await supabase
      .from('courses')
      .select('id, name, club_name, location, tees')
      .order('name');
    
    if (error) {
      console.error('[courseService] Error fetching courses:', error);
      throw error;
    }
    
    console.log('[courseService] Found courses:', data?.length);
    return data || [];
  } catch (error) {
    console.error('[courseService] Exception in getAllCourses:', error);
    return [];
  }
};

/**
 * Search for courses by name
 * 
 * @param {string} searchTerm - The search term to filter courses by name
 * @return {Promise<Array>} - Array of course objects matching the search
 */
export const searchCourses = async (searchTerm) => {
  try {
    // Validate search term
    if (!searchTerm || searchTerm.trim().length < 3) {
      return [];
    }
    
    console.log('[courseService] Searching for courses with term:', searchTerm);
    
    // Query the database for courses matching the search term
    const { data, error } = await supabase
      .from('courses')
      .select('id, name, club_name, location, tees')
      .ilike('name', `%${searchTerm.trim()}%`)
      .limit(10);
    
    if (error) {
      console.error('[courseService] Error searching courses:', error);
      throw error;
    }
    
    console.log('[courseService] Found courses:', data?.length);
    return data || [];
  } catch (error) {
    console.error('[courseService] Exception in searchCourses:', error);
    return [];
  }
};

/**
 * Get recently played courses for a user
 * 
 * @param {string} userId - The user's ID
 * @param {number} limit - Maximum number of courses to return
 * @return {Promise<Array>} - Array of recently played course objects
 */
export const getRecentCourses = async (userId, limit = 5) => {
  try {
    console.log('[courseService] Getting recent courses for user:', userId);
    
    // Query the database for recent rounds by the user
    const { data, error } = await supabase
      .from('rounds')
      .select('course_id, created_at')
      .eq('profile_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('[courseService] Error getting recent rounds:', error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      return [];
    }
    
    // Extract unique course IDs from the rounds
    const courseIds = [...new Set(data.map(round => round.course_id))];
    
    // Get course details for the found course IDs
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('id, name, club_name, location, tees')
      .in('id', courseIds);
    
    if (coursesError) {
      console.error('[courseService] Error getting course details:', coursesError);
      throw coursesError;
    }
    
    console.log('[courseService] Found recent courses:', courses?.length);
    return courses || [];
  } catch (error) {
    console.error('[courseService] Exception in getRecentCourses:', error);
    return [];
  }
};

/**
 * Get full course details by ID
 * 
 * @param {string} courseId - The course ID to fetch
 * @return {Promise<Object|null>} - The course object or null if not found
 */
export const getCourseById = async (courseId) => {
  try {
    console.log('[courseService] Getting course details for ID:', courseId);
    
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single();
    
    if (error) {
      console.error('[courseService] Error getting course details:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('[courseService] Exception in getCourseById:', error);
    return null;
  }
};