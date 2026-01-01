import { useRef, useCallback, useEffect } from 'react';
import { Platform } from 'react-native';

// Only import Audio on native platforms
let Audio: typeof import('expo-av').Audio | null = null;
if (Platform.OS !== 'web') {
  try {
    Audio = require('expo-av').Audio;
  } catch (e) {
    // Audio not available
  }
}

// TODO: Add actual sound assets
// For now, sounds are no-ops on all platforms

/**
 * Hook for managing game sounds (stubbed - no-op on all platforms)
 */
export function useSound(enabled: boolean) {
  // Initialize audio mode on native only
  useEffect(() => {
    if (Audio && Platform.OS !== 'web') {
      Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      }).catch(() => {
        // Audio mode setting failed
      });
    }
  }, []);

  const playSound = useCallback(async (soundName: string) => {
    if (!enabled) return;
    // TODO: Implement actual sound playback when assets are added
  }, [enabled]);

  return {
    playShoot: () => playSound('shoot'),
    playHit: () => playSound('hit'),
    playKill: () => playSound('kill'),
    playPlace: () => playSound('place'),
    playUpgrade: () => playSound('upgrade'),
    playGameOver: () => playSound('gameOver'),
  };
}
