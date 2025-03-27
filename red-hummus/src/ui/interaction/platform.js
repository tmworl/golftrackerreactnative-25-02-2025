// src/ui/interaction/platform.js
//
// Platform detection and configuration for interaction systems
// Provides platform-specific animation and haptic feedback values

import { Platform } from 'react-native';

// Constants for device detection
const IS_IOS = Platform.OS === 'ios';
const IS_ANDROID = Platform.OS === 'android';

/**
 * Animation configurations for different platforms
 * Based on iOS 18 and Material 3 specifications
 */
const animations = {
  // Button press animations
  button: {
    // iOS 18 prefers spring-based physics with less dramatic scale
    ios: {
      type: 'spring',
      scale: {
        pressed: 0.96, // Subtle scale reduction when pressed
        released: 1,   // Normal scale
      },
      opacity: {
        pressed: 0.8,  // Slight opacity change
        released: 1,   // Full opacity
      },
      config: {
        stiffness: 300,   // Higher stiffness for snappier response
        damping: 15,      // Balanced damping for minimal oscillation
        mass: 0.8,        // Slightly lower mass for faster response
        overshootClamping: false,
      },
      duration: 150,      // For timing-based fallbacks
    },
    // Material 3 uses precise timing and easing curves
    android: {
      type: 'timing',
      scale: {
        pressed: 0.98, // More subtle scale for Material 3
        released: 1,
      },
      opacity: {
        pressed: 0.9,  // Less opacity change than iOS
        released: 1,
      },
      config: {
        // Material 3 standard easing curve
        duration: 100,
      },
      // We'll implement ripples separately for Android
      useRipple: true,
      rippleColor: 'rgba(0, 0, 0, 0.12)', // Standard Material ripple opacity
    }
  },
  
  // We can add more interaction types here as we expand
  toggle: { /* toggle animation configs */ },
  swipe: { /* swipe gesture configs */ },
};

/**
 * Haptic feedback configurations
 * Maps interaction types to native feedback patterns
 */
const haptics = {
  // Button press haptics
  button: {
    ios: {
      // iOS uses impact feedback with light intensity for buttons
      type: 'impactLight',
      // Only trigger on press down, not release
      onPressIn: true,
      onPressOut: false,
    },
    android: {
      // Android uses EFFECT_CLICK for button presses
      type: 'effectClick',
      // Only trigger on press down, not release
      onPressIn: true,
      onPressOut: false,
    }
  },
  
  // Success feedback (e.g. completing a round)
  success: {
    ios: {
      type: 'notificationSuccess',
    },
    android: {
      type: 'effectHeavyClick',
    }
  },
  
  // Light tap feedback (less prominent than buttons)
  tap: {
    ios: {
      type: 'selectionClick',
    },
    android: {
      type: 'effectTick',
    }
  },
  
  // We can add more feedback patterns as needed
};

/**
 * Throttling configuration to prevent haptic overload
 */
const throttling = {
  // Minimum time in ms between haptic triggers
  default: 150,
  // More restrictive throttling for rapid interactions
  aggressive: 300,
};

/**
 * Get platform-specific configuration based on the current platform
 * Similar approach to our theme's platform.select
 */
const select = (config) => {
  if (IS_IOS && config.ios) {
    return config.ios;
  } else if (IS_ANDROID && config.android) {
    return config.android;
  }
  
  // Fallback to ios, then android, then provided default
  return config.default || config.ios || config.android;
};

export default {
  isIOS: IS_IOS,
  isAndroid: IS_ANDROID,
  animations,
  haptics,
  throttling,
  select,
};