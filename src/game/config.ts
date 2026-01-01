import { TowerConfig, EnemyConfig, TowerType, EnemyType } from './types';

// ============================================
// GAME CONFIGURATION
// ============================================

// Screen and lane dimensions (will be scaled)
export const GAME_WIDTH = 390;
export const GAME_HEIGHT = 700;

// S-Curve Path waypoints (enemies follow this path)
// Path goes from left spawn through S-curve to right base
export const PATH_WAYPOINTS = [
  { x: -20, y: 150 },      // Spawn point (off-screen left)
  { x: 60, y: 150 },       // Entry
  { x: 150, y: 150 },      // First straight
  { x: 250, y: 200 },      // Curve down
  { x: 320, y: 300 },      // Middle right
  { x: 280, y: 400 },      // Curve back
  { x: 180, y: 450 },      // Middle section
  { x: 100, y: 500 },      // Curve down-left
  { x: 100, y: 580 },      // Bottom left
  { x: 200, y: 620 },      // Curve to finish
  { x: 320, y: 620 },      // Approach base
  { x: 400, y: 620 },      // Base (off-screen right)
];

// Lane visual width
export const LANE_WIDTH = 50;

// Base position (end of path)
export const BASE_X = 360;
export const BASE_Y = 620;
export const BASE_HP = 20;

// Spawn position (start of path)
export const SPAWN_X = PATH_WAYPOINTS[0].x;
export const SPAWN_Y = PATH_WAYPOINTS[0].y;

// Tower slots positioned along the path
export const SLOT_COUNT = 10;
export const TOWER_SLOTS = [
  { x: 100, y: 120 },   // Near spawn, above path
  { x: 200, y: 180 },   // First curve area
  { x: 290, y: 250 },   // Right side upper
  { x: 350, y: 350 },   // Right side middle
  { x: 240, y: 420 },   // Center
  { x: 140, y: 480 },   // Left side
  { x: 60, y: 550 },    // Bottom left
  { x: 150, y: 590 },   // Bottom center-left
  { x: 250, y: 650 },   // Bottom center
  { x: 320, y: 580 },   // Near base
];

// Time marker (vertical line that moves down the path progress)
export const TIME_MARKER_SPEED = 0.008; // progress per second (0-1 scale)
export const TIME_MARKER_START = 0;

// Tower configurations
export const TOWER_CONFIGS: Record<TowerType, TowerConfig> = {
  fast: {
    name: 'Fast Turret',
    cost: 50,
    upgradeCost: [0, 75, 125],
    damage: [8, 12, 18],
    fireRate: [3, 4, 5],
    range: 90,
    projectileSpeed: 400,
  },
  chain: {
    name: 'Chain Tower',
    cost: 80,
    upgradeCost: [0, 100, 160],
    damage: [15, 22, 32],
    fireRate: [1.2, 1.5, 1.8],
    range: 100,
    projectileSpeed: 350,
    chainCount: 2,
    chainRadius: 60,
    chainDamageMultiplier: 0.6,
  },
  splash: {
    name: 'Splash Tower',
    cost: 100,
    upgradeCost: [0, 130, 200],
    damage: [25, 40, 60],
    fireRate: [0.7, 0.85, 1],
    range: 85,
    projectileSpeed: 280,
    splashRadius: 50,
  },
};

// Enemy configurations
export const ENEMY_CONFIGS: Record<EnemyType, EnemyConfig> = {
  swarm: {
    hp: 25,
    speed: 50,
    reward: 10,
  },
  tank: {
    hp: 120,
    speed: 22,
    reward: 30,
  },
  miniboss: {
    hp: 300,
    speed: 30,
    reward: 100,
  },
};

// Breakpoint biome modifiers
export const BIOME = {
  name: 'Solana Breakpoint',
  spawnRateMultiplier: 1.25,
  enemySpeedMultiplier: 1.1,
};

// Wave system
export const WAVE_DURATION = 20000;
export const BASE_SPAWN_INTERVAL = 2000;
export const MIN_SPAWN_INTERVAL = 400;
export const SPAWN_INTERVAL_DECAY = 0.92;

export const WAVE_COMPOSITIONS = [
  { swarm: 1, tank: 0, miniboss: 0 },
  { swarm: 0.9, tank: 0.1, miniboss: 0 },
  { swarm: 0.8, tank: 0.2, miniboss: 0 },
  { swarm: 0.7, tank: 0.3, miniboss: 0 },
  { swarm: 0.6, tank: 0.4, miniboss: 0 },
  { swarm: 0.5, tank: 0.5, miniboss: 0 },
  { swarm: 0.5, tank: 0.4, miniboss: 0.1 },
];

export const MINIBOSS_INTERVAL = 60000;
export const HP_SCALE_PER_WAVE = 1.08;
export const STARTING_COINS = 100;

export const TIER_THRESHOLDS = {
  'Attendee': 0,
  'Builder': 90,
  'Core Contributor': 180,
  'Infra Guardian': 300,
  'Conference Legend': 420,
};

// Colors - Solana themed
export const COLORS = {
  background: '#0D0D0D',
  
  // Path colors
  lane: '#1a1a2e',
  lanePath: '#14F195',
  laneStroke: '#14F195',
  
  // Slots
  slot: '#2d2d44',
  slotLocked: '#1a1a1a',
  slotAvailable: '#3d3d5c',
  
  // Towers - Solana gradient inspired
  towerFast: '#00D4FF',    // Cyan
  towerChain: '#FFD700',   // Gold
  towerSplash: '#9945FF',  // Solana purple
  
  // Enemies
  enemySwarm: '#FF4757',
  enemyTank: '#8B0000',
  enemyMiniboss: '#DC1FFF', // Solana pink
  
  // Projectiles
  projectile: '#FFFFFF',
  
  // UI - Solana brand colors
  primary: '#14F195',      // Solana green
  secondary: '#9945FF',    // Solana purple
  tertiary: '#DC1FFF',     // Solana pink
  text: '#FFFFFF',
  textDim: '#888888',
  danger: '#FF4757',
  gold: '#FFD700',
  
  // Base
  base: '#14F195',
  baseHurt: '#FF4757',
  
  // Time marker
  timeMarker: '#DC1FFF',
  
  // Background elements
  gridLine: '#14F195',
  gradientStart: '#0D0D0D',
  gradientMid: '#1a1a2e',
  gradientEnd: '#0f0f1a',
};
