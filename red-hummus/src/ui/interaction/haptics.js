// src/ui/interaction/haptics.js
//
// Haptic feedback system for consistent tactile feedback
// Provides platform-specific implementations with throttling

import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import platform from './platform';

// Track the timestamp of the last haptic feedback
let lastHapticTimestamp = 0;

/**
 * Trigger haptic feedback with throttling to prevent overload
 * 
 * @param {string} pattern - The haptic pattern to use ('button', 'success', 'tap', etc.)
 * @param {string} intensity - Throttling intensity ('default' or 'aggressive')
 * @returns {boolean} - Whether the haptic was triggered (false if throttled)
 */
export const triggerHaptic = (pattern = 'button', intensity = 'default') => {
  // Get the current timestamp
  const now = Date.now();
  
  // Get the minimum interval from our platform configuration
  const minInterval = platform.throttling[intensity] || platform.throttling.default;
  
  // Check if we should throttle this feedback
  if (now - lastHapticTimestamp < minInterval) {
    return false;
  }
  
  // Get the platform-specific haptic configuration
  const hapticConfig = platform.haptics[pattern] || platform.haptics.button;
  const config = platform.select(hapticConfig);
  
  // Update the timestamp
  lastHapticTimestamp = now;
  
  // Trigger the appropriate haptic feedback
  try {
    if (Platform.OS === 'ios') {
      switch (config.type) {
        case 'impactLight':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case 'impactMedium':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case 'impactHeavy':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
        case 'selectionClick':
          Haptics.selectionAsync();
          break;
        case 'notificationSuccess':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case 'notificationWarning':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          break;
        case 'notificationError':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;
        default:
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } else if (Platform.OS === 'android') {
      // For Android, we map our patterns to Expo's haptic styles
      switch (config.type) {
        case 'effectClick':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case 'effectHeavyClick':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case 'effectTick':
          Haptics.selectionAsync();
          break;
        default:
          Haptics.selectionAsync();
      }
    }
    
    return true;
  } catch (error) {
    console.warn('Haptic feedback failed:', error);
    return false;
  }
};

/**
 * Create haptic handlers for common component events
 * 
 * @param {string} pattern - The haptic pattern to use
 * @param {string} intensity - Throttling intensity
 * @returns {Object} - Object with onPressIn and onPressOut handlers
 */
export const createHapticHandlers = (pattern = 'button', intensity = 'default') => {
  const hapticConfig = platform.haptics[pattern] || platform.haptics.button;
  const config = platform.select(hapticConfig);
  
  return {
    onPressIn: config.onPressIn ? () => triggerHaptic(pattern, intensity) : undefined,
    onPressOut: config.onPressOut ? () => triggerHaptic(pattern, intensity) : undefined,
  };
};

export default {
  triggerHaptic,
  createHapticHandlers,
};