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
  pathProgress: number;
  size: number;
}

export interface Tower {
  id: string;
  type: TowerType;
  x: number;
  y: number;
  pathProgress: number;
  level: number;           // 1-3 for damage/fire rate
  rangeLevel: number;      // 1-3 for range (separate upgrade!)
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
// SPECIAL ABILITIES
// =============================================================================

export interface Ability {
  id: string;
  name: string;
  icon: string;
  description: string;
  cooldown: number;        // Seconds
  lastUsedTime: number;    // -Infinity initially
}

// =============================================================================
// GAME STATE
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
  
  // Entities
  enemies: Enemy[];
  towers: Tower[];
  projectiles: Projectile[];
  
  // Abilities
  abilities: {
    bomb: { lastUsed: number };
    freeze: { lastUsed: number; active: boolean; endTime: number };
    airdrop: { lastUsed: number };
  };
  
  // Stats
  kills: number;
  damageDealt: number;
  solEarned: number;
}

// =============================================================================
// RUN RESULT
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
