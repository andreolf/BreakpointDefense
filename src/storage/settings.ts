import AsyncStorage from '@react-native-async-storage/async-storage';
import { Settings } from '../game/types';

const SETTINGS_KEY = '@breakpoint_defense_settings';

const DEFAULT_SETTINGS: Settings = {
  soundEnabled: true,
  hapticEnabled: true,
};

/**
 * Load settings from storage
 */
export async function loadSettings(): Promise<Settings> {
  try {
    const data = await AsyncStorage.getItem(SETTINGS_KEY);
    if (!data) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
  } catch (error) {
    console.error('Failed to load settings:', error);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Save settings to storage
 */
export async function saveSettings(settings: Settings): Promise<void> {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save settings:', error);
  }
}

