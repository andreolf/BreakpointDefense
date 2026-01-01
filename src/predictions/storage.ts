/**
 * Prediction Storage
 * Local storage for spectator prediction history and stats
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { PredictionStats, PredictionResult, TierPrediction } from '../live/types';

const PREDICTIONS_KEY = '@breakpoint_predictions';
const STATS_KEY = '@breakpoint_prediction_stats';

// =============================================================================
// STATS
// =============================================================================

const DEFAULT_STATS: PredictionStats = {
  totalPredictions: 0,
  correctPredictions: 0,
  currentStreak: 0,
  bestStreak: 0,
};

export async function getPredictionStats(): Promise<PredictionStats> {
  try {
    const data = await AsyncStorage.getItem(STATS_KEY);
    return data ? JSON.parse(data) : DEFAULT_STATS;
  } catch (err) {
    console.error('[Predictions] Failed to load stats:', err);
    return DEFAULT_STATS;
  }
}

export async function updatePredictionStats(correct: boolean): Promise<PredictionStats> {
  const stats = await getPredictionStats();
  
  stats.totalPredictions++;
  
  if (correct) {
    stats.correctPredictions++;
    stats.currentStreak++;
    if (stats.currentStreak > stats.bestStreak) {
      stats.bestStreak = stats.currentStreak;
    }
  } else {
    stats.currentStreak = 0;
  }
  
  try {
    await AsyncStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch (err) {
    console.error('[Predictions] Failed to save stats:', err);
  }
  
  return stats;
}

// =============================================================================
// PREDICTION HISTORY
// =============================================================================

export async function getPredictionHistory(): Promise<PredictionResult[]> {
  try {
    const data = await AsyncStorage.getItem(PREDICTIONS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error('[Predictions] Failed to load history:', err);
    return [];
  }
}

export async function savePredictionResult(result: PredictionResult): Promise<void> {
  try {
    const history = await getPredictionHistory();
    
    // Keep last 50 predictions
    history.unshift(result);
    if (history.length > 50) {
      history.pop();
    }
    
    await AsyncStorage.setItem(PREDICTIONS_KEY, JSON.stringify(history));
    
    // Update stats
    await updatePredictionStats(result.correct);
  } catch (err) {
    console.error('[Predictions] Failed to save result:', err);
  }
}

// =============================================================================
// SESSION PREDICTION TRACKING
// =============================================================================

// Store current prediction for a session (in memory during spectating)
const currentPredictions = new Map<string, TierPrediction>();

export function setCurrentPrediction(sessionId: string, prediction: TierPrediction): void {
  currentPredictions.set(sessionId, prediction);
}

export function getCurrentPrediction(sessionId: string): TierPrediction | null {
  return currentPredictions.get(sessionId) || null;
}

export function clearCurrentPrediction(sessionId: string): void {
  currentPredictions.delete(sessionId);
}

export function hasCurrentPrediction(sessionId: string): boolean {
  return currentPredictions.has(sessionId);
}

