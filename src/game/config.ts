/**
 * Game Configuration
 */

import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// =============================================================================
// LAYOUT
// =============================================================================
export const SIDEBAR_WIDTH = 130;
export const LEFT_PANEL_WIDTH = 90;
export const GAME_WIDTH = SCREEN_WIDTH - SIDEBAR_WIDTH - LEFT_PANEL_WIDTH;
export const GAME_HEIGHT = SCREEN_HEIGHT * 0.92;

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
  
  abilityBomb: '#FF6B6B',
  abilityFreeze: '#00D1FF',
  abilityAirdrop: '#14F195',
};

// =============================================================================
// TOWERS - Separate damage upgrades and range upgrades
// =============================================================================
export type TowerType = 'validator' | 'jupiter' | 'tensor';

export interface TowerConfig {
  name: string;
  icon: string;
  description: string;
  cost: number;
  baseRange: number;
  rangeLevels: number[];      // Range per range level
  damage: number[];           // Damage per power level
  fireRate: number[];         // Fire rate per power level
  upgradeCost: number[];      // Power upgrade costs
  rangeUpgradeCost: number[]; // Range upgrade costs
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
    baseRange: 70,
    rangeLevels: [70, 90, 115],
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
    description: 'Chain attack',
    cost: 80,
    baseRange: 65,
    rangeLevels: [65, 85, 110],
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
    description: 'Splash area',
    cost: 100,
    baseRange: 60,
    rangeLevels: [60, 80, 100],
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
  icon: string;
  description: string;
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
    icon: '😱',
    description: 'Fast & weak',
    hp: 25,
    speed: 60,
    reward: 10,
    damage: 5,
    color: COLORS.enemyFud,
    size: 15,
    spawnWeight: 60,
  },
  rugpull: {
    name: 'Rug Pull',
    icon: '🧹',
    description: 'Slow & tanky',
    hp: 120,
    speed: 24,
    reward: 30,
    damage: 15,
    color: COLORS.enemyRugPull,
    size: 20,
    spawnWeight: 25,
  },
  congestion: {
    name: 'Congestion',
    icon: '🚧',
    description: 'Boss enemy',
    hp: 300,
    speed: 35,
    reward: 100,
    damage: 30,
    color: COLORS.enemyCongestion,
    size: 28,
    spawnWeight: 0,
  },
};

// =============================================================================
// SPECIAL ABILITIES
// =============================================================================
export const ABILITIES = {
  bomb: {
    name: 'Network Purge',
    icon: '💥',
    description: 'Destroy all enemies on screen',
    cooldown: 45,  // seconds
  },
  freeze: {
    name: 'Rate Limit',
    icon: '❄️',
    description: 'Slow all enemies for 5 seconds',
    cooldown: 30,
    duration: 5,
    slowFactor: 0.3,
  },
  airdrop: {
    name: 'SOL Airdrop',
    icon: '🪂',
    description: 'Gain 100 bonus SOL',
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
  
  slotRadius: 20,
  towerOffsetFromPath: 42,
  minDistanceBetweenTowers: 55,
  maxTowers: 20,
  pathClickRadius: 55,
  
  maxTowerLevel: 3,
  maxRangeLevel: 3,
  
  pathWidth: 26,
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
// PATH
// =============================================================================
export const PATH_WAYPOINTS = [
  { x: -0.05, y: 0.18 },
  { x: 0.10, y: 0.18 },
  { x: 0.22, y: 0.12 },
  { x: 0.32, y: 0.28 },
  { x: 0.28, y: 0.48 },
  { x: 0.18, y: 0.58 },
  { x: 0.12, y: 0.72 },
  { x: 0.22, y: 0.85 },
  { x: 0.42, y: 0.88 },
  { x: 0.58, y: 0.78 },
  { x: 0.68, y: 0.58 },
  { x: 0.75, y: 0.38 },
  { x: 0.85, y: 0.28 },
  { x: 0.95, y: 0.42 },
  { x: 1.00, y: 0.52 },
  { x: 1.08, y: 0.52 },
];

export function getPathPoints(width: number, height: number) {
  return PATH_WAYPOINTS.map(p => ({ x: p.x * width, y: p.y * height }));
}

// =============================================================================
// ICONS
// =============================================================================
export const ECOSYSTEM_ICONS = {
  sol: '◎',
};
