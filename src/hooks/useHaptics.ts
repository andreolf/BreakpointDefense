import { useCallback } from 'react';
import { Platform } from 'react-native';

// Only import Haptics on native platforms
let Haptics: typeof import('expo-haptics') | null = null;
if (Platform.OS !== 'web') {
    try {
        Haptics = require('expo-haptics');
    } catch (e) {
        // Haptics not available
    }
}

/**
 * Hook for haptic feedback (no-op on web)
 */
export function useHaptics(enabled: boolean) {
    const light = useCallback(() => {
        if (enabled && Haptics && Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
    }, [enabled]);

    const medium = useCallback(() => {
        if (enabled && Haptics && Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
    }, [enabled]);

    const heavy = useCallback(() => {
        if (enabled && Haptics && Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        }
    }, [enabled]);

    const success = useCallback(() => {
        if (enabled && Haptics && Platform.OS !== 'web') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
    }, [enabled]);

    const warning = useCallback(() => {
        if (enabled && Haptics && Platform.OS !== 'web') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        }
    }, [enabled]);

    const error = useCallback(() => {
        if (enabled && Haptics && Platform.OS !== 'web') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
    }, [enabled]);

    return {
        light,
        medium,
        heavy,
        success,
        warning,
        error,
        // Convenience methods
        onTowerPlace: medium,
        onTowerUpgrade: success,
        onEnemyKill: light,
        onBaseDamage: warning,
        onGameOver: error,
    };
}
