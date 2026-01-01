/**
 * Game Types
 * TypeScript interfaces for all game entities
 */

import { TowerType, EnemyType } from './config';

// =============================================================================
// ENTITIES
// =============================================================================

export interface Enemy {
  id: string;
  type: EnemyType;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  speed: number;
  reward: number;
  damage: number;
  pathProgress: number;  // 0-1 along the path
  size: number;
}

export interface Tower {
  id: string;
  type: TowerType;
  x: number;
  y: number;
  pathProgress: number;  // Where along path (0-1)
  level: number;         // 1-3
  lastFireTime: number;
  targetId: string | null;
}

export interface Projectile {
  id: string;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  targetId: string;
  damage: number;
  speed: number;
  towerId: string;
  towerType: TowerType;
}

// =============================================================================
// GAME STATE - Simplified without slots
// =============================================================================

export interface GameState {
  // Core state
  isRunning: boolean;
  isPaused: boolean;
  gameOver: boolean;
  
  // Time tracking
  startTime: number;
  elapsedTime: number;
  lastUpdateTime: number;
  
  // Wave management
  wave: number;
  spawnTimer: number;
  lastWaveTime: number;
  lastMinibossTime: number;
  spawnInterval: number;
  
  // Resources
  sol: number;
  
  // Base
  baseHp: number;
  maxBaseHp: number;
  
  // Entities - towers placed anywhere now
  enemies: Enemy[];
  towers: Tower[];
  projectiles: Projectile[];
  
  // Stats
  kills: number;
  damageDealt: number;
  solEarned: number;
}

// =============================================================================
// RUN RESULT (for leaderboard)
// =============================================================================

export interface RunResult {
  id: string;
  timestamp: number;
  survivalTime: number;
  wave: number;
  kills: number;
  solEarned: number;
  tierName: string;
  tierIcon: string;
}

// =============================================================================
// SETTINGS
// =============================================================================

export interface GameSettings {
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  showFps: boolean;
}
