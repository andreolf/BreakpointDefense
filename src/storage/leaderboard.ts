import AsyncStorage from '@react-native-async-storage/async-storage';
import { RunResult, Tier } from '../game/types';
import { TIER_THRESHOLDS } from '../game/config';

const LEADERBOARD_KEY = '@breakpoint_defense_leaderboard';
const MAX_ENTRIES = 10;

/**
 * Calculate tier based on survival time in seconds
 */
export function calculateTier(timeInSeconds: number): Tier {
  if (timeInSeconds >= TIER_THRESHOLDS['Conference Legend']) {
    return 'Conference Legend';
  }
  if (timeInSeconds >= TIER_THRESHOLDS['Infra Guardian']) {
    return 'Infra Guardian';
  }
  if (timeInSeconds >= TIER_THRESHOLDS['Core Contributor']) {
    return 'Core Contributor';
  }
  if (timeInSeconds >= TIER_THRESHOLDS['Builder']) {
    return 'Builder';
  }
  return 'Attendee';
}

/**
 * Get all leaderboard entries
 */
export async function getLeaderboard(): Promise<RunResult[]> {
  try {
    const data = await AsyncStorage.getItem(LEADERBOARD_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to load leaderboard:', error);
    return [];
  }
}

/**
 * Save a run result to the leaderboard
 * Keeps top 10, sorted by time > wave > kills
 */
export async function saveRunResult(
  time: number,
  wave: number,
  kills: number
): Promise<RunResult> {
  const timeInSeconds = Math.floor(time / 1000);
  
  const result: RunResult = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    time: timeInSeconds,
    wave,
    kills,
    tier: calculateTier(timeInSeconds),
    date: Date.now(),
  };
  
  try {
    const existing = await getLeaderboard();
    
    // Add new result and sort
    const updated = [...existing, result].sort((a, b) => {
      // Primary: time (descending)
      if (b.time !== a.time) return b.time - a.time;
      // Secondary: wave (descending)
      if (b.wave !== a.wave) return b.wave - a.wave;
      // Tertiary: kills (descending)
      return b.kills - a.kills;
    });
    
    // Keep only top 10
    const trimmed = updated.slice(0, MAX_ENTRIES);
    
    await AsyncStorage.setItem(LEADERBOARD_KEY, JSON.stringify(trimmed));
    
    return result;
  } catch (error) {
    console.error('Failed to save run result:', error);
    return result;
  }
}

/**
 * Clear all leaderboard data
 */
export async function clearLeaderboard(): Promise<void> {
  try {
    await AsyncStorage.removeItem(LEADERBOARD_KEY);
  } catch (error) {
    console.error('Failed to clear leaderboard:', error);
  }
}

