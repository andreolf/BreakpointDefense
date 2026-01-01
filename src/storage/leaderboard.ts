/**
 * Leaderboard Storage
 * Saves and loads top 10 runs
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { RunResult } from '../game/types';

const STORAGE_KEY = '@breakpoint_defense_runs';
const MAX_RUNS = 10;

export async function saveRun(run: RunResult): Promise<void> {
  try {
    const existing = await loadRuns();
    
    // Add new run and sort by survival time (desc), then wave, then kills
    const updated = [...existing, run].sort((a, b) => {
      if (b.survivalTime !== a.survivalTime) return b.survivalTime - a.survivalTime;
      if (b.wave !== a.wave) return b.wave - a.wave;
      return b.kills - a.kills;
    });
    
    // Keep only top 10
    const trimmed = updated.slice(0, MAX_RUNS);
    
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch (error) {
    console.error('Failed to save run:', error);
  }
}

export async function loadRuns(): Promise<RunResult[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data) as RunResult[];
  } catch (error) {
    console.error('Failed to load runs:', error);
    return [];
  }
}

export async function clearRuns(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear runs:', error);
  }
}
