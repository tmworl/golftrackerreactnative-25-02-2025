// src/ui/navigation/configs/tabBar.js
//
// Tab bar configuration factory
// Creates configuration objects for bottom tab navigators

import React from 'react';
import { Platform, Animated, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import navigationTheme from '../theme';
import Reanimated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming, 
  interpolateColor 
} from 'react-native-reanimated';

const { tokens, platform, getTabBarOptions, getTabBarVisibility } = navigationTheme;

/**
 * Animated tab bar icon with platform-specific animations
 * 
 * @param {string} name - Base name of the Ionicons icon
 * @param {boolean} focused - Whether the tab is focused
 * @param {string} color - Color to apply to the icon
 * @param {number} size - Size of the icon
 * @returns {React.Component} Animated Ionicons component
 */
const AnimatedTabBarIcon = ({ name, focused, color, size }) => {
  // Use the solid version when focused, outline when not
  const iconName = focused ? name : `${name}-outline`;
  
  if (Platform.OS === 'ios') {
    // iOS 18 uses subtle scale animations with springs
    const scale = useSharedValue(focused ? 1.05 : 1);
    
    // Update scale based on focus state
    React.useEffect(() => {
      scale.value = withSpring(
        focused ? 1.05 : 1, 
        {
          stiffness: tokens.animation.spring.tab.stiffness,
          damping: tokens.animation.spring.tab.damping,
          mass: tokens.animation.spring.tab.mass,
          overshootClamping: tokens.animation.spring.tab.overshootClamping,
        }
      );
    }, [focused, scale]);
    
    // Create animated style
    const animatedStyle = useAnimatedStyle(() => {
      return {
        transform: [{ scale: scale.value }],
      };
    });
    
    // Return animated icon for iOS
    return (
      <Reanimated.View style={animatedStyle}>
        <Ionicons name={iconName} size={size} color={color} />
      </Reanimated.View>
    );
  } else {
    // For Android, we use a simpler approach as the indicator handles most of the animation
    return <Ionicons name={iconName} size={size} color={color} />;
  }
};

/**
 * Material 3 contained indicator component for Android
 */
const MaterialIndicator = ({ state, descriptors, navigation, position }) => {
  if (Platform.OS !== 'android') return null;
  
  // Calculate interpolated values for the indicator position
  const translateX = Animated.multiply(
    position.interpolate({
      inputRange: [0, state.routes.length - 1],
      outputRange: [0, (state.routes.length - 1) * 100],
      extrapolate: 'clamp',
    }),
    Animated.divide(100, state.routes.length)
  );
  
  return (
    <Animated.View
      style={[
        styles.materialIndicator,
        {
          width: `${100 / state.routes.length}%`,
          transform: [{ translateX }],
        },
      ]}
    />
  );
};

// Styles for the Material indicator
const styles = StyleSheet.create({
  materialIndicator: {
    position: 'absolute',
    top: 8,
    height: tokens.spacing.tabBar.indicatorHeight,
    borderRadius: tokens.spacing.tabBar.indicatorRadius,
    backgroundColor: tokens.colors.indicator.background,
    marginHorizontal: '10%', // Creates some padding on the sides
  },
});

/**
 * Generate tab bar icon component
 * 
 * @param {string} name - Base name of the Ionicons icon
 * @returns {Function} Function that renders an animated icon
 */
const getTabBarIcon = (name) => ({ focused, color, size }) => {
  return <AnimatedTabBarIcon name={name} focused={focused} color={color} size={size} />;
};

/**
 * Get icon name mapping for the main tabs
 */
const getIconName = (routeName) => {
  switch (routeName) {
    case 'HomeTab':
      return 'home';
    case 'Rounds':
      return 'golf';
    case 'Insights':
      return 'bulb';
    case 'Profile':
      return 'person';
    default:
      return 'apps';
  }
};

/**
 * Create complete tab bar configuration for the main navigator
 * 
 * @param {Object} route - Current route object
 * @returns {Object} Tab bar configuration object
 */
const getTabBarConfig = (route) => {
  const baseName = route.name;
  
  return {
    // Convert route name to display name if needed
    tabBarLabel: baseName === 'HomeTab' ? 'Clubhouse' : baseName,
    
    // Generate appropriate icon based on route
    tabBarIcon: getTabBarIcon(getIconName(baseName)),
    
    // Apply consistent styling from tokens
    ...getTabBarOptions(route),
    
    // Control visibility based on child routes
    tabBarStyle: getTabBarVisibility(route),
    
    // Add badge for "new" features if needed (Insights tab)
    ...(baseName === 'Insights' ? {
      tabBarBadge: 'New',
    } : {}),
  };
};

/**
 * Create the full tab navigator screen options
 * 
 * @returns {Object} Screen options for tab navigator
 */
const getTabNavigatorScreenOptions = () => {
  return {
    // Hide the tab-level header since each stack has its own headers
    headerShown: false,
    
    // Add platform-specific tab bar rendering options
    tabBarActiveTintColor: tokens.colors.tint.tabBarActive,
    tabBarInactiveTintColor: tokens.colors.tint.tabBarInactive,
    
    // Material 3 indicator (only visible on Android)
    ...(Platform.OS === 'android' ? {
      // Add custom tab bar that includes the indicator
      tabBar: props => (
        <View style={{ position: 'relative' }}>
          <MaterialIndicator {...props} />
          {props.children}
        </View>
      ),
    } : {}),
    
    // Enhanced styling
    tabBarStyle: {
      height: tokens.spacing.tabBar.height,
      paddingBottom: tokens.spacing.tabBar.bottomInset,
      backgroundColor: tokens.colors.background.tabBar,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: tokens.colors.border.tabBar,
      ...tokens.elevation.tabBar,
    },
    
    // Enhanced label styling
    tabBarLabelStyle: {
      fontFamily: tokens.typography.tabBar.label.fontFamily,
      fontSize: tokens.typography.tabBar.label.fontSize,
      fontWeight: tokens.typography.tabBar.label.fontWeight,
      paddingBottom: Platform.OS === 'ios' ? 4 : 0, // Extra padding for iOS
    },
    
    // Item spacing
    tabBarItemStyle: {
      paddingVertical: tokens.spacing.tabBar.itemPadding,
    },
  };
};

export {
  getTabBarConfig,
  getTabNavigatorScreenOptions,
  MaterialIndicator, // Export for direct use
};