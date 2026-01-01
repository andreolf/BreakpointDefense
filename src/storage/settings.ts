/**
 * Settings Storage
 * Persists user preferences using AsyncStorage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { GameSettings } from '../game/types';

const SETTINGS_KEY = '@breakpoint_defense_settings';

const DEFAULT_SETTINGS: GameSettings = {
  soundEnabled: true,
  hapticsEnabled: true,
  showFps: false,
};

export async function loadSettings(): Promise<GameSettings> {
  try {
    const json = await AsyncStorage.getItem(SETTINGS_KEY);
    if (json) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(json) };
    }
  } catch (e) {
    console.error('Failed to load settings:', e);
  }
  return DEFAULT_SETTINGS;
}

export async function saveSettings(settings: GameSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
}
