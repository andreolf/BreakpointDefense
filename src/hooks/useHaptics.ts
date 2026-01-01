/**
 * useHaptics Hook
 * Provides haptic feedback with conditional execution
 */

import { useCallback, useMemo } from 'react';
import { Platform } from 'react-native';

// Conditionally import Haptics (not available on web)
let Haptics: any = null;
if (Platform.OS !== 'web') {
  try {
    Haptics = require('expo-haptics');
  } catch (e) {
    console.log('Haptics not available');
  }
}

interface HapticsActions {
  onTowerPlace: () => void;
  onTowerUpgrade: () => void;
  onEnemyKill: () => void;
  onGameOver: () => void;
  onButtonPress: () => void;
}

export function useHaptics(enabled: boolean = true): HapticsActions {
  const isAvailable = Platform.OS !== 'web' && Haptics !== null;
  
  const onTowerPlace = useCallback(() => {
    if (!enabled || !isAvailable) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (e) {}
  }, [enabled, isAvailable]);
  
  const onTowerUpgrade = useCallback(() => {
    if (!enabled || !isAvailable) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch (e) {}
  }, [enabled, isAvailable]);
  
  const onEnemyKill = useCallback(() => {
    if (!enabled || !isAvailable) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {}
  }, [enabled, isAvailable]);
  
  const onGameOver = useCallback(() => {
    if (!enabled || !isAvailable) return;
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch (e) {}
  }, [enabled, isAvailable]);
  
  const onButtonPress = useCallback(() => {
    if (!enabled || !isAvailable) return;
    try {
      Haptics.selectionAsync();
    } catch (e) {}
  }, [enabled, isAvailable]);
  
  return useMemo(() => ({
    onTowerPlace,
    onTowerUpgrade,
    onEnemyKill,
    onGameOver,
    onButtonPress,
  }), [onTowerPlace, onTowerUpgrade, onEnemyKill, onGameOver, onButtonPress]);
}

export default useHaptics;
