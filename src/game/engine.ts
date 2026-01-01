import {
  GameState,
  Enemy,
  Tower,
  Projectile,
  TowerSlot,
  EnemyType,
  TowerType,
  Position,
} from './types';
import {
  GAME_WIDTH,
  SLOT_COUNT,
  TOWER_SLOTS,
  TIME_MARKER_SPEED,
  TIME_MARKER_START,
  BASE_HP,
  PATH_WAYPOINTS,
  TOWER_CONFIGS,
  ENEMY_CONFIGS,
  BIOME,
  WAVE_DURATION,
  BASE_SPAWN_INTERVAL,
  MIN_SPAWN_INTERVAL,
  SPAWN_INTERVAL_DECAY,
  WAVE_COMPOSITIONS,
  MINIBOSS_INTERVAL,
  HP_SCALE_PER_WAVE,
  STARTING_COINS,
} from './config';

// ============================================
// GAME ENGINE
// Core game loop logic with S-curve path
// ============================================

let nextId = 0;
const generateId = () => `${Date.now()}-${nextId++}`;

/**
 * Creates the initial game state with slots positioned along the path
 */
export function createInitialState(): GameState {
  const slots: TowerSlot[] = [];
  
  for (let i = 0; i < SLOT_COUNT; i++) {
    const slotPos = TOWER_SLOTS[i];
    slots.push({
      index: i,
      position: { x: slotPos.x, y: slotPos.y },
      tower: null,
      locked: false,
    });
  }

  return {
    running: true,
    paused: false,
    gameOver: false,
    time: 0,
    coins: STARTING_COINS,
    baseHp: BASE_HP,
    maxBaseHp: BASE_HP,
    wave: 1,
    kills: 0,
    timeMarkerX: TIME_MARKER_START, // Now represents path progress (0-1)
    enemies: [],
    towers: [],
    projectiles: [],
    slots,
  };
}

/**
 * Get position along the path given a progress value (0-1)
 */
export function getPositionAlongPath(progress: number): Position {
  const waypoints = PATH_WAYPOINTS;
  const totalSegments = waypoints.length - 1;
  
  // Clamp progress
  progress = Math.max(0, Math.min(1, progress));
  
  // Find which segment we're on
  const segmentProgress = progress * totalSegments;
  const segmentIndex = Math.min(Math.floor(segmentProgress), totalSegments - 1);
  const t = segmentProgress - segmentIndex;
  
  // Interpolate between waypoints
  const start = waypoints[segmentIndex];
  const end = waypoints[segmentIndex + 1];
  
  return {
    x: start.x + (end.x - start.x) * t,
    y: start.y + (end.y - start.y) * t,
  };
}

/**
 * Calculate total path length
 */
function calculatePathLength(): number {
  let length = 0;
  for (let i = 0; i < PATH_WAYPOINTS.length - 1; i++) {
    length += distance(PATH_WAYPOINTS[i], PATH_WAYPOINTS[i + 1]);
  }
  return length;
}

const PATH_LENGTH = calculatePathLength();

/**
 * Main update function
 */
export function updateGame(state: GameState, deltaTime: number): GameState {
  if (state.paused || state.gameOver) return state;

  let newState = { ...state };
  
  newState.time += deltaTime;
  newState.wave = Math.floor(newState.time / WAVE_DURATION) + 1;
  
  // Update time marker (locks slots based on progress)
  newState = updateTimeMarker(newState, deltaTime);
  
  // Spawn enemies
  newState = spawnEnemies(newState);
  
  // Update enemies (path movement)
  newState = updateEnemies(newState, deltaTime);
  
  // Update towers
  newState = updateTowers(newState);
  
  // Update projectiles
  newState = updateProjectiles(newState, deltaTime);
  
  if (newState.baseHp <= 0) {
    newState.gameOver = true;
    newState.running = false;
  }

  return newState;
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

function spawnEnemies(state: GameState): GameState {
  const { time, wave } = state;
  
  const spawnInterval = Math.max(
    MIN_SPAWN_INTERVAL,
    BASE_SPAWN_INTERVAL * Math.pow(SPAWN_INTERVAL_DECAY, wave - 1) / BIOME.spawnRateMultiplier
  );
  
  if (time - lastSpawnTime < spawnInterval) {
    if (time - lastMinibossTime >= MINIBOSS_INTERVAL && time > MINIBOSS_INTERVAL / 2) {
      lastMinibossTime = time;
      return {
        ...state,
        enemies: [...state.enemies, createEnemy('miniboss', wave)],
      };
    }
    return state;
  }
  
  lastSpawnTime = time;
  
  const compIndex = Math.min(wave - 1, WAVE_COMPOSITIONS.length - 1);
  const composition = WAVE_COMPOSITIONS[compIndex];
  
  const roll = (time % 1000) / 1000;
  let enemyType: EnemyType;
  
  if (roll < composition.swarm) {
    enemyType = 'swarm';
  } else if (roll < composition.swarm + composition.tank) {
    enemyType = 'tank';
  } else {
    enemyType = 'tank'; // Don't spawn miniboss from regular spawns
  }
  
  return {
    ...state,
    enemies: [...state.enemies, createEnemy(enemyType, wave)],
  };
}

function createEnemy(type: EnemyType, wave: number): Enemy {
  const config = ENEMY_CONFIGS[type];
  const hpScale = Math.pow(HP_SCALE_PER_WAVE, wave - 1);
  const startPos = getPositionAlongPath(0);
  
  return {
    id: generateId(),
    type,
    position: { ...startPos },
    hp: Math.round(config.hp * hpScale),
    maxHp: Math.round(config.hp * hpScale),
    speed: config.speed * BIOME.enemySpeedMultiplier,
    reward: config.reward,
    spawnTime: Date.now(),
    pathProgress: 0, // Track progress along path (0-1)
  };
}

// ============================================
// TIME MARKER SYSTEM
// ============================================

function updateTimeMarker(state: GameState, deltaTime: number): GameState {
  const deltaSeconds = deltaTime / 1000;
  const newMarkerProgress = Math.min(state.timeMarkerX + TIME_MARKER_SPEED * deltaSeconds, 1);
  
  // Lock slots based on their position relative to marker progress
  // Slots are locked if the marker has passed their approximate path position
  const updatedSlots = state.slots.map((slot, index) => {
    if (!slot.locked) {
      // Calculate approximate slot progress (based on slot index)
      const slotProgress = (index + 0.5) / SLOT_COUNT;
      if (slotProgress < newMarkerProgress) {
        return { ...slot, locked: true };
      }
    }
    return slot;
  });
  
  return {
    ...state,
    timeMarkerX: newMarkerProgress,
    slots: updatedSlots,
  };
}

// ============================================
// MOVEMENT SYSTEM - Path Following
// ============================================

function updateEnemies(state: GameState, deltaTime: number): GameState {
  const deltaSeconds = deltaTime / 1000;
  let baseHp = state.baseHp;
  let updatedEnemies: Enemy[] = [];
  
  for (const enemy of state.enemies) {
    // Calculate speed as progress per second
    const progressSpeed = (enemy.speed / PATH_LENGTH);
    const newProgress = (enemy.pathProgress || 0) + progressSpeed * deltaSeconds;
    
    // Check if enemy reached the base
    if (newProgress >= 1) {
      baseHp -= 1;
      continue;
    }
    
    const newPos = getPositionAlongPath(newProgress);
    
    updatedEnemies.push({
      ...enemy,
      position: newPos,
      pathProgress: newProgress,
    });
  }
  
  return {
    ...state,
    enemies: updatedEnemies,
    baseHp,
  };
}

// ============================================
// TARGETING & SHOOTING SYSTEM
// ============================================

function updateTowers(state: GameState): GameState {
  const now = state.time;
  let updatedTowers: Tower[] = [];
  let newProjectiles: Projectile[] = [];
  
  for (const tower of state.towers) {
    const config = TOWER_CONFIGS[tower.type];
    const fireInterval = 1000 / config.fireRate[tower.level - 1];
    
    const target = findNearestEnemy(tower.position, config.range, state.enemies);
    
    let updatedTower = { ...tower, targetId: target?.id || null };
    
    if (target && now - tower.lastFireTime >= fireInterval) {
      updatedTower.lastFireTime = now;
      
      newProjectiles.push({
        id: generateId(),
        fromTowerId: tower.id,
        towerType: tower.type,
        position: { ...tower.position },
        targetId: target.id,
        damage: config.damage[tower.level - 1],
        speed: config.projectileSpeed,
        level: tower.level,
        chainCount: 0,
        hitEnemies: [],
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
  position: Position,
  range: number,
  enemies: Enemy[]
): Enemy | null {
  let nearest: Enemy | null = null;
  let nearestDist = Infinity;
  
  for (const enemy of enemies) {
    const dist = distance(position, enemy.position);
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
  let coins = state.coins;
  let kills = state.kills;
  let newChainProjectiles: Projectile[] = [];
  
  for (const projectile of state.projectiles) {
    const targetIndex = updatedEnemies.findIndex(e => e.id === projectile.targetId);
    
    if (targetIndex === -1) {
      continue;
    }
    
    const target = updatedEnemies[targetIndex];
    const dir = normalize({
      x: target.position.x - projectile.position.x,
      y: target.position.y - projectile.position.y,
    });
    
    const newPos = {
      x: projectile.position.x + dir.x * projectile.speed * deltaSeconds,
      y: projectile.position.y + dir.y * projectile.speed * deltaSeconds,
    };
    
    const dist = distance(newPos, target.position);
    const hitRadius = 15;
    
    if (dist <= hitRadius) {
      const result = applyDamage(updatedEnemies, targetIndex, projectile, coins, kills);
      updatedEnemies = result.enemies;
      coins = result.coins;
      kills = result.kills;
      
      if (projectile.towerType === 'chain') {
        const chainProjectiles = createChainProjectiles(projectile, target, updatedEnemies);
        newChainProjectiles.push(...chainProjectiles);
      }
      
      if (projectile.towerType === 'splash') {
        const splashResult = applySplashDamage(updatedEnemies, target.position, projectile, coins, kills);
        updatedEnemies = splashResult.enemies;
        coins = splashResult.coins;
        kills = splashResult.kills;
      }
      
      continue;
    }
    
    updatedProjectiles.push({ ...projectile, position: newPos });
  }
  
  updatedProjectiles.push(...newChainProjectiles);
  
  return {
    ...state,
    projectiles: updatedProjectiles,
    enemies: updatedEnemies,
    coins,
    kills,
  };
}

function applyDamage(
  enemies: Enemy[],
  targetIndex: number,
  projectile: Projectile,
  coins: number,
  kills: number
): { enemies: Enemy[]; coins: number; kills: number } {
  const target = enemies[targetIndex];
  const newHp = target.hp - projectile.damage;
  
  if (newHp <= 0) {
    return {
      enemies: enemies.filter((_, i) => i !== targetIndex),
      coins: coins + target.reward,
      kills: kills + 1,
    };
  }
  
  const updatedEnemies = [...enemies];
  updatedEnemies[targetIndex] = { ...target, hp: newHp };
  
  return { enemies: updatedEnemies, coins, kills };
}

function createChainProjectiles(
  projectile: Projectile,
  hitTarget: Enemy,
  enemies: Enemy[]
): Projectile[] {
  const config = TOWER_CONFIGS.chain;
  const maxChains = config.chainCount || 2;
  
  if ((projectile.chainCount || 0) >= maxChains) {
    return [];
  }
  
  const hitEnemies = [...(projectile.hitEnemies || []), hitTarget.id];
  const chainRadius = config.chainRadius || 60;
  
  const nearbyEnemies = enemies
    .filter(e => !hitEnemies.includes(e.id))
    .filter(e => distance(hitTarget.position, e.position) <= chainRadius)
    .slice(0, 1);
  
  return nearbyEnemies.map(enemy => ({
    id: generateId(),
    fromTowerId: projectile.fromTowerId,
    towerType: 'chain' as TowerType,
    position: { ...hitTarget.position },
    targetId: enemy.id,
    damage: Math.round(projectile.damage * (config.chainDamageMultiplier || 0.6)),
    speed: projectile.speed,
    level: projectile.level,
    chainCount: (projectile.chainCount || 0) + 1,
    hitEnemies,
  }));
}

function applySplashDamage(
  enemies: Enemy[],
  center: Position,
  projectile: Projectile,
  coins: number,
  kills: number
): { enemies: Enemy[]; coins: number; kills: number } {
  const config = TOWER_CONFIGS.splash;
  const splashRadius = config.splashRadius || 50;
  const splashDamage = Math.round(projectile.damage * 0.5);
  
  let updatedEnemies = [...enemies];
  let updatedCoins = coins;
  let updatedKills = kills;
  
  for (let i = updatedEnemies.length - 1; i >= 0; i--) {
    const enemy = updatedEnemies[i];
    const dist = distance(center, enemy.position);
    
    if (dist <= splashRadius && dist > 0) {
      const newHp = enemy.hp - splashDamage;
      
      if (newHp <= 0) {
        updatedCoins += enemy.reward;
        updatedKills += 1;
        updatedEnemies.splice(i, 1);
      } else {
        updatedEnemies[i] = { ...enemy, hp: newHp };
      }
    }
  }
  
  return { enemies: updatedEnemies, coins: updatedCoins, kills: updatedKills };
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
  return state.coins >= cost;
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
    position: { ...slot.position },
    level: 1,
    lastFireTime: 0,
    targetId: null,
  };
  
  const updatedSlots = [...state.slots];
  updatedSlots[slotIndex] = { ...slot, tower };
  
  return {
    ...state,
    coins: state.coins - config.cost,
    towers: [...state.towers, tower],
    slots: updatedSlots,
  };
}

export function canUpgradeTower(state: GameState, towerId: string): boolean {
  const tower = state.towers.find(t => t.id === towerId);
  if (!tower || tower.level >= 3) return false;
  
  const config = TOWER_CONFIGS[tower.type];
  const upgradeCost = config.upgradeCost[tower.level];
  
  return state.coins >= upgradeCost;
}

export function upgradeTower(state: GameState, towerId: string): GameState {
  if (!canUpgradeTower(state, towerId)) return state;
  
  const towerIndex = state.towers.findIndex(t => t.id === towerId);
  const tower = state.towers[towerIndex];
  const config = TOWER_CONFIGS[tower.type];
  const upgradeCost = config.upgradeCost[tower.level];
  
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
    coins: state.coins - upgradeCost,
    towers: updatedTowers,
    slots: updatedSlots,
  };
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function distance(a: Position, b: Position): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function normalize(v: Position): Position {
  const len = Math.sqrt(v.x * v.x + v.y * v.y);
  if (len === 0) return { x: 0, y: 0 };
  return { x: v.x / len, y: v.y / len };
}
