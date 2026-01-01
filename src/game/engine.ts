/**
 * Game Engine
 * Core game loop - towers can be placed ANYWHERE along the path
 */

import { GameState, Enemy, Tower, Projectile } from './types';
import {
  TOWER_CONFIGS,
  ENEMY_CONFIGS,
  BIOME,
  GAME_CONFIG,
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
 * Get position along the path given a progress value (0-1)
 */
export function getPositionAlongPath(
  progress: number,
  width: number,
  height: number
): { x: number; y: number } {
  const pathPoints = getPathPoints(width, height);
  const totalSegments = pathPoints.length - 1;
  
  progress = Math.max(0, Math.min(1, progress));
  
  const segmentProgress = progress * totalSegments;
  const segmentIndex = Math.min(Math.floor(segmentProgress), totalSegments - 1);
  const t = segmentProgress - segmentIndex;
  
  const start = pathPoints[segmentIndex];
  const end = pathPoints[segmentIndex + 1];
  
  return {
    x: start.x + (end.x - start.x) * t,
    y: start.y + (end.y - start.y) * t,
  };
}

/**
 * Get the direction of the path at a given progress
 */
function getPathDirection(
  progress: number,
  width: number,
  height: number
): { x: number; y: number } {
  const delta = 0.01;
  const p1 = getPositionAlongPath(Math.max(0, progress - delta), width, height);
  const p2 = getPositionAlongPath(Math.min(1, progress + delta), width, height);
  
  return normalize({
    x: p2.x - p1.x,
    y: p2.y - p1.y,
  });
}

/**
 * Get perpendicular vector
 */
function getPerpendicular(dir: { x: number; y: number }): { x: number; y: number } {
  return { x: -dir.y, y: dir.x };
}

/**
 * Find the closest point on path to a given position
 * Returns { progress, distance, point }
 */
export function findClosestPointOnPath(
  pos: { x: number; y: number },
  width: number,
  height: number
): { progress: number; distance: number; point: { x: number; y: number } } {
  let closestProgress = 0;
  let closestDist = Infinity;
  let closestPoint = { x: 0, y: 0 };
  
  // Sample along path to find closest point
  const samples = 100;
  for (let i = 0; i <= samples; i++) {
    const progress = i / samples;
    const point = getPositionAlongPath(progress, width, height);
    const dist = distance(pos, point);
    
    if (dist < closestDist) {
      closestDist = dist;
      closestProgress = progress;
      closestPoint = point;
    }
  }
  
  return { progress: closestProgress, distance: closestDist, point: closestPoint };
}

/**
 * Calculate total path length
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

export function createInitialState(width: number, height: number): GameState {
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
    sol: GAME_CONFIG.startingSOL,
    baseHp: GAME_CONFIG.startingBaseHP,
    maxBaseHp: GAME_CONFIG.startingBaseHP,
    enemies: [],
    towers: [],
    projectiles: [],
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
  
  const spawnInterval = Math.max(
    GAME_CONFIG.minSpawnInterval,
    GAME_CONFIG.baseSpawnInterval * 
    Math.pow(GAME_CONFIG.spawnIntervalDecay, wave - 1) / 
    BIOME.spawnRateMultiplier
  );
  
  let newEnemies = [...state.enemies];
  
  // Miniboss spawn
  if (timeMs - lastMinibossTime >= GAME_CONFIG.minibossInterval && timeMs > 30000) {
    lastMinibossTime = timeMs;
    newEnemies.push(createEnemy('congestion', wave, width, height));
  }
  
  // Regular spawn
  if (timeMs - lastSpawnTime >= spawnInterval) {
    lastSpawnTime = timeMs;
    
    const roll = Math.random() * 100;
    const fudWeight = ENEMY_CONFIGS.fud.spawnWeight;
    const rugWeight = ENEMY_CONFIGS.rugpull.spawnWeight;
    
    let enemyType: EnemyType;
    if (roll < fudWeight) {
      enemyType = 'fud';
    } else if (roll < fudWeight + rugWeight) {
      enemyType = 'rugpull';
    } else {
      enemyType = 'fud';
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
// ENEMY MOVEMENT
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
    const progressSpeed = enemy.speed / pathLength;
    const newProgress = enemy.pathProgress + progressSpeed * deltaSeconds;
    
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
    const range = config.range[tower.level - 1];  // Range now upgrades!
    const fireInterval = 1000 / config.fireRate[tower.level - 1];
    
    const target = findNearestEnemy({ x: tower.x, y: tower.y }, range, state.enemies);
    
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
// PROJECTILE & DAMAGE
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
    
    if (targetIndex === -1) continue;
    
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
      damageDealt += projectile.damage;
      const newHp = target.hp - projectile.damage;
      
      if (newHp <= 0) {
        sol += target.reward;
        solEarned += target.reward;
        kills += 1;
        updatedEnemies = updatedEnemies.filter((_, i) => i !== targetIndex);
      } else {
        updatedEnemies[targetIndex] = { ...target, hp: newHp };
      }
      
      // Chain special
      const config = TOWER_CONFIGS[projectile.towerType];
      if (config.special === 'chain' && config.chainCount) {
        const chainTargets = updatedEnemies
          .filter(e => e.id !== target.id)
          .filter(e => distance({ x: target.x, y: target.y }, { x: e.x, y: e.y }) <= (config.chainRadius || 65))
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
      
      // Splash special
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
      
      continue;
    }
    
    updatedProjectiles.push({
      ...projectile,
      x: newPos.x,
      y: newPos.y,
      targetX: target.x,
      targetY: target.y,
    });
  }
  
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
// MAIN UPDATE
// ============================================

export function updateGame(
  state: GameState,
  deltaTime: number,
  width: number,
  height: number
): GameState {
  if (state.isPaused || state.gameOver) return state;

  let newState = { ...state };
  
  newState.elapsedTime += deltaTime / 1000;
  newState.wave = Math.floor(newState.elapsedTime / (GAME_CONFIG.waveInterval / 1000)) + 1;
  
  newState = spawnEnemies(newState, width, height);
  newState = updateEnemies(newState, deltaTime, width, height);
  newState = updateTowers(newState);
  newState = updateProjectiles(newState, deltaTime);
  
  if (newState.baseHp <= 0) {
    newState.gameOver = true;
    newState.isRunning = false;
  }

  return newState;
}

// ============================================
// TOWER PLACEMENT - ANYWHERE ALONG PATH
// ============================================

/**
 * Check if a tower can be placed at a position
 */
export function canPlaceTowerAt(
  state: GameState,
  x: number,
  y: number,
  towerType: TowerType,
  width: number,
  height: number
): { canPlace: boolean; pathProgress: number; towerX: number; towerY: number } {
  const config = TOWER_CONFIGS[towerType];
  
  // Check cost
  if (state.sol < config.cost) {
    return { canPlace: false, pathProgress: 0, towerX: 0, towerY: 0 };
  }
  
  // Check max towers
  if (state.towers.length >= GAME_CONFIG.maxTowers) {
    return { canPlace: false, pathProgress: 0, towerX: 0, towerY: 0 };
  }
  
  // Find closest point on path
  const closest = findClosestPointOnPath({ x, y }, width, height);
  
  // Must be close enough to path
  if (closest.distance > GAME_CONFIG.pathClickRadius) {
    return { canPlace: false, pathProgress: 0, towerX: 0, towerY: 0 };
  }
  
  // Calculate tower position (offset from path)
  const pathDir = getPathDirection(closest.progress, width, height);
  const perp = getPerpendicular(pathDir);
  
  // Determine which side of path the click was
  const clickVec = { x: x - closest.point.x, y: y - closest.point.y };
  const side = (clickVec.x * perp.x + clickVec.y * perp.y) > 0 ? 1 : -1;
  
  const towerX = closest.point.x + perp.x * GAME_CONFIG.towerOffsetFromPath * side;
  const towerY = closest.point.y + perp.y * GAME_CONFIG.towerOffsetFromPath * side;
  
  // Check distance from existing towers
  for (const tower of state.towers) {
    const dist = distance({ x: towerX, y: towerY }, { x: tower.x, y: tower.y });
    if (dist < GAME_CONFIG.minDistanceBetweenTowers) {
      return { canPlace: false, pathProgress: 0, towerX: 0, towerY: 0 };
    }
  }
  
  return { canPlace: true, pathProgress: closest.progress, towerX, towerY };
}

/**
 * Place a tower at a position
 */
export function placeTowerAt(
  state: GameState,
  x: number,
  y: number,
  towerType: TowerType,
  width: number,
  height: number
): GameState {
  const result = canPlaceTowerAt(state, x, y, towerType, width, height);
  if (!result.canPlace) return state;
  
  const config = TOWER_CONFIGS[towerType];
  
  const tower: Tower = {
    id: generateId(),
    type: towerType,
    x: result.towerX,
    y: result.towerY,
    pathProgress: result.pathProgress,
    level: 1,
    lastFireTime: 0,
    targetId: null,
  };
  
  return {
    ...state,
    sol: state.sol - config.cost,
    towers: [...state.towers, tower],
  };
}

/**
 * Check if tower can be upgraded
 */
export function canUpgradeTower(state: GameState, towerId: string): boolean {
  const tower = state.towers.find(t => t.id === towerId);
  if (!tower || tower.level >= GAME_CONFIG.maxTowerLevel) return false;
  
  const config = TOWER_CONFIGS[tower.type];
  const upgradeCost = config.upgradeCost[tower.level - 1];
  
  return state.sol >= upgradeCost;
}

/**
 * Upgrade a tower
 */
export function upgradeTower(state: GameState, towerId: string): GameState {
  if (!canUpgradeTower(state, towerId)) return state;
  
  const towerIndex = state.towers.findIndex(t => t.id === towerId);
  const tower = state.towers[towerIndex];
  const config = TOWER_CONFIGS[tower.type];
  const upgradeCost = config.upgradeCost[tower.level - 1];
  
  const updatedTowers = [...state.towers];
  updatedTowers[towerIndex] = { ...tower, level: tower.level + 1 };
  
  return {
    ...state,
    sol: state.sol - upgradeCost,
    towers: updatedTowers,
  };
}
