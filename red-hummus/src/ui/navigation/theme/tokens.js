// src/ui/navigation/theme/tokens.js
//
// Navigation token system that defines the styling vocabulary for navigation
// Provides platform-specific values while referencing the core theme

import { Platform, Easing as RNEasing } from 'react-native';
import theme from '../../theme';
import platform from './platform';

/**
 * Navigation Token System
 * 
 * This system defines all visual tokens specific to navigation components
 * while leveraging the core theme system. It handles platform-specific
 * values and provides a consistent interface for the integration layer.
 */
const navigationTokens = {
  // Spacing tokens for navigation elements
  spacing: {
    // Header spacing tokens
    header: {
      height: platform.select({
        ios: 44,
        android: 56,
      }),
      paddingHorizontal: platform.select({
        ios: 16,
        android: 16,
      }),
      statusBarHeight: platform.getStatusBarHeight(),
      elevation: platform.select({
        ios: 0,
        android: 2, // Reduced from 4 for Material 3 compliance
      }),
    },
    
    // Tab bar spacing tokens
    tabBar: {
      height: platform.getTabBarHeight(),
      itemPadding: platform.select({
        ios: 6, // Increased from 4 for iOS 18 guidelines
        android: 8,
      }),
      iconMargin: platform.select({
        ios: 6, // Increased for better visual separation in iOS 18
        android: 4, // Material 3 recommends cleaner spacing
      }),
      bottomInset: platform.getBottomSpace(),
      // New properties for Material 3 contained indicator
      indicatorHeight: platform.select({
        ios: 0, // No indicator on iOS
        android: 32, // Material 3 specification
      }),
      indicatorRadius: platform.select({
        ios: 0,
        android: 16, // Pill shape for Material 3
      }),
    },
    
    // Screen content spacing
    screen: {
      paddingHorizontal: theme.spacing.medium,
    },
  },
  
  // Typography tokens for navigation elements
  typography: {
    // Header typography
    header: {
      title: {
        fontFamily: Platform.select({
          ios: 'System',
          android: 'Roboto',
          default: undefined,
        }),
        fontSize: platform.select({
          ios: 22, // Increased from 17 for iOS 18 guidelines
          android: 20,
        }),
        fontWeight: platform.select({
          ios: '600', // Semibold on iOS
          android: '500', // Medium on Android
        }),
        color: theme.colors.text,
      },
      backTitle: {
        fontFamily: Platform.select({
          ios: 'System',
          android: 'Roboto',
          default: undefined,
        }),
        fontSize: 17,
        fontWeight: '400',
        color: theme.colors.primary,
      },
    },
    
    // Tab bar typography
    tabBar: {
      label: {
        fontFamily: Platform.select({
          ios: 'System',
          android: 'Roboto',
          default: undefined,
        }),
        fontSize: platform.select({
          ios: 11, // Slightly increased for iOS 18
          android: 12,
        }),
        fontWeight: platform.select({
          ios: '500',
          android: '500', // Material 3 uses Medium for selected tabs
        }),
        activeColor: theme.colors.primary,
        inactiveColor: '#8E8E93',
      },
    },
  },
  
  // Color tokens for navigation elements
  colors: {
    // Background colors
    background: {
      header: platform.select({
        ios: '#FFFFFF',
        android: theme.colors.primary,
      }),
      tabBar: '#FFFFFF',
      card: '#FFFFFF',
      modal: '#FFFFFF',
    },
    
    // Border colors
    border: {
      header: platform.select({
        ios: '#C8C8CC',
        android: 'transparent',
      }),
      tabBar: '#E5E5E5', // Lighter for iOS 18 and Material 3
    },
    
    // Text and icon colors
    tint: {
      header: platform.select({
        ios: theme.colors.primary,
        android: '#FFFFFF',
      }),
      tabBarActive: theme.colors.primary,
      tabBarInactive: '#8E8E93',
    },
    
    // New: Tab indicator colors for Material 3
    indicator: {
      background: platform.select({
        ios: 'transparent', // No indicator on iOS
        android: 'rgba(0, 122, 255, 0.12)', // 12% primary color for container
      }),
    },
  },
  
  // Shadow and elevation tokens
  elevation: {
    header: platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2, // Reduced from 4 for Material 3
      },
    }),
    tabBar: platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -1 },
        shadowOpacity: 0.08, // Reduced for iOS 18's lighter aesthetic
        shadowRadius: 3,
      },
      android: {
        elevation: 4, // Material 3 recommendation for bottom navigation
      },
    }),
  },
  
  // Animation tokens for transitions
  animation: {
    timing: {
      // Standard animation duration
      standard: platform.select({
        ios: 350,
        android: 300,
      }),
      // Fast animation for small interactions
      fast: platform.select({
        ios: 200,
        android: 150,
      }),
    },
    // New: Spring configurations for iOS 18
    spring: {
      tab: {
        stiffness: 300,
        damping: 20,
        mass: 0.7,
        overshootClamping: false,
      },
    },
    // Material 3 easing functions - using actual functions now, not strings
    easing: {
      // Standard easing function (equivalent to cubic-bezier(0.2, 0.0, 0, 1.0))
      standard: Platform.OS === 'android' ? RNEasing.bezier(0.2, 0.0, 0, 1.0) : undefined,
      // Accelerated easing function (equivalent to cubic-bezier(0.3, 0.0, 1.0, 1.0))
      standardAccelerate: Platform.OS === 'android' ? RNEasing.bezier(0.3, 0.0, 1.0, 1.0) : undefined,
      // Decelerated easing function (equivalent to cubic-bezier(0.0, 0.0, 0.0, 1.0))
      standardDecelerate: Platform.OS === 'android' ? RNEasing.bezier(0.0, 0.0, 0.0, 1.0) : undefined,
      // Emphasized easing function (same as standard but used for emphasized animations)
      emphasized: Platform.OS === 'android' ? RNEasing.bezier(0.2, 0.0, 0, 1.0) : undefined,
    },
  },
};

export default navigationTokens;