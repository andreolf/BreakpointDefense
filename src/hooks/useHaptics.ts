/**
 * Haptics Hook
 * Provides haptic feedback on mobile, no-op on web
 */

import { Platform } from 'react-native';
import { useCallback } from 'react';

// Conditionally import expo-haptics
let Haptics: typeof import('expo-haptics') | null = null;
if (Platform.OS !== 'web') {
  Haptics = require('expo-haptics');
}

export function useHaptics() {
  const triggerLight = useCallback(() => {
    if (Haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, []);

  const triggerMedium = useCallback(() => {
    if (Haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, []);

  const triggerHeavy = useCallback(() => {
    if (Haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  }, []);

  const triggerSuccess = useCallback(() => {
    if (Haptics) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, []);

  const triggerError = useCallback(() => {
    if (Haptics) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, []);

  return {
    triggerLight,
    triggerMedium,
    triggerHeavy,
    triggerSuccess,
    triggerError,
  };
}
