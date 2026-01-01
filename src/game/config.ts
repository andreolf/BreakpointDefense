/**
 * Game Configuration
 * Central place for all game constants, colors, and configurations
 */

import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// =============================================================================
// LAYOUT - Now with sidebar
// =============================================================================
export const SIDEBAR_WIDTH = 140;
export const GAME_WIDTH = SCREEN_WIDTH - SIDEBAR_WIDTH;
export const GAME_HEIGHT = SCREEN_HEIGHT * 0.85;
export const HUD_HEIGHT = SCREEN_HEIGHT * 0.08;

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
  
  // Range indicator
  rangeIndicator: 'rgba(153, 69, 255, 0.15)',
  rangeBorder: 'rgba(153, 69, 255, 0.4)',
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
    name: 'Validator',
    shortName: 'VAL',
    description: 'Fast attacks',
    icon: '⚡',
    cost: 50,
    range: 90,
    damage: [8, 12, 18],
    fireRate: [4, 5, 6],
    upgradeCost: [40, 80],
    color: COLORS.towerValidator,
    projectileColor: COLORS.solanaGreen,
  },
  jupiter: {
    name: 'Jupiter',
    shortName: 'JUP',
    description: 'Chains to 2',
    icon: '🪐',
    cost: 80,
    range: 85,
    damage: [15, 22, 32],
    fireRate: [1.5, 1.8, 2.2],
    upgradeCost: [60, 120],
    color: COLORS.towerJupiter,
    projectileColor: COLORS.chain,
    special: 'chain',
    chainCount: 2,
    chainRadius: 65,
    chainDamageReduction: 0.5,
  },
  tensor: {
    name: 'Tensor',
    shortName: 'TNS',
    description: 'Splash area',
    icon: '💎',
    cost: 100,
    range: 75,
    damage: [25, 40, 60],
    fireRate: [0.8, 1.0, 1.2],
    upgradeCost: [80, 150],
    color: COLORS.towerTensor,
    projectileColor: COLORS.solanaPink,
    special: 'splash',
    splashRadius: 40,
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
  speed: number;
  reward: number;
  damage: number;
  color: string;
  size: number;
  spawnWeight: number;
}

export const ENEMY_CONFIGS: Record<EnemyType, EnemyConfig> = {
  fud: {
    name: 'FUD',
    description: 'Fast, weak',
    icon: '😱',
    hp: 25,
    speed: 70,
    reward: 10,
    damage: 5,
    color: COLORS.enemyFud,
    size: 16,
    spawnWeight: 60,
  },
  rugpull: {
    name: 'Rug Pull',
    description: 'Slow, tanky',
    icon: '🧹',
    hp: 120,
    speed: 28,
    reward: 30,
    damage: 15,
    color: COLORS.enemyRugPull,
    size: 22,
    spawnWeight: 25,
  },
  congestion: {
    name: 'Congestion',
    description: 'Mini-boss',
    icon: '🚧',
    hp: 300,
    speed: 40,
    reward: 100,
    damage: 30,
    color: COLORS.enemyCongestion,
    size: 30,
    spawnWeight: 0,
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
  baseSpawnInterval: 2200,
  spawnIntervalDecay: 0.93,
  minSpawnInterval: 500,
  waveInterval: 15000,
  minibossInterval: 60000,
  
  // Scaling
  hpScalePerWave: 1.08,
  speedScalePerWave: 1.02,
  
  // Time marker - DISABLED for now (was confusing)
  timeMarkerEnabled: false,
  timeMarkerSpeed: 5,
  
  // Projectiles
  projectileSpeed: 320,
  projectileSize: 5,
  
  // Tower slots
  slotRadius: 22,
  towerOffsetFromPath: 48,
  
  // Max tower level
  maxTowerLevel: 3,
  
  // Path width for rendering
  pathWidth: 28,
};

// =============================================================================
// BIOME: BREAKPOINT CONFERENCE
// =============================================================================
export const BIOME = {
  name: 'Solana Breakpoint',
  tagline: 'Defend the Network',
  description: 'The biggest Solana conference is under attack!',
  spawnRateMultiplier: 1.2,
  enemySpeedMultiplier: 1.1,
  background: {
    primary: COLORS.bgDark,
    secondary: COLORS.bgCard,
    accent: COLORS.solanaPurple,
  },
};

// =============================================================================
// SNAKE-LIKE S-CURVE PATH - More turns for better tower coverage!
// =============================================================================
export interface PathPoint {
  x: number;  // Percentage of game width (0-1)
  y: number;  // Percentage of game height (0-1)
}

// More curvy snake path - multiple S-turns
export const PATH_WAYPOINTS: PathPoint[] = [
  { x: -0.05, y: 0.15 },   // Start off-screen
  { x: 0.08, y: 0.15 },    // Enter top-left
  { x: 0.18, y: 0.12 },    // Go up slightly
  { x: 0.28, y: 0.20 },    // Start first turn down
  { x: 0.35, y: 0.38 },    // First curve down
  { x: 0.28, y: 0.52 },    // Loop back left
  { x: 0.18, y: 0.58 },    // Continue left
  { x: 0.12, y: 0.70 },    // Turn down-left
  { x: 0.18, y: 0.82 },    // Turn right
  { x: 0.32, y: 0.88 },    // Go right along bottom
  { x: 0.48, y: 0.82 },    // Continue right, up slightly
  { x: 0.58, y: 0.68 },    // Curve up
  { x: 0.65, y: 0.50 },    // Middle section going up
  { x: 0.72, y: 0.35 },    // Continue up
  { x: 0.82, y: 0.28 },    // Near top-right
  { x: 0.92, y: 0.38 },    // Turn down toward base
  { x: 0.98, y: 0.50 },    // Approach base
  { x: 1.08, y: 0.50 },    // Base (off-screen)
];

// Convert percentage points to actual coordinates
export function getPathPoints(width: number, height: number): { x: number; y: number }[] {
  return PATH_WAYPOINTS.map(p => ({
    x: p.x * width,
    y: p.y * height,
  }));
}

// =============================================================================
// TOWER SLOT POSITIONS - More slots for the longer path
// =============================================================================
export interface TowerSlotConfig {
  pathProgress: number;
  side: 'top' | 'bottom';
}

// Tower slots positioned beside the path
export const TOWER_SLOT_CONFIGS: TowerSlotConfig[] = [
  { pathProgress: 0.06, side: 'bottom' },
  { pathProgress: 0.12, side: 'top' },
  { pathProgress: 0.20, side: 'bottom' },
  { pathProgress: 0.28, side: 'top' },
  { pathProgress: 0.36, side: 'bottom' },
  { pathProgress: 0.44, side: 'top' },
  { pathProgress: 0.52, side: 'bottom' },
  { pathProgress: 0.60, side: 'top' },
  { pathProgress: 0.68, side: 'bottom' },
  { pathProgress: 0.76, side: 'top' },
  { pathProgress: 0.84, side: 'bottom' },
  { pathProgress: 0.92, side: 'top' },
];

// =============================================================================
// SOLANA LOGOS & ICONS
// =============================================================================
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
