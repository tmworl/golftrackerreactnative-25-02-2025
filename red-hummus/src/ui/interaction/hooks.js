// src/ui/interaction/hooks.js
//
// Reusable interaction hooks for components
// Provides animation and haptic feedback logic

import { useRef, useCallback } from 'react';
import { Pressable, Platform } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring, 
  withTiming,
  Easing
} from 'react-native-reanimated';
import platform from './platform';
import haptics from './haptics';

/**
 * Hook for tactile button feedback
 * Provides animations and haptic feedback for button interactions
 * 
 * @param {string} feedbackPattern - The haptic pattern to use ('button', 'success', 'tap')
 * @param {Object} options - Additional configuration options
 * @returns {Object} - Animation values and event handlers
 */
export const useTactileFeedback = (feedbackPattern = 'button', options = {}) => {
  // Get platform-specific animation config
  const animConfig = platform.animations[feedbackPattern] || platform.animations.button;
  const config = platform.select(animConfig);
  
  // Set up animation values
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  
  // Create animated styles
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });
  
  // Handler for press in
  const handlePressIn = useCallback(() => {
    // Apply platform-specific animations
    if (platform.isIOS) {
      scale.value = withSpring(
        config.scale.pressed, 
        {
          stiffness: config.config.stiffness,
          damping: config.config.damping,
          mass: config.config.mass,
          overshootClamping: config.config.overshootClamping,
        }
      );
      opacity.value = withSpring(
        config.opacity.pressed,
        {
          stiffness: config.config.stiffness,
          damping: config.config.damping,
          mass: config.config.mass,
        }
      );
    } else {
      // For Android, use timing with Material easing
      scale.value = withTiming(
        config.scale.pressed, 
        {
          duration: config.config.duration,
          easing: Easing.bezier(0.4, 0.0, 0.2, 1), // Material standard easing
        }
      );
      opacity.value = withTiming(
        config.opacity.pressed,
        {
          duration: config.config.duration,
          easing: Easing.bezier(0.4, 0.0, 0.2, 1),
        }
      );
    }
    
    // Trigger haptic feedback
    haptics.triggerHaptic(feedbackPattern);
  }, [scale, opacity, config, feedbackPattern]);
  
  // Handler for press out
  const handlePressOut = useCallback(() => {
    // Apply platform-specific animations
    if (platform.isIOS) {
      scale.value = withSpring(
        config.scale.released,
        {
          stiffness: config.config.stiffness,
          damping: config.config.damping,
          mass: config.config.mass,
          overshootClamping: config.config.overshootClamping,
        }
      );
      opacity.value = withSpring(
        config.opacity.released,
        {
          stiffness: config.config.stiffness,
          damping: config.config.damping,
          mass: config.config.mass,
        }
      );
    } else {
      // For Android, use timing with Material easing
      scale.value = withTiming(
        config.scale.released,
        {
          duration: config.config.duration,
          easing: Easing.bezier(0.4, 0.0, 0.2, 1),
        }
      );
      opacity.value = withTiming(
        config.opacity.released,
        {
          duration: config.config.duration,
          easing: Easing.bezier(0.4, 0.0, 0.2, 1),
        }
      );
    }
  }, [scale, opacity, config]);
  
  // Create Android ripple config if applicable
  const androidRippleConfig = platform.isAndroid && config.useRipple ? {
    color: config.rippleColor || 'rgba(0, 0, 0, 0.12)',
    borderless: false,
    foreground: true,
  } : undefined;
  
  return {
    animatedStyle,
    handlePressIn,
    handlePressOut,
    androidRippleConfig,
    AnimatedPressable: Animated.createAnimatedComponent(Pressable),
  };
};

export default {
  useTactileFeedback,
};