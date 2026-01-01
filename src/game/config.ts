/**
 * Game Configuration
 */

import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// =============================================================================
// LAYOUT
// =============================================================================
export const SIDEBAR_WIDTH = 220;
export const GAME_WIDTH = SCREEN_WIDTH - SIDEBAR_WIDTH;
export const GAME_HEIGHT = SCREEN_HEIGHT;

// =============================================================================
// COLORS
// =============================================================================
export const COLORS = {
  solanaGreen: '#14F195',
  solanaPurple: '#9945FF',
  solanaPink: '#DC1FFF',
  solanaBlue: '#00D1FF',
  
  bgDark: '#0D0D0D',
  bgDarker: '#050505',
  bgCard: '#1A1A2E',
  bgCardLight: '#252542',
  
  text: '#FFFFFF',
  textMuted: '#8B8B9A',
  
  towerValidator: '#14F195',
  towerJupiter: '#FFA500',
  towerTensor: '#00D1FF',
  
  enemyFud: '#FF4444',
  enemyRugPull: '#8B0000',
  enemyCongestion: '#FFD700',
  
  hpGood: '#14F195',
  hpMedium: '#FFD700',
  hpLow: '#FF4444',
};

// =============================================================================
// TOWERS
// =============================================================================
export type TowerType = 'validator' | 'jupiter' | 'tensor';

export interface TowerConfig {
  name: string;
  icon: string;
  description: string;
  cost: number;
  rangeLevels: number[];
  damage: number[];
  fireRate: number[];
  upgradeCost: number[];
  rangeUpgradeCost: number[];
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
    icon: '⚡',
    description: 'Fast attacks',
    cost: 50,
    rangeLevels: [80, 100, 130],
    damage: [8, 14, 22],
    fireRate: [4, 5, 6],
    upgradeCost: [35, 70],
    rangeUpgradeCost: [25, 50],
    color: COLORS.towerValidator,
    projectileColor: COLORS.solanaGreen,
  },
  jupiter: {
    name: 'Jupiter',
    icon: '🪐',
    description: 'Chain to 2 enemies',
    cost: 80,
    rangeLevels: [75, 95, 120],
    damage: [15, 24, 36],
    fireRate: [1.5, 2, 2.5],
    upgradeCost: [50, 100],
    rangeUpgradeCost: [35, 70],
    color: COLORS.towerJupiter,
    projectileColor: COLORS.solanaBlue,
    special: 'chain',
    chainCount: 2,
    chainRadius: 60,
    chainDamageReduction: 0.5,
  },
  tensor: {
    name: 'Tensor',
    icon: '💎',
    description: 'Splash damage',
    cost: 100,
    rangeLevels: [70, 90, 115],
    damage: [25, 42, 65],
    fireRate: [0.8, 1.1, 1.4],
    upgradeCost: [70, 130],
    rangeUpgradeCost: [45, 90],
    color: COLORS.towerTensor,
    projectileColor: COLORS.solanaPink,
    special: 'splash',
    splashRadius: 40,
  },
};

// =============================================================================
// ENEMIES
// =============================================================================
export type EnemyType = 'fud' | 'rugpull' | 'congestion';

export interface EnemyConfig {
  name: string;
  hp: number;
  speed: number;
  reward: number;
  damage: number;
  color: string;
  size: number;
  spawnWeight: number;
  face: string;        // Solana personality emoji/avatar
  description: string; // Who they are
}

export const ENEMY_CONFIGS: Record<EnemyType, EnemyConfig> = {
  fud: {
    name: 'FUD Spreader',
    hp: 25,
    speed: 55,
    reward: 10,
    damage: 5,
    color: COLORS.enemyFud,
    size: 18,
    spawnWeight: 60,
    face: '😈',
    description: 'Fast FUD attacks',
  },
  rugpull: {
    name: 'Rug Puller',
    hp: 120,
    speed: 22,
    reward: 30,
    damage: 15,
    color: COLORS.enemyRugPull,
    size: 24,
    spawnWeight: 25,
    face: '🦹',
    description: 'Slow but tanky',
  },
  congestion: {
    name: 'Network Clog',
    hp: 300,
    speed: 32,
    reward: 100,
    damage: 30,
    color: COLORS.enemyCongestion,
    size: 32,
    spawnWeight: 0,
    face: '🤖',
    description: 'Miniboss - huge HP',
  },
};

// =============================================================================
// ABILITIES
// =============================================================================
export const ABILITIES = {
  bomb: {
    name: 'Purge',
    icon: '💥',
    description: 'Kill all enemies',
    cooldown: 45,
  },
  freeze: {
    name: 'Freeze',
    icon: '❄️',
    description: 'Slow enemies 5s',
    cooldown: 30,
    duration: 5,
    slowFactor: 0.3,
  },
  airdrop: {
    name: 'Airdrop',
    icon: '🪂',
    description: '+100 SOL',
    cooldown: 60,
    bonus: 100,
  },
};

// =============================================================================
// TIERS
// =============================================================================
export const TIERS = [
  { name: 'Paper Hands', icon: '📄', minTime: 0, color: '#8B8B9A' },
  { name: 'Diamond Hands', icon: '💎', minTime: 90, color: COLORS.solanaBlue },
  { name: 'Degen', icon: '🎰', minTime: 180, color: COLORS.solanaPurple },
  { name: 'Whale', icon: '🐋', minTime: 300, color: COLORS.solanaPink },
  { name: 'Satoshi', icon: '👑', minTime: 420, color: COLORS.solanaGreen },
];

export function getTier(survivalTime: number) {
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (survivalTime >= TIERS[i].minTime) return TIERS[i];
  }
  return TIERS[0];
}

// =============================================================================
// GAME CONFIG
// =============================================================================
export const GAME_CONFIG = {
  startingSOL: 150,
  startingBaseHP: 100,
  
  baseSpawnInterval: 2400,
  spawnIntervalDecay: 0.93,
  minSpawnInterval: 600,
  waveInterval: 15000,
  minibossInterval: 60000,
  
  hpScalePerWave: 1.08,
  speedScalePerWave: 1.02,
  
  projectileSpeed: 300,
  projectileSize: 5,
  
  // Tower placement - MUST be outside path
  towerOffsetFromPath: 70,      // Minimum distance from path center (increased)
  minDistanceBetweenTowers: 65,
  maxTowers: 20,
  pathClickRadius: 100,         // How far from path you can click
  
  maxTowerLevel: 3,
  maxRangeLevel: 3,
  
  // Path is BIGGER now
  pathWidth: 38,
};

// =============================================================================
// BIOME
// =============================================================================
export const BIOME = {
  name: 'Solana Breakpoint',
  spawnRateMultiplier: 1.15,
  enemySpeedMultiplier: 1.1,
};

// =============================================================================
// PATH - smoother S-curve
// =============================================================================
export const PATH_WAYPOINTS = [
  { x: -0.05, y: 0.12 },
  { x: 0.08, y: 0.12 },
  { x: 0.18, y: 0.08 },
  { x: 0.30, y: 0.18 },
  { x: 0.35, y: 0.35 },
  { x: 0.28, y: 0.52 },
  { x: 0.16, y: 0.62 },
  { x: 0.14, y: 0.78 },
  { x: 0.26, y: 0.88 },
  { x: 0.48, y: 0.90 },
  { x: 0.65, y: 0.80 },
  { x: 0.75, y: 0.62 },
  { x: 0.82, y: 0.42 },
  { x: 0.92, y: 0.30 },
  { x: 1.02, y: 0.38 },
  { x: 1.08, y: 0.48 },
];

export function getPathPoints(width: number, height: number) {
  return PATH_WAYPOINTS.map(p => ({ x: p.x * width, y: p.y * height }));
}
