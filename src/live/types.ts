/**
 * Live Spectate Types
 * Shared types for real-time spectating
 */

// =============================================================================
// SNAPSHOT TYPES (compact data for streaming)
// =============================================================================

export interface EnemySnapshot {
  id: string;
  type: string;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
}

export interface TowerSnapshot {
  id: string;
  type: string;
  x: number;
  y: number;
  level: number;
  rangeLevel: number;
}

export interface GameSnapshot {
  time: number;           // Elapsed seconds
  wave: number;
  baseHp: number;
  maxBaseHp: number;
  kills: number;
  sol: number;
  enemies: EnemySnapshot[];
  towers: TowerSnapshot[];
  gameSpeed: number;
  gameOver: boolean;
  finalTier?: string;
}

// =============================================================================
// SESSION TYPES
// =============================================================================

export interface SessionInfo {
  id: string;
  alias: string;
  biome: string;
  time: number;
  wave: number;
  baseHp: number;
  viewerCount: number;
  status: 'live' | 'ended';
}

// =============================================================================
// MESSAGE TYPES
// =============================================================================

export interface ClientMessage {
  type: 'create_session' | 'update_snapshot' | 'end_session' | 
        'join_spectate' | 'leave_spectate' | 'get_sessions' |
        'submit_prediction';
  sessionId?: string;
  alias?: string;
  snapshot?: GameSnapshot;
  viewerId?: string;
  prediction?: string;
}

export interface ServerMessage {
  type: 'session_created' | 'sessions_list' | 'snapshot_update' | 
        'session_ended' | 'prediction_submitted' | 'predictions_summary' |
        'error';
  sessionId?: string;
  sessions?: SessionInfo[];
  snapshot?: GameSnapshot;
  finalTier?: string;
  predictions?: Record<string, number>;  // tier -> count
  message?: string;
}

// =============================================================================
// PREDICTION TYPES
// =============================================================================

export type TierPrediction = 
  | 'Attendee' 
  | 'Builder' 
  | 'Core Contributor' 
  | 'Infra Guardian' 
  | 'Conference Legend';

export const TIER_OPTIONS: TierPrediction[] = [
  'Attendee',
  'Builder',
  'Core Contributor',
  'Infra Guardian',
  'Conference Legend',
];

export interface PredictionResult {
  sessionId: string;
  predicted: TierPrediction;
  actual: string;
  correct: boolean;
  timestamp: number;
}

export interface PredictionStats {
  totalPredictions: number;
  correctPredictions: number;
  currentStreak: number;
  bestStreak: number;
}

