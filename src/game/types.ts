// ============================================
// CORE GAME TYPES
// ============================================

export type TowerType = 'fast' | 'chain' | 'splash';
export type EnemyType = 'swarm' | 'tank' | 'miniboss';

export interface Position {
  x: number;
  y: number;
}

// Tower entity
export interface Tower {
  id: string;
  type: TowerType;
  slotIndex: number;
  position: Position;
  level: number; // 1-3
  lastFireTime: number;
  targetId: string | null;
}

// Enemy entity
export interface Enemy {
  id: string;
  type: EnemyType;
  position: Position;
  hp: number;
  maxHp: number;
  speed: number;
  reward: number;
  spawnTime: number;
  pathProgress?: number; // Progress along the path (0-1)
}

// Projectile entity
export interface Projectile {
  id: string;
  fromTowerId: string;
  towerType: TowerType;
  position: Position;
  targetId: string;
  damage: number;
  speed: number;
  level: number; // for chain/splash calculations
  chainCount?: number; // for chain tower
  hitEnemies?: string[]; // enemies already hit by this chain
}

// Tower slot on the lane
export interface TowerSlot {
  index: number;
  position: Position;
  tower: Tower | null;
  locked: boolean; // locked when time marker passes
}

// Tower configuration by type and level
export interface TowerConfig {
  name: string;
  cost: number;
  upgradeCost: number[];
  damage: number[];
  fireRate: number[]; // shots per second
  range: number;
  projectileSpeed: number;
  // Chain tower specific
  chainCount?: number;
  chainRadius?: number;
  chainDamageMultiplier?: number;
  // Splash tower specific
  splashRadius?: number;
}

// Enemy configuration
export interface EnemyConfig {
  hp: number;
  speed: number; // pixels per second
  reward: number;
}

// Game state
export interface GameState {
  running: boolean;
  paused: boolean;
  gameOver: boolean;
  time: number; // elapsed time in ms
  coins: number;
  baseHp: number;
  maxBaseHp: number;
  wave: number;
  kills: number;
  timeMarkerX: number; // the x position of the placement cutoff
  enemies: Enemy[];
  towers: Tower[];
  projectiles: Projectile[];
  slots: TowerSlot[];
}

// Run result for leaderboard
export interface RunResult {
  id: string;
  time: number; // survival time in seconds
  wave: number;
  kills: number;
  tier: string;
  date: number; // timestamp
}

// Tier thresholds
export type Tier = 'Attendee' | 'Builder' | 'Core Contributor' | 'Infra Guardian' | 'Conference Legend';

// Tower selection popup state
export interface TowerSelectState {
  visible: boolean;
  slotIndex: number | null;
}

// Settings
export interface Settings {
  soundEnabled: boolean;
  hapticEnabled: boolean;
}

