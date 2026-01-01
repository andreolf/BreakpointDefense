/**
 * Game Configuration
 * Central place for all game constants, colors, and configurations
 */

import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// =============================================================================
// LAYOUT
// =============================================================================
export const GAME_WIDTH = SCREEN_WIDTH;
export const GAME_HEIGHT = SCREEN_HEIGHT * 0.75;
export const HUD_HEIGHT = SCREEN_HEIGHT * 0.1;

// =============================================================================
// SOLANA BRAND COLORS
// =============================================================================
export const COLORS = {
  // Primary Solana palette
  solanaGreen: '#14F195',
  solanaPurple: '#9945FF',
  solanaPink: '#DC1FFF',
  solanaBlue: '#00D1FF',
  solanaTeal: '#19FB9B',
  
  // Dark theme backgrounds
  bgDark: '#0D0D0D',
  bgDarker: '#050505',
  bgCard: '#1A1A2E',
  bgCardLight: '#252542',
  
  // Gradients (as arrays for SVG)
  gradientPurplePink: ['#9945FF', '#DC1FFF'],
  gradientGreenTeal: ['#14F195', '#19FB9B'],
  gradientBluePurple: ['#00D1FF', '#9945FF'],
  
  // UI
  text: '#FFFFFF',
  textMuted: '#8B8B9A',
  textAccent: '#14F195',
  
  // Tower colors (ecosystem projects)
  towerValidator: '#14F195',      // Validators - Green
  towerPhantom: '#AB9FF2',        // Phantom wallet purple
  towerJupiter: '#FFA500',        // Jupiter orange
  towerTensor: '#00D1FF',         // Tensor blue
  towerMarinade: '#FF6B6B',       // Marinade red
  towerJito: '#9945FF',           // Jito purple
  
  // Enemy colors (threats)
  enemyFud: '#FF4444',            // FUD - Red
  enemyRugPull: '#8B0000',        // Rug pull - Dark red
  enemyCongestion: '#FFD700',     // Network congestion - Yellow
  enemyExploit: '#FF00FF',        // Exploit - Magenta
  enemyBear: '#4A4A4A',           // Bear market - Gray
  
  // Effects
  projectile: '#14F195',
  splash: 'rgba(20, 241, 149, 0.3)',
  chain: '#00D1FF',
  
  // Lane
  path: '#1A1A2E',
  pathBorder: '#9945FF',
  pathGlow: 'rgba(153, 69, 255, 0.3)',
  
  // Base
  base: '#14F195',
  baseGlow: 'rgba(20, 241, 149, 0.5)',
  
  // Health
  hpGood: '#14F195',
  hpMedium: '#FFD700',
  hpLow: '#FF4444',
};

// =============================================================================
// SOLANA ECOSYSTEM TOWERS
// =============================================================================
export type TowerType = 'validator' | 'jupiter' | 'tensor';

export interface TowerConfig {
  name: string;
  shortName: string;
  description: string;
  icon: string;
  cost: number;
  range: number;
  damage: number[];        // Per level
  fireRate: number[];      // Shots per second per level
  upgradeCost: number[];   // Cost to upgrade to level 2, 3
  color: string;
  projectileColor: string;
  special?: 'chain' | 'splash';
  chainCount?: number;
  chainRadius?: number;
  chainDamageReduction?: number;
  splashRadius?: number;
}

export const TOWER_CONFIGS: Record<TowerType, TowerConfig> = {
  validator: {
    name: 'Validator Node',
    shortName: 'VAL',
    description: 'High TPS attacks. Fast fire rate, consistent damage.',
    icon: '⚡',
    cost: 50,
    range: 120,
    damage: [8, 12, 18],
    fireRate: [4, 5, 6],
    upgradeCost: [40, 80],
    color: COLORS.towerValidator,
    projectileColor: COLORS.solanaGreen,
  },
  jupiter: {
    name: 'Jupiter Aggregator',
    shortName: 'JUP',
    description: 'Routes damage to multiple targets. Chains to nearby enemies.',
    icon: '🪐',
    cost: 80,
    range: 100,
    damage: [15, 22, 32],
    fireRate: [1.5, 1.8, 2.2],
    upgradeCost: [60, 120],
    color: COLORS.towerJupiter,
    projectileColor: COLORS.chain,
    special: 'chain',
    chainCount: 2,
    chainRadius: 80,
    chainDamageReduction: 0.5,
  },
  tensor: {
    name: 'Tensor Marketplace',
    shortName: 'TNS',
    description: 'NFT floor sweeper. Area damage on impact.',
    icon: '💎',
    cost: 100,
    range: 90,
    damage: [25, 40, 60],
    fireRate: [0.8, 1.0, 1.2],
    upgradeCost: [80, 150],
    color: COLORS.towerTensor,
    projectileColor: COLORS.solanaPink,
    special: 'splash',
    splashRadius: 50,
  },
};

// =============================================================================
// CRYPTO-THEMED ENEMIES
// =============================================================================
export type EnemyType = 'fud' | 'rugpull' | 'congestion';

export interface EnemyConfig {
  name: string;
  description: string;
  icon: string;
  hp: number;
  speed: number;           // Pixels per second
  reward: number;          // SOL reward on kill
  damage: number;          // Damage to base
  color: string;
  size: number;
  spawnWeight: number;     // Probability weight
}

export const ENEMY_CONFIGS: Record<EnemyType, EnemyConfig> = {
  fud: {
    name: 'FUD',
    description: 'Fear, Uncertainty, Doubt. Fast but weak.',
    icon: '😱',
    hp: 25,
    speed: 90,
    reward: 10,
    damage: 5,
    color: COLORS.enemyFud,
    size: 14,
    spawnWeight: 60,
  },
  rugpull: {
    name: 'Rug Pull',
    description: 'Slow but tanky scam attempt.',
    icon: '🧹',
    hp: 120,
    speed: 35,
    reward: 30,
    damage: 15,
    color: COLORS.enemyRugPull,
    size: 22,
    spawnWeight: 25,
  },
  congestion: {
    name: 'Network Congestion',
    description: 'Mini-boss. Heavy traffic clogging the network.',
    icon: '🚧',
    hp: 300,
    speed: 50,
    reward: 100,
    damage: 30,
    color: COLORS.enemyCongestion,
    size: 30,
    spawnWeight: 0, // Only spawned by timer
  },
};

// =============================================================================
// SOLANA TIER RANKS
// =============================================================================
export interface TierConfig {
  name: string;
  icon: string;
  minTime: number;
  color: string;
  description: string;
}

export const TIERS: TierConfig[] = [
  { name: 'Paper Hands', icon: '📄', minTime: 0, color: '#8B8B9A', description: 'Just getting started' },
  { name: 'Diamond Hands', icon: '💎', minTime: 90, color: COLORS.solanaBlue, description: 'Holding strong' },
  { name: 'Degen', icon: '🎰', minTime: 180, color: COLORS.solanaPurple, description: 'True believer' },
  { name: 'Whale', icon: '🐋', minTime: 300, color: COLORS.solanaPink, description: 'Major player' },
  { name: 'Satoshi', icon: '👑', minTime: 420, color: COLORS.solanaGreen, description: 'Legendary status' },
];

export function getTier(survivalTime: number): TierConfig {
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (survivalTime >= TIERS[i].minTime) {
      return TIERS[i];
    }
  }
  return TIERS[0];
}

// =============================================================================
// GAME BALANCE
// =============================================================================
export const GAME_CONFIG = {
  // Starting values
  startingSOL: 150,
  startingBaseHP: 100,
  
  // Spawning
  baseSpawnInterval: 2000,      // ms
  spawnIntervalDecay: 0.92,     // Multiplier per wave
  minSpawnInterval: 400,
  waveInterval: 15000,          // ms between waves
  minibossInterval: 60000,      // ms between minibosses
  
  // Scaling
  hpScalePerWave: 1.08,
  speedScalePerWave: 1.02,
  
  // Time marker (future-only placement)
  timeMarkerSpeed: 8,           // Pixels per second
  
  // Projectiles
  projectileSpeed: 400,         // Pixels per second
  projectileSize: 6,
  
  // Tower slots
  slotRadius: 28,
  
  // Max tower level
  maxTowerLevel: 3,
};

// =============================================================================
// BIOME: BREAKPOINT CONFERENCE
// =============================================================================
export const BIOME = {
  name: 'Solana Breakpoint',
  tagline: 'Defend the Network',
  description: 'The biggest Solana conference is under attack!',
  spawnRateMultiplier: 1.25,
  enemySpeedMultiplier: 1.1,
  background: {
    primary: COLORS.bgDark,
    secondary: COLORS.bgCard,
    accent: COLORS.solanaPurple,
  },
};

// =============================================================================
// S-CURVE PATH WAYPOINTS
// Defines the enemy path through the game area
// =============================================================================
export interface PathPoint {
  x: number;  // Percentage of game width (0-1)
  y: number;  // Percentage of game height (0-1)
}

// S-curve path from left to right
export const PATH_WAYPOINTS: PathPoint[] = [
  { x: -0.05, y: 0.3 },   // Start off-screen left
  { x: 0.15, y: 0.3 },    // Enter
  { x: 0.25, y: 0.25 },   // Curve up
  { x: 0.35, y: 0.15 },   // Top of first curve
  { x: 0.45, y: 0.25 },   // Coming down
  { x: 0.55, y: 0.5 },    // Middle
  { x: 0.65, y: 0.75 },   // Bottom of S
  { x: 0.75, y: 0.85 },   // Deep bottom
  { x: 0.85, y: 0.75 },   // Coming back up
  { x: 0.95, y: 0.5 },    // Approach base
  { x: 1.05, y: 0.5 },    // Base position (off-screen right)
];

// Convert percentage points to actual coordinates
export function getPathPoints(width: number, height: number): { x: number; y: number }[] {
  return PATH_WAYPOINTS.map(p => ({
    x: p.x * width,
    y: p.y * height,
  }));
}

// Tower slot positions along the path (as path progress 0-1)
export const TOWER_SLOT_POSITIONS = [0.12, 0.22, 0.32, 0.42, 0.52, 0.62, 0.72, 0.82, 0.92];

// =============================================================================
// SOLANA LOGOS & ICONS (SVG paths)
// =============================================================================
export const SOLANA_LOGO_PATH = 'M5.5 14.5L10 10L14.5 14.5M5.5 10L10 5.5L14.5 10M5.5 5.5L10 1L14.5 5.5';

// Famous Solana ecosystem icons
export const ECOSYSTEM_ICONS = {
  sol: '◎',
  phantom: '👻',
  jupiter: '🪐',
  tensor: '💎',
  marinade: '🥩',
  jito: '⚡',
  bonk: '🐕',
  wen: '🐱',
  drip: '💧',
};
