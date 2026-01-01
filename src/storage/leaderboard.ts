/**
 * Leaderboard Storage
 * Persists top 10 runs using AsyncStorage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { RunResult } from '../game/types';

const LEADERBOARD_KEY = '@breakpoint_defense_leaderboard';
const MAX_ENTRIES = 10;

export async function loadLeaderboard(): Promise<RunResult[]> {
  try {
    const json = await AsyncStorage.getItem(LEADERBOARD_KEY);
    if (json) {
      return JSON.parse(json);
    }
  } catch (e) {
    console.error('Failed to load leaderboard:', e);
  }
  return [];
}

export async function saveRun(run: RunResult): Promise<void> {
  try {
    const leaderboard = await loadLeaderboard();
    
    // Add new run
    leaderboard.push(run);
    
    // Sort by survival time (desc), then wave (desc), then kills (desc)
    leaderboard.sort((a, b) => {
      if (b.survivalTime !== a.survivalTime) {
        return b.survivalTime - a.survivalTime;
      }
      if (b.wave !== a.wave) {
        return b.wave - a.wave;
      }
      return b.kills - a.kills;
    });
    
    // Keep only top entries
    const trimmed = leaderboard.slice(0, MAX_ENTRIES);
    
    await AsyncStorage.setItem(LEADERBOARD_KEY, JSON.stringify(trimmed));
  } catch (e) {
    console.error('Failed to save run:', e);
  }
}

export async function clearLeaderboard(): Promise<void> {
  try {
    await AsyncStorage.removeItem(LEADERBOARD_KEY);
  } catch (e) {
    console.error('Failed to clear leaderboard:', e);
  }
}
