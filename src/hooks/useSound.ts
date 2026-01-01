/**
 * useSound Hook
 * Provides sound effects (stubbed for now)
 * TODO: Add actual sound assets
 */

import { useCallback, useMemo } from 'react';
import { Platform } from 'react-native';

// Conditionally import Audio (not available on web)
let Audio: any = null;
if (Platform.OS !== 'web') {
  try {
    Audio = require('expo-av').Audio;
  } catch (e) {
    console.log('Audio not available');
  }
}

interface SoundActions {
  playPlace: () => void;
  playUpgrade: () => void;
  playShoot: () => void;
  playHit: () => void;
  playKill: () => void;
  playGameOver: () => void;
}

export function useSound(enabled: boolean = true): SoundActions {
  const isAvailable = Platform.OS !== 'web' && Audio !== null;
  
  // Stub functions for now
  // TODO: Load actual sound files
  
  const playPlace = useCallback(() => {
    if (!enabled || !isAvailable) return;
    // TODO: Play tower placement sound
    console.log('[Sound] Tower placed');
  }, [enabled, isAvailable]);
  
  const playUpgrade = useCallback(() => {
    if (!enabled || !isAvailable) return;
    // TODO: Play upgrade sound
    console.log('[Sound] Tower upgraded');
  }, [enabled, isAvailable]);
  
  const playShoot = useCallback(() => {
    if (!enabled || !isAvailable) return;
    // TODO: Play shooting sound
  }, [enabled, isAvailable]);
  
  const playHit = useCallback(() => {
    if (!enabled || !isAvailable) return;
    // TODO: Play hit sound
  }, [enabled, isAvailable]);
  
  const playKill = useCallback(() => {
    if (!enabled || !isAvailable) return;
    // TODO: Play kill sound
  }, [enabled, isAvailable]);
  
  const playGameOver = useCallback(() => {
    if (!enabled || !isAvailable) return;
    // TODO: Play game over sound
    console.log('[Sound] Game over');
  }, [enabled, isAvailable]);
  
  return useMemo(() => ({
    playPlace,
    playUpgrade,
    playShoot,
    playHit,
    playKill,
    playGameOver,
  }), [playPlace, playUpgrade, playShoot, playHit, playKill, playGameOver]);
}

export default useSound;
