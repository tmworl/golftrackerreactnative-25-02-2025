// src/ui/interaction/index.js
//
// Main export hub for the interaction system
// Provides a unified API for platform-specific interactions

import platform from './platform';
import haptics from './haptics';
import hooks from './hooks';

// Re-export our core modules
export {
  platform,
  haptics,
};

// Re-export our hooks
export const useTactileFeedback = hooks.useTactileFeedback;

// Export a utility for quickly applying tactile feedback to buttons
export const withTactileFeedback = (Component, options = {}) => {
  return (props) => {
    const {
      animatedStyle,
      handlePressIn,
      handlePressOut,
      androidRippleConfig,
      AnimatedPressable,
    } = useTactileFeedback(options.pattern, options);
    
    return (
      <AnimatedPressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        android_ripple={androidRippleConfig}
        style={animatedStyle}
        {...props}
      >
        {typeof props.children === 'function' 
          ? props.children({ pressed: false }) 
          : props.children}
      </AnimatedPressable>
    );
  };
};

// Default export for simpler imports
export default {
  platform,
  haptics,
  useTactileFeedback,
  withTactileFeedback,
};