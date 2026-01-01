/**
 * Game Engine
 * Core game logic: spawn, movement, targeting, damage, cleanup
 */

import { GameState, Tower, Enemy, Projectile } from './types';
import {
  GAME_CONFIG,
  BIOME,
  TOWER_CONFIGS,
  ENEMY_CONFIGS,
  TowerType,
  EnemyType,
  ABILITIES,
  getPathPoints,
  GAME_WIDTH,
  GAME_HEIGHT,
} from './config';

const PATH_POINTS = getPathPoints(GAME_WIDTH, GAME_HEIGHT);

// =============================================================================
// HELPERS
// =============================================================================

function uid(): string {
  return Math.random().toString(36).substring(2, 9);
}

function distance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * Math.max(0, Math.min(1, t));
}

function getPositionOnPath(progress: number): { x: number; y: number } {
  if (progress <= 0) return { ...PATH_POINTS[0] };
  if (progress >= PATH_POINTS.length - 1) return { ...PATH_POINTS[PATH_POINTS.length - 1] };
  
  const idx = Math.floor(progress);
  const t = progress - idx;
  
  if (idx >= PATH_POINTS.length - 1) return { ...PATH_POINTS[PATH_POINTS.length - 1] };
  
  return {
    x: lerp(PATH_POINTS[idx].x, PATH_POINTS[idx + 1].x, t),
    y: lerp(PATH_POINTS[idx].y, PATH_POINTS[idx + 1].y, t),
  };
}

function findClosestPathProgress(x: number, y: number): number {
  let closestProgress = 0;
  let closestDist = Infinity;
  
  for (let i = 0; i < PATH_POINTS.length - 1; i++) {
    for (let t = 0; t <= 1; t += 0.05) {
      const px = lerp(PATH_POINTS[i].x, PATH_POINTS[i + 1].x, t);
      const py = lerp(PATH_POINTS[i].y, PATH_POINTS[i + 1].y, t);
      const d = distance(x, y, px, py);
      if (d < closestDist) {
        closestDist = d;
        closestProgress = i + t;
      }
    }
  }
  return closestProgress;
}

// =============================================================================
// INITIAL STATE
// =============================================================================

export function createInitialState(): GameState {
  const now = Date.now();
  return {
    isRunning: true,
    isPaused: false,
    gameOver: false,
    
    startTime: now,
    elapsedTime: 0,
    lastUpdateTime: now,
    
    wave: 1,
    spawnTimer: 0,
    lastWaveTime: now,
    lastMinibossTime: now,
    spawnInterval: GAME_CONFIG.baseSpawnInterval / BIOME.spawnRateMultiplier,
    
    sol: GAME_CONFIG.startingSOL,
    baseHp: GAME_CONFIG.startingBaseHP,
    maxBaseHp: GAME_CONFIG.startingBaseHP,
    
    enemies: [],
    towers: [],
    projectiles: [],
    
    abilities: {
      bomb: { lastUsed: -Infinity },
      freeze: { lastUsed: -Infinity, active: false, endTime: 0 },
      airdrop: { lastUsed: -Infinity },
    },
    
    kills: 0,
    damageDealt: 0,
    solEarned: 0,
  };
}

// =============================================================================
// TOWER PLACEMENT
// =============================================================================

export function canPlaceTower(
  state: GameState,
  x: number,
  y: number,
  towerType: TowerType
): boolean {
  // Check sol
  if (state.sol < TOWER_CONFIGS[towerType].cost) return false;
  
  // Check max towers
  if (state.towers.length >= GAME_CONFIG.maxTowers) return false;
  
  // Check proximity to path
  const progress = findClosestPathProgress(x, y);
  const pathPos = getPositionOnPath(progress);
  const distToPath = distance(x, y, pathPos.x, pathPos.y);
  if (distToPath > GAME_CONFIG.pathClickRadius) return false;
  
  // Check distance from other towers
  for (const tower of state.towers) {
    const d = distance(x, y, tower.x, tower.y);
    if (d < GAME_CONFIG.minDistanceBetweenTowers) return false;
  }
  
  return true;
}

export function placeTower(
  state: GameState,
  x: number,
  y: number,
  towerType: TowerType
): GameState {
  if (!canPlaceTower(state, x, y, towerType)) return state;
  
  const config = TOWER_CONFIGS[towerType];
  const progress = findClosestPathProgress(x, y);
  const pathPos = getPositionOnPath(progress);
  
  // Place tower offset from path
  const dx = x - pathPos.x;
  const dy = y - pathPos.y;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  
  const tower: Tower = {
    id: uid(),
    type: towerType,
    x: pathPos.x + (dx / len) * GAME_CONFIG.towerOffsetFromPath,
    y: pathPos.y + (dy / len) * GAME_CONFIG.towerOffsetFromPath,
    pathProgress: progress,
    level: 1,
    rangeLevel: 1,
    lastFireTime: 0,
    targetId: null,
  };
  
  return {
    ...state,
    towers: [...state.towers, tower],
    sol: state.sol - config.cost,
  };
}

// =============================================================================
// TOWER UPGRADES
// =============================================================================

export function canUpgradeTowerLevel(state: GameState, towerId: string): boolean {
  const tower = state.towers.find(t => t.id === towerId);
  if (!tower || tower.level >= GAME_CONFIG.maxTowerLevel) return false;
  
  const cost = TOWER_CONFIGS[tower.type].upgradeCost[tower.level - 1];
  return state.sol >= cost;
}

export function upgradeTowerLevel(state: GameState, towerId: string): GameState {
  if (!canUpgradeTowerLevel(state, towerId)) return state;
  
  const tower = state.towers.find(t => t.id === towerId)!;
  const cost = TOWER_CONFIGS[tower.type].upgradeCost[tower.level - 1];
  
  return {
    ...state,
    towers: state.towers.map(t =>
      t.id === towerId ? { ...t, level: t.level + 1 } : t
    ),
    sol: state.sol - cost,
  };
}

export function canUpgradeTowerRange(state: GameState, towerId: string): boolean {
  const tower = state.towers.find(t => t.id === towerId);
  if (!tower || tower.rangeLevel >= GAME_CONFIG.maxRangeLevel) return false;
  
  const cost = TOWER_CONFIGS[tower.type].rangeUpgradeCost[tower.rangeLevel - 1];
  return state.sol >= cost;
}

export function upgradeTowerRange(state: GameState, towerId: string): GameState {
  if (!canUpgradeTowerRange(state, towerId)) return state;
  
  const tower = state.towers.find(t => t.id === towerId)!;
  const cost = TOWER_CONFIGS[tower.type].rangeUpgradeCost[tower.rangeLevel - 1];
  
  return {
    ...state,
    towers: state.towers.map(t =>
      t.id === towerId ? { ...t, rangeLevel: t.rangeLevel + 1 } : t
    ),
    sol: state.sol - cost,
  };
}

// =============================================================================
// ABILITIES
// =============================================================================

export function canUseBomb(state: GameState): boolean {
  const elapsed = (Date.now() - state.abilities.bomb.lastUsed) / 1000;
  return elapsed >= ABILITIES.bomb.cooldown;
}

export function useBomb(state: GameState): GameState {
  if (!canUseBomb(state)) return state;
  
  const solGained = state.enemies.reduce((sum, e) => sum + e.reward, 0);
  const kills = state.enemies.length;
  
  return {
    ...state,
    enemies: [],
    kills: state.kills + kills,
    sol: state.sol + solGained,
    solEarned: state.solEarned + solGained,
    abilities: {
      ...state.abilities,
      bomb: { lastUsed: Date.now() },
    },
  };
}

export function canUseFreeze(state: GameState): boolean {
  const elapsed = (Date.now() - state.abilities.freeze.lastUsed) / 1000;
  return elapsed >= ABILITIES.freeze.cooldown && !state.abilities.freeze.active;
}

export function useFreeze(state: GameState): GameState {
  if (!canUseFreeze(state)) return state;
  
  return {
    ...state,
    abilities: {
      ...state.abilities,
      freeze: {
        lastUsed: Date.now(),
        active: true,
        endTime: Date.now() + ABILITIES.freeze.duration * 1000,
      },
    },
  };
}

export function canUseAirdrop(state: GameState): boolean {
  const elapsed = (Date.now() - state.abilities.airdrop.lastUsed) / 1000;
  return elapsed >= ABILITIES.airdrop.cooldown;
}

export function useAirdrop(state: GameState): GameState {
  if (!canUseAirdrop(state)) return state;
  
  return {
    ...state,
    sol: state.sol + ABILITIES.airdrop.bonus,
    solEarned: state.solEarned + ABILITIES.airdrop.bonus,
    abilities: {
      ...state.abilities,
      airdrop: { lastUsed: Date.now() },
    },
  };
}

// =============================================================================
// ENEMY SPAWN
// =============================================================================

function pickEnemyType(wave: number): EnemyType {
  const types: EnemyType[] = ['fud', 'rugpull'];
  const weights = types.map(t => ENEMY_CONFIGS[t].spawnWeight);
  
  // Increase rugpull weight as waves progress
  weights[1] += wave * 3;
  
  const total = weights.reduce((a, b) => a + b, 0);
  let roll = Math.random() * total;
  
  for (let i = 0; i < types.length; i++) {
    roll -= weights[i];
    if (roll <= 0) return types[i];
  }
  return 'fud';
}

function spawnEnemy(state: GameState, type: EnemyType): GameState {
  const config = ENEMY_CONFIGS[type];
  const pos = getPositionOnPath(0);
  
  const hpScale = Math.pow(GAME_CONFIG.hpScalePerWave, state.wave - 1);
  const speedScale = Math.pow(GAME_CONFIG.speedScalePerWave, state.wave - 1);
  
  const enemy: Enemy = {
    id: uid(),
    type,
    x: pos.x,
    y: pos.y,
    hp: Math.floor(config.hp * hpScale),
    maxHp: Math.floor(config.hp * hpScale),
    speed: config.speed * speedScale * BIOME.enemySpeedMultiplier,
    reward: config.reward,
    damage: config.damage,
    pathProgress: 0,
    size: config.size,
  };
  
  return {
    ...state,
    enemies: [...state.enemies, enemy],
  };
}

// =============================================================================
// GAME UPDATE (called each frame)
// =============================================================================

export function updateGame(state: GameState, deltaMs: number): GameState {
  if (!state.isRunning || state.isPaused || state.gameOver) return state;
  
  const now = Date.now();
  let newState = { ...state };
  
  // Update elapsed time
  newState.elapsedTime = (now - newState.startTime) / 1000;
  newState.lastUpdateTime = now;
  
  // Check freeze end
  if (newState.abilities.freeze.active && now > newState.abilities.freeze.endTime) {
    newState.abilities = {
      ...newState.abilities,
      freeze: { ...newState.abilities.freeze, active: false },
    };
  }
  
  // Update spawn timer & spawn enemies
  newState.spawnTimer += deltaMs;
  if (newState.spawnTimer >= newState.spawnInterval) {
    newState.spawnTimer = 0;
    const type = pickEnemyType(newState.wave);
    newState = spawnEnemy(newState, type);
  }
  
  // Wave progression
  if (now - newState.lastWaveTime >= GAME_CONFIG.waveInterval) {
    newState.wave++;
    newState.lastWaveTime = now;
    newState.spawnInterval = Math.max(
      GAME_CONFIG.minSpawnInterval,
      newState.spawnInterval * GAME_CONFIG.spawnIntervalDecay
    );
  }
  
  // Miniboss spawn
  if (now - newState.lastMinibossTime >= GAME_CONFIG.minibossInterval) {
    newState.lastMinibossTime = now;
    newState = spawnEnemy(newState, 'congestion');
  }
  
  // Move enemies
  const freezeActive = newState.abilities.freeze.active;
  const freezeSlow = freezeActive ? ABILITIES.freeze.slowFactor : 1;
  
  newState.enemies = newState.enemies.map(enemy => {
    const speed = (enemy.speed * freezeSlow * deltaMs) / 1000;
    const progressPerSecond = speed / 50; // Approximate distance per progress unit
    const newProgress = enemy.pathProgress + progressPerSecond;
    const newPos = getPositionOnPath(newProgress);
    
    return {
      ...enemy,
      x: newPos.x,
      y: newPos.y,
      pathProgress: newProgress,
    };
  });
  
  // Check enemies reaching base
  const reachedBase: Enemy[] = [];
  const survivors: Enemy[] = [];
  
  for (const enemy of newState.enemies) {
    if (enemy.pathProgress >= PATH_POINTS.length - 1.5) {
      reachedBase.push(enemy);
    } else {
      survivors.push(enemy);
    }
  }
  
  newState.enemies = survivors;
  const baseDamage = reachedBase.reduce((sum, e) => sum + e.damage, 0);
  newState.baseHp = Math.max(0, newState.baseHp - baseDamage);
  
  // Game over check
  if (newState.baseHp <= 0) {
    newState.gameOver = true;
    newState.isRunning = false;
    return newState;
  }
  
  // Tower targeting & shooting
  const newProjectiles: Projectile[] = [...newState.projectiles];
  
  newState.towers = newState.towers.map(tower => {
    const config = TOWER_CONFIGS[tower.type];
    const range = config.rangeLevels[tower.rangeLevel - 1];
    const fireRate = config.fireRate[tower.level - 1];
    const damage = config.damage[tower.level - 1];
    
    // Find target
    let target: Enemy | null = null;
    let minDist = range;
    
    for (const enemy of newState.enemies) {
      const d = distance(tower.x, tower.y, enemy.x, enemy.y);
      if (d < minDist) {
        minDist = d;
        target = enemy;
      }
    }
    
    if (!target) return { ...tower, targetId: null };
    
    // Check fire rate
    const fireInterval = 1000 / fireRate;
    if (now - tower.lastFireTime < fireInterval) {
      return { ...tower, targetId: target.id };
    }
    
    // Fire projectile
    newProjectiles.push({
      id: uid(),
      x: tower.x,
      y: tower.y,
      targetX: target.x,
      targetY: target.y,
      targetId: target.id,
      damage,
      speed: GAME_CONFIG.projectileSpeed,
      towerId: tower.id,
      towerType: tower.type,
    });
    
    return { ...tower, targetId: target.id, lastFireTime: now };
  });
  
  // Move projectiles
  const activeProjectiles: Projectile[] = [];
  const hitEnemyIds = new Set<string>();
  const damageMap = new Map<string, number>();
  
  for (const proj of newProjectiles) {
    const target = newState.enemies.find(e => e.id === proj.targetId);
    
    if (!target) {
      // Target dead, remove projectile
      continue;
    }
    
    // Update target position
    proj.targetX = target.x;
    proj.targetY = target.y;
    
    const dx = proj.targetX - proj.x;
    const dy = proj.targetY - proj.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist < 10) {
      // Hit!
      const config = TOWER_CONFIGS[proj.towerType];
      
      // Apply damage to primary target
      damageMap.set(proj.targetId, (damageMap.get(proj.targetId) || 0) + proj.damage);
      hitEnemyIds.add(proj.targetId);
      
      // Chain damage
      if (config.special === 'chain' && config.chainCount) {
        let chainCount = config.chainCount;
        let lastX = target.x;
        let lastY = target.y;
        const hitIds = new Set([proj.targetId]);
        
        for (let i = 0; i < chainCount; i++) {
          let nearest: Enemy | null = null;
          let nearestDist = config.chainRadius || 60;
          
          for (const enemy of newState.enemies) {
            if (hitIds.has(enemy.id)) continue;
            const d = distance(lastX, lastY, enemy.x, enemy.y);
            if (d < nearestDist) {
              nearestDist = d;
              nearest = enemy;
            }
          }
          
          if (nearest) {
            const chainDmg = proj.damage * (config.chainDamageReduction || 0.5);
            damageMap.set(nearest.id, (damageMap.get(nearest.id) || 0) + chainDmg);
            hitIds.add(nearest.id);
            hitEnemyIds.add(nearest.id);
            lastX = nearest.x;
            lastY = nearest.y;
          } else {
            break;
          }
        }
      }
      
      // Splash damage
      if (config.special === 'splash' && config.splashRadius) {
        for (const enemy of newState.enemies) {
          if (enemy.id === proj.targetId) continue;
          const d = distance(target.x, target.y, enemy.x, enemy.y);
          if (d <= config.splashRadius) {
            const splashDmg = proj.damage * 0.5;
            damageMap.set(enemy.id, (damageMap.get(enemy.id) || 0) + splashDmg);
            hitEnemyIds.add(enemy.id);
          }
        }
      }
    } else {
      // Move projectile
      const speed = (proj.speed * deltaMs) / 1000;
      proj.x += (dx / dist) * speed;
      proj.y += (dy / dist) * speed;
      activeProjectiles.push(proj);
    }
  }
  
  newState.projectiles = activeProjectiles;
  
  // Apply damage
  let killCount = 0;
  let solGained = 0;
  let totalDamage = 0;
  
  newState.enemies = newState.enemies.map(enemy => {
    const dmg = damageMap.get(enemy.id) || 0;
    totalDamage += dmg;
    return { ...enemy, hp: enemy.hp - dmg };
  }).filter(enemy => {
    if (enemy.hp <= 0) {
      killCount++;
      solGained += enemy.reward;
      return false;
    }
    return true;
  });
  
  newState.kills += killCount;
  newState.sol += solGained;
  newState.solEarned += solGained;
  newState.damageDealt += totalDamage;
  
  return newState;
}

// =============================================================================
// EXPORTS
// =============================================================================
export { getPositionOnPath, PATH_POINTS };
