/**
 * Game Engine
 * Core game loop logic with S-curve path following
 */

import { GameState, Enemy, Tower, Projectile, TowerSlot } from './types';
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  TOWER_CONFIGS,
  ENEMY_CONFIGS,
  BIOME,
  GAME_CONFIG,
  TOWER_SLOT_POSITIONS,
  getPathPoints,
  TowerType,
  EnemyType,
} from './config';

// ============================================
// UTILITY FUNCTIONS
// ============================================

let nextId = 0;
const generateId = () => `${Date.now()}-${nextId++}`;

function distance(a: { x: number; y: number }, b: { x: number; y: number }): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function normalize(v: { x: number; y: number }): { x: number; y: number } {
  const len = Math.sqrt(v.x * v.x + v.y * v.y);
  if (len === 0) return { x: 0, y: 0 };
  return { x: v.x / len, y: v.y / len };
}

// ============================================
// PATH FUNCTIONS
// ============================================

/**
 * Get position along the S-curve path given a progress value (0-1)
 */
export function getPositionAlongPath(
  progress: number,
  width: number,
  height: number
): { x: number; y: number } {
  const pathPoints = getPathPoints(width, height);
  const totalSegments = pathPoints.length - 1;
  
  // Clamp progress
  progress = Math.max(0, Math.min(1, progress));
  
  // Find which segment we're on
  const segmentProgress = progress * totalSegments;
  const segmentIndex = Math.min(Math.floor(segmentProgress), totalSegments - 1);
  const t = segmentProgress - segmentIndex;
  
  // Interpolate between waypoints
  const start = pathPoints[segmentIndex];
  const end = pathPoints[segmentIndex + 1];
  
  return {
    x: start.x + (end.x - start.x) * t,
    y: start.y + (end.y - start.y) * t,
  };
}

/**
 * Calculate total path length in pixels
 */
function calculatePathLength(width: number, height: number): number {
  const pathPoints = getPathPoints(width, height);
  let length = 0;
  for (let i = 0; i < pathPoints.length - 1; i++) {
    length += distance(pathPoints[i], pathPoints[i + 1]);
  }
  return length;
}

// ============================================
// INITIAL STATE
// ============================================

/**
 * Creates the initial game state with slots positioned along the path
 */
export function createInitialState(width: number, height: number): GameState {
  const slots: TowerSlot[] = [];
  
  // Create tower slots along the path
  for (let i = 0; i < TOWER_SLOT_POSITIONS.length; i++) {
    const pathProgress = TOWER_SLOT_POSITIONS[i];
    const pos = getPositionAlongPath(pathProgress, width, height);
    
    slots.push({
      index: i,
      x: pos.x,
      y: pos.y,
      pathProgress,
      tower: null,
      locked: false,
    });
  }

  return {
    isRunning: true,
    isPaused: false,
    gameOver: false,
    startTime: Date.now(),
    elapsedTime: 0,
    lastUpdateTime: Date.now(),
    wave: 1,
    spawnTimer: 0,
    lastWaveTime: 0,
    lastMinibossTime: 0,
    spawnInterval: GAME_CONFIG.baseSpawnInterval,
    timeMarkerProgress: 0,
    sol: GAME_CONFIG.startingSOL,
    baseHp: GAME_CONFIG.startingBaseHP,
    maxBaseHp: GAME_CONFIG.startingBaseHP,
    enemies: [],
    towers: [],
    projectiles: [],
    slots,
    kills: 0,
    damageDealt: 0,
    solEarned: 0,
  };
}

// ============================================
// SPAWNER SYSTEM
// ============================================

let lastSpawnTime = 0;
let lastMinibossTime = 0;

export function resetSpawnTimers() {
  lastSpawnTime = 0;
  lastMinibossTime = 0;
}

function spawnEnemies(
  state: GameState,
  width: number,
  height: number
): GameState {
  const { elapsedTime, wave } = state;
  const timeMs = elapsedTime * 1000;
  
  // Calculate spawn interval with decay
  const spawnInterval = Math.max(
    GAME_CONFIG.minSpawnInterval,
    GAME_CONFIG.baseSpawnInterval * 
    Math.pow(GAME_CONFIG.spawnIntervalDecay, wave - 1) / 
    BIOME.spawnRateMultiplier
  );
  
  let newEnemies = [...state.enemies];
  
  // Check for miniboss spawn
  if (timeMs - lastMinibossTime >= GAME_CONFIG.minibossInterval && timeMs > 30000) {
    lastMinibossTime = timeMs;
    newEnemies.push(createEnemy('congestion', wave, width, height));
  }
  
  // Regular enemy spawn
  if (timeMs - lastSpawnTime >= spawnInterval) {
    lastSpawnTime = timeMs;
    
    // Weighted random selection
    const roll = Math.random() * 100;
    const fudWeight = ENEMY_CONFIGS.fud.spawnWeight;
    const rugWeight = ENEMY_CONFIGS.rugpull.spawnWeight;
    
    let enemyType: EnemyType;
    if (roll < fudWeight) {
      enemyType = 'fud';
    } else if (roll < fudWeight + rugWeight) {
      enemyType = 'rugpull';
    } else {
      enemyType = 'fud'; // Default to fud
    }
    
    newEnemies.push(createEnemy(enemyType, wave, width, height));
  }
  
  return { ...state, enemies: newEnemies };
}

function createEnemy(
  type: EnemyType,
  wave: number,
  width: number,
  height: number
): Enemy {
  const config = ENEMY_CONFIGS[type];
  const hpScale = Math.pow(GAME_CONFIG.hpScalePerWave, wave - 1);
  const speedScale = Math.pow(GAME_CONFIG.speedScalePerWave, wave - 1);
  const startPos = getPositionAlongPath(0, width, height);
  
  return {
    id: generateId(),
    type,
    x: startPos.x,
    y: startPos.y,
    hp: Math.round(config.hp * hpScale),
    maxHp: Math.round(config.hp * hpScale),
    speed: config.speed * BIOME.enemySpeedMultiplier * speedScale,
    reward: config.reward,
    damage: config.damage,
    pathProgress: 0,
    size: config.size,
  };
}

// ============================================
// TIME MARKER SYSTEM
// ============================================

function updateTimeMarker(state: GameState, deltaTime: number): GameState {
  const deltaSeconds = deltaTime / 1000;
  const markerSpeed = GAME_CONFIG.timeMarkerSpeed / 1000; // Convert to progress per second
  const newMarkerProgress = Math.min(state.timeMarkerProgress + markerSpeed * deltaSeconds, 1);
  
  // Lock slots that the marker has passed
  const updatedSlots = state.slots.map((slot) => {
    if (!slot.locked && slot.pathProgress < newMarkerProgress) {
      return { ...slot, locked: true };
    }
    return slot;
  });
  
  return {
    ...state,
    timeMarkerProgress: newMarkerProgress,
    slots: updatedSlots,
  };
}

// ============================================
// ENEMY MOVEMENT SYSTEM
// ============================================

function updateEnemies(
  state: GameState,
  deltaTime: number,
  width: number,
  height: number
): GameState {
  const deltaSeconds = deltaTime / 1000;
  const pathLength = calculatePathLength(width, height);
  let baseHp = state.baseHp;
  let updatedEnemies: Enemy[] = [];
  
  for (const enemy of state.enemies) {
    // Calculate speed as progress per second
    const progressSpeed = enemy.speed / pathLength;
    const newProgress = enemy.pathProgress + progressSpeed * deltaSeconds;
    
    // Check if enemy reached the base
    if (newProgress >= 1) {
      baseHp -= enemy.damage;
      continue;
    }
    
    const newPos = getPositionAlongPath(newProgress, width, height);
    
    updatedEnemies.push({
      ...enemy,
      x: newPos.x,
      y: newPos.y,
      pathProgress: newProgress,
    });
  }
  
  return {
    ...state,
    enemies: updatedEnemies,
    baseHp: Math.max(0, baseHp),
  };
}

// ============================================
// TOWER TARGETING & SHOOTING
// ============================================

function updateTowers(state: GameState): GameState {
  const now = state.elapsedTime * 1000;
  let updatedTowers: Tower[] = [];
  let newProjectiles: Projectile[] = [];
  
  for (const tower of state.towers) {
    const config = TOWER_CONFIGS[tower.type];
    const fireInterval = 1000 / config.fireRate[tower.level - 1];
    
    const target = findNearestEnemy({ x: tower.x, y: tower.y }, config.range, state.enemies);
    
    let updatedTower = { ...tower, targetId: target?.id || null };
    
    if (target && now - tower.lastFireTime >= fireInterval) {
      updatedTower.lastFireTime = now;
      
      newProjectiles.push({
        id: generateId(),
        x: tower.x,
        y: tower.y,
        targetX: target.x,
        targetY: target.y,
        targetId: target.id,
        damage: config.damage[tower.level - 1],
        speed: GAME_CONFIG.projectileSpeed,
        towerId: tower.id,
        towerType: tower.type,
      });
    }
    
    updatedTowers.push(updatedTower);
  }
  
  return {
    ...state,
    towers: updatedTowers,
    projectiles: [...state.projectiles, ...newProjectiles],
  };
}

function findNearestEnemy(
  position: { x: number; y: number },
  range: number,
  enemies: Enemy[]
): Enemy | null {
  let nearest: Enemy | null = null;
  let nearestDist = Infinity;
  
  for (const enemy of enemies) {
    const dist = distance(position, { x: enemy.x, y: enemy.y });
    if (dist <= range && dist < nearestDist) {
      nearest = enemy;
      nearestDist = dist;
    }
  }
  
  return nearest;
}

// ============================================
// PROJECTILE & DAMAGE SYSTEM
// ============================================

function updateProjectiles(state: GameState, deltaTime: number): GameState {
  const deltaSeconds = deltaTime / 1000;
  let updatedProjectiles: Projectile[] = [];
  let updatedEnemies = [...state.enemies];
  let sol = state.sol;
  let kills = state.kills;
  let damageDealt = state.damageDealt;
  let solEarned = state.solEarned;
  let newChainProjectiles: Projectile[] = [];
  
  for (const projectile of state.projectiles) {
    const targetIndex = updatedEnemies.findIndex(e => e.id === projectile.targetId);
    
    if (targetIndex === -1) {
      // Target is dead, remove projectile
      continue;
    }
    
    const target = updatedEnemies[targetIndex];
    const dir = normalize({
      x: target.x - projectile.x,
      y: target.y - projectile.y,
    });
    
    const newPos = {
      x: projectile.x + dir.x * projectile.speed * deltaSeconds,
      y: projectile.y + dir.y * projectile.speed * deltaSeconds,
    };
    
    const dist = distance(newPos, { x: target.x, y: target.y });
    const hitRadius = target.size + GAME_CONFIG.projectileSize;
    
    if (dist <= hitRadius) {
      // Hit!
      damageDealt += projectile.damage;
      const newHp = target.hp - projectile.damage;
      
      if (newHp <= 0) {
        // Kill
        sol += target.reward;
        solEarned += target.reward;
        kills += 1;
        updatedEnemies = updatedEnemies.filter((_, i) => i !== targetIndex);
      } else {
        updatedEnemies[targetIndex] = { ...target, hp: newHp };
      }
      
      // Handle chain tower special
      const config = TOWER_CONFIGS[projectile.towerType];
      if (config.special === 'chain' && config.chainCount) {
        const chainTargets = updatedEnemies
          .filter(e => e.id !== target.id)
          .filter(e => distance({ x: target.x, y: target.y }, { x: e.x, y: e.y }) <= (config.chainRadius || 80))
          .slice(0, config.chainCount);
        
        for (const chainTarget of chainTargets) {
          newChainProjectiles.push({
            id: generateId(),
            x: target.x,
            y: target.y,
            targetX: chainTarget.x,
            targetY: chainTarget.y,
            targetId: chainTarget.id,
            damage: Math.round(projectile.damage * (config.chainDamageReduction || 0.5)),
            speed: projectile.speed,
            towerId: projectile.towerId,
            towerType: projectile.towerType,
          });
        }
      }
      
      // Handle splash tower special
      if (config.special === 'splash' && config.splashRadius) {
        const splashDamage = Math.round(projectile.damage * 0.5);
        
        for (let i = updatedEnemies.length - 1; i >= 0; i--) {
          const enemy = updatedEnemies[i];
          const splashDist = distance({ x: target.x, y: target.y }, { x: enemy.x, y: enemy.y });
          
          if (splashDist <= config.splashRadius && splashDist > 0) {
            damageDealt += splashDamage;
            const enemyNewHp = enemy.hp - splashDamage;
            
            if (enemyNewHp <= 0) {
              sol += enemy.reward;
              solEarned += enemy.reward;
              kills += 1;
              updatedEnemies.splice(i, 1);
            } else {
              updatedEnemies[i] = { ...enemy, hp: enemyNewHp };
            }
          }
        }
      }
      
      continue; // Projectile hit, don't keep it
    }
    
    // Projectile still in flight
    updatedProjectiles.push({
      ...projectile,
      x: newPos.x,
      y: newPos.y,
      targetX: target.x,
      targetY: target.y,
    });
  }
  
  // Add chain projectiles
  updatedProjectiles.push(...newChainProjectiles);
  
  return {
    ...state,
    projectiles: updatedProjectiles,
    enemies: updatedEnemies,
    sol,
    kills,
    damageDealt,
    solEarned,
  };
}

// ============================================
// MAIN UPDATE FUNCTION
// ============================================

/**
 * Main game update function - called every frame
 */
export function updateGame(
  state: GameState,
  deltaTime: number,
  width: number,
  height: number
): GameState {
  if (state.isPaused || state.gameOver) return state;

  let newState = { ...state };
  
  // Update elapsed time
  newState.elapsedTime += deltaTime / 1000;
  
  // Update wave based on time
  newState.wave = Math.floor(newState.elapsedTime / (GAME_CONFIG.waveInterval / 1000)) + 1;
  
  // Update time marker (locks slots)
  newState = updateTimeMarker(newState, deltaTime);
  
  // Spawn enemies
  newState = spawnEnemies(newState, width, height);
  
  // Update enemy movement
  newState = updateEnemies(newState, deltaTime, width, height);
  
  // Update tower targeting and shooting
  newState = updateTowers(newState);
  
  // Update projectiles and damage
  newState = updateProjectiles(newState, deltaTime);
  
  // Check game over
  if (newState.baseHp <= 0) {
    newState.gameOver = true;
    newState.isRunning = false;
  }

  return newState;
}

// ============================================
// TOWER PLACEMENT & UPGRADE
// ============================================

export function canPlaceTower(
  state: GameState,
  slotIndex: number,
  towerType: TowerType
): boolean {
  const slot = state.slots[slotIndex];
  if (!slot || slot.locked || slot.tower) return false;
  
  const cost = TOWER_CONFIGS[towerType].cost;
  return state.sol >= cost;
}

export function placeTower(
  state: GameState,
  slotIndex: number,
  towerType: TowerType
): GameState {
  if (!canPlaceTower(state, slotIndex, towerType)) return state;
  
  const slot = state.slots[slotIndex];
  const config = TOWER_CONFIGS[towerType];
  
  const tower: Tower = {
    id: generateId(),
    type: towerType,
    slotIndex,
    x: slot.x,
    y: slot.y,
    level: 1,
    lastFireTime: 0,
    targetId: null,
  };
  
  const updatedSlots = [...state.slots];
  updatedSlots[slotIndex] = { ...slot, tower };
  
  return {
    ...state,
    sol: state.sol - config.cost,
    towers: [...state.towers, tower],
    slots: updatedSlots,
  };
}

export function canUpgradeTower(state: GameState, towerId: string): boolean {
  const tower = state.towers.find(t => t.id === towerId);
  if (!tower || tower.level >= GAME_CONFIG.maxTowerLevel) return false;
  
  const config = TOWER_CONFIGS[tower.type];
  const upgradeCost = config.upgradeCost[tower.level - 1];
  
  return state.sol >= upgradeCost;
}

export function upgradeTower(state: GameState, towerId: string): GameState {
  if (!canUpgradeTower(state, towerId)) return state;
  
  const towerIndex = state.towers.findIndex(t => t.id === towerId);
  const tower = state.towers[towerIndex];
  const config = TOWER_CONFIGS[tower.type];
  const upgradeCost = config.upgradeCost[tower.level - 1];
  
  const updatedTowers = [...state.towers];
  updatedTowers[towerIndex] = { ...tower, level: tower.level + 1 };
  
  const slotIndex = tower.slotIndex;
  const updatedSlots = [...state.slots];
  updatedSlots[slotIndex] = {
    ...updatedSlots[slotIndex],
    tower: updatedTowers[towerIndex],
  };
  
  return {
    ...state,
    sol: state.sol - upgradeCost,
    towers: updatedTowers,
    slots: updatedSlots,
  };
}
