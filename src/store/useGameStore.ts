// =============================================
// MATH TOWER WAR — Game Store (Battle State)
// Real-time tower defense with unit queues
// =============================================

import { create } from 'zustand';
import * as Haptics from 'expo-haptics';
import {
  BattleState,
  Tower,
  MovingUnit,
  AttackPath,
  NeutralArtillery,
  DragonDen,
  HazardType,
  LevelConfig,
  ScreenName,
  TowerColor,
} from '../types/game';
import {
  generateUnitId,
  resetUnitIdCounter,
  findPath,
  tickUnit,
  calculateProduction,
  getTowerUpgradeCost,
  checkVictory,
  checkDefeat,
  calculateStars,
  getEnemyAttackDecision,
  shouldDragonSpawn,
} from '../engine/gameEngine';
import { generateLevel } from '../engine/levelGenerator';
import { GAME } from '../constants/theme';

// =================== ATTACK QUEUE ===================
interface AttackQueue {
  id: string;
  fromTowerId: string;
  toTowerId: string;
  remainingUnits: number;
  unitColor: TowerColor;
  spawnTimer: number;
  pathId: string;
}

interface GameStore extends BattleState {
  // Navigation
  currentScreen: ScreenName;
  setScreen: (screen: ScreenName) => void;

  // Attack queues
  attackQueues: AttackQueue[];

  // Production accumulators (fractional unit tracking)
  productionAccum: { [towerId: string]: number };

  // Enemy AI timer
  enemyAiTimer: number;

  // Level to play
  selectedLevel: number;

  // Actions
  startLevel: (levelNumber: number, startingUnitsBonus: number) => void;
  sendAttack: (fromTowerId: string, toTowerId: string) => void;
  upgradeTower: (towerId: string) => void;
  disableArtillery: (artilleryId: string) => void;
  tick: (dt: number, productionBonus: number, artilleryResistance: number) => void;
  pauseGame: () => void;
  resumeGame: () => void;
  endBattle: () => void;
  setSelectedLevel: (level: number) => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  // Navigation
  currentScreen: 'menu',
  setScreen: (screen) => set({ currentScreen: screen }),

  // Battle State
  levelConfig: null,
  towers: [],
  movingUnits: [],
  paths: [],
  artillery: [],
  dragonDens: [],
  activeHazards: [],
  isPlaying: false,
  isPaused: false,
  isVictory: false,
  isDefeat: false,
  elapsedTime: 0,
  goldEarned: 0,

  // Attack queues
  attackQueues: [],
  productionAccum: {},
  enemyAiTimer: 0,
  selectedLevel: 1,

  setSelectedLevel: (level) => set({ selectedLevel: level }),

  // =================== START LEVEL ===================
  startLevel: (levelNumber, startingUnitsBonus) => {
    resetUnitIdCounter();
    const config = generateLevel(levelNumber);

    // Apply starting units bonus to player
    const towers = config.towers.map((t) => {
      if (t.color === 'blue') {
        return { ...t, unitCount: t.unitCount + startingUnitsBonus };
      }
      return { ...t };
    });

    const productionAccum: { [id: string]: number } = {};
    towers.forEach((t) => {
      productionAccum[t.id] = 0;
    });

    set({
      currentScreen: 'battle',
      levelConfig: config,
      towers,
      movingUnits: [],
      paths: config.paths,
      artillery: config.artillery,
      dragonDens: config.dragonDens,
      activeHazards: config.hazards,
      isPlaying: true,
      isPaused: false,
      isVictory: false,
      isDefeat: false,
      elapsedTime: 0,
      goldEarned: 0,
      attackQueues: [],
      productionAccum,
      enemyAiTimer: 0,
      selectedLevel: levelNumber,
    });
  },

  // =================== SEND ATTACK ===================
  sendAttack: (fromTowerId, toTowerId) => {
    const { towers, paths, attackQueues, isPlaying, isPaused, isVictory, isDefeat } = get();
    if (!isPlaying || isPaused || isVictory || isDefeat) return;

    const fromTower = towers.find((t) => t.id === fromTowerId);
    const toTower = towers.find((t) => t.id === toTowerId);
    if (!fromTower || !toTower) return;
    if (fromTower.color !== 'blue') return; // only player can send
    if (fromTower.unitCount <= 1) return;   // keep at least 1 unit

    const path = findPath(fromTowerId, toTowerId, paths);
    if (!path) return;

    // Send all units (keep at least 1)
    const unitsToSend = fromTower.unitCount - 1;
    if (unitsToSend <= 0) return;

    // Decrease tower count immediately
    const newTowers = towers.map((t) =>
      t.id === fromTowerId ? { ...t, unitCount: t.unitCount - unitsToSend } : t
    );

    // Create attack queue
    const queue: AttackQueue = {
      id: `aq-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      fromTowerId,
      toTowerId,
      remainingUnits: unitsToSend,
      unitColor: fromTower.color,
      spawnTimer: 0,
      pathId: path.id,
    };

    set({
      towers: newTowers,
      attackQueues: [...attackQueues, queue],
    });

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  },

  // =================== UPGRADE TOWER ===================
  upgradeTower: (towerId) => {
    const { towers, isPlaying } = get();
    if (!isPlaying) return;

    const tower = towers.find((t) => t.id === towerId);
    if (!tower || tower.color !== 'blue') return;
    if (tower.level >= GAME.MAX_TOWER_LEVEL) return;

    const cost = getTowerUpgradeCost(tower);
    if (tower.unitCount < cost) return;

    const newTowers = towers.map((t) =>
      t.id === towerId
        ? {
            ...t,
            level: t.level + 1,
            unitCount: t.unitCount - cost,
            maxCapacity: t.maxCapacity + GAME.CAPACITY_PER_LEVEL,
            productionRate: t.productionRate * (1 + GAME.PRODUCTION_PER_LEVEL),
          }
        : t
    );

    set({ towers: newTowers });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  },

  // =================== DISABLE ARTILLERY ===================
  disableArtillery: (artilleryId) => {
    const { artillery, towers } = get();
    const art = artillery.find((a) => a.id === artilleryId);
    if (!art || art.isDisabled) return;

    // Find nearest player tower and deduct units
    const playerTowers = towers.filter((t) => t.color === 'blue' && t.unitCount >= art.disableCost);
    if (playerTowers.length === 0) return;

    // Use the tower with most units
    const sourceTower = playerTowers.sort((a, b) => b.unitCount - a.unitCount)[0];

    const newTowers = towers.map((t) =>
      t.id === sourceTower.id ? { ...t, unitCount: t.unitCount - art.disableCost } : t
    );

    const newArtillery = artillery.map((a) =>
      a.id === artilleryId
        ? { ...a, isDisabled: true, disabledUntil: Date.now() + GAME.ARTILLERY_DISABLE_DURATION }
        : a
    );

    set({ towers: newTowers, artillery: newArtillery });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  },

  // =================== GAME TICK ===================
  tick: (dt, productionBonus, artilleryResistance) => {
    const state = get();
    if (!state.isPlaying || state.isPaused || state.isVictory || state.isDefeat) return;

    let towers = [...state.towers];
    let movingUnits = [...state.movingUnits];
    let attackQueues = [...state.attackQueues];
    let productionAccum = { ...state.productionAccum };
    let artillery = [...state.artillery];
    let dragonDens = [...state.dragonDens];
    const elapsedTime = state.elapsedTime + dt;
    let enemyAiTimer = state.enemyAiTimer + dt;

    // ---- 1. Tower Production ----
    towers = towers.map((tower) => {
      if (tower.color === 'neutral') return tower;
      const production = calculateProduction(tower, dt, tower.color === 'blue' ? productionBonus : 0);
      const accum = (productionAccum[tower.id] || 0) + production;
      const wholeUnits = Math.floor(accum);
      productionAccum[tower.id] = accum - wholeUnits;

      if (wholeUnits > 0 && tower.unitCount < tower.maxCapacity) {
        return {
          ...tower,
          unitCount: Math.min(tower.maxCapacity, tower.unitCount + wholeUnits),
        };
      }
      return tower;
    });

    // ---- 2. Spawn units from attack queues ----
    const newQueues: AttackQueue[] = [];
    for (const queue of attackQueues) {
      if (queue.remainingUnits <= 0) continue;

      let q = { ...queue, spawnTimer: queue.spawnTimer + dt * 1000 };

      while (q.spawnTimer >= GAME.UNIT_SPAWN_INTERVAL && q.remainingUnits > 0) {
        q.spawnTimer -= GAME.UNIT_SPAWN_INTERVAL;
        q.remainingUnits--;

        const fromTower = towers.find((t) => t.id === q.fromTowerId);
        const toTower = towers.find((t) => t.id === q.toTowerId);
        if (fromTower && toTower) {
          movingUnits.push({
            id: generateUnitId(),
            color: q.unitColor,
            fromTowerId: q.fromTowerId,
            toTowerId: q.toTowerId,
            progress: 0,
            value: 1,
            speed: 1,
            passedGates: [],
          });
        }
      }

      if (q.remainingUnits > 0) {
        newQueues.push(q);
      }
    }
    attackQueues = newQueues;

    // ---- 3. Move units and process gates ----
    const arrivedUnits: MovingUnit[] = [];
    const activeUnits: MovingUnit[] = [];

    for (const unit of movingUnits) {
      const path = state.paths.find((p) => {
        return (
          (p.fromTowerId === unit.fromTowerId && p.toTowerId === unit.toTowerId) ||
          (p.fromTowerId === unit.toTowerId && p.toTowerId === unit.fromTowerId)
        );
      });

      if (!path) {
        activeUnits.push(unit);
        continue;
      }

      const fromTower = towers.find((t) => t.id === unit.fromTowerId);
      const toTower = towers.find((t) => t.id === unit.toTowerId);

      if (!fromTower || !toTower) {
        activeUnits.push(unit);
        continue;
      }

      const icyGround = state.activeHazards.includes('icyGround');
      const result = tickUnit(unit, path, fromTower, toTower, dt, icyGround);

      if (result.arrived) {
        arrivedUnits.push(result.unit);
      } else {
        activeUnits.push(result.unit);
      }
    }

    // ---- 3.5 Process Road Collisions ----
    const survivingUnits: MovingUnit[] = [];
    const unitsByPath: { [pathId: string]: MovingUnit[] } = {};

    for (const unit of activeUnits) {
      const pId = [unit.fromTowerId, unit.toTowerId].sort().join('-');
      if (!unitsByPath[pId]) unitsByPath[pId] = [];
      unitsByPath[pId].push(unit);
    }

    for (const pId in unitsByPath) {
      const unitsOnPath = unitsByPath[pId];
      if (unitsOnPath.length < 2) {
        survivingUnits.push(...unitsOnPath);
        continue;
      }

      const dir1Id = unitsOnPath[0].fromTowerId;
      const dir1 = unitsOnPath.filter(u => u.fromTowerId === dir1Id);
      const dir2 = unitsOnPath.filter(u => u.fromTowerId !== dir1Id);

      dir1.sort((a, b) => b.progress - a.progress); 
      dir2.sort((a, b) => b.progress - a.progress); 

      let i1 = 0, i2 = 0;
      while (i1 < dir1.length && i2 < dir2.length) {
        const u1 = dir1[i1];
        const u2 = dir2[i2];
        
        if (u1.color !== u2.color && (u1.progress + u2.progress) >= 0.98) {
           const val1 = u1.value;
           const val2 = u2.value;
           if (val1 === val2) {
             u1.value = 0; u2.value = 0;
             i1++; i2++;
           } else if (val1 > val2) {
             u1.value -= val2;
             u2.value = 0;
             i2++;
           } else {
             u2.value -= val1;
             u1.value = 0;
             i1++;
           }
        } else {
           break; 
        }
      }

      survivingUnits.push(...dir1.filter(u => u.value > 0));
      survivingUnits.push(...dir2.filter(u => u.value > 0));
    }

    // ---- 4. Process arrived units ----
    const newlyCapturedTowers: { id: string; oldColor: string }[] = [];

    for (const unit of arrivedUnits) {
      const targetIdx = towers.findIndex((t) => t.id === unit.toTowerId);
      if (targetIdx === -1) continue;

      const target = towers[targetIdx];

      if (target.color === unit.color) {
        // Friendly — add units
        towers[targetIdx] = {
          ...target,
          unitCount: Math.min(target.maxCapacity, target.unitCount + unit.value),
        };
      } else {
        // Enemy — subtract, possibly capture
        const newCount = target.unitCount - unit.value;
        if (newCount <= 0) {
          // Tower captured!
          newlyCapturedTowers.push({ id: target.id, oldColor: target.color });
          towers[targetIdx] = {
            ...target,
            color: unit.color,
            unitCount: Math.abs(newCount),
            level: 1,
            productionRate: GAME.BASE_PRODUCTION_RATE,
          };
        } else {
          towers[targetIdx] = { ...target, unitCount: newCount };
        }
      }
    }

    // ---- 4.5 Cleanup orphaned units & queues on capture ----
    let finalUnits = survivingUnits;
    if (newlyCapturedTowers.length > 0) {
      newlyCapturedTowers.forEach(capture => {
        // Destroy units spawned from this tower matching the old color
        finalUnits = finalUnits.filter(u => !(u.fromTowerId === capture.id && u.color === capture.oldColor));
        // Clear pending attacks from this tower
        attackQueues = attackQueues.filter(q => !(q.fromTowerId === capture.id && q.unitColor === capture.oldColor));
      });
    }

    movingUnits = finalUnits;

    // ---- 5. Enemy AI ----
    const aiInterval = Math.max(2, 8 - (state.selectedLevel || 1) * 0.03);
    if (enemyAiTimer >= aiInterval) {
      enemyAiTimer = 0;
      const enemyTowers = towers.filter((t) => t.color !== 'blue' && t.color !== 'neutral');

      for (const enemy of enemyTowers) {
        if (enemy.unitCount < 5) continue;

        const connectedPaths = state.paths.filter(
          (p) => p.fromTowerId === enemy.id || p.toTowerId === enemy.id
        );

        for (const path of connectedPaths) {
          const targetId = path.fromTowerId === enemy.id ? path.toTowerId : path.fromTowerId;
          const target = towers.find((t) => t.id === targetId);

          if (target && target.color !== enemy.color && enemy.unitCount > target.unitCount * 1.3) {
            // Enemy sends all units (keep 1)
            const unitsToSend = enemy.unitCount - 1;
            towers = towers.map((t) =>
              t.id === enemy.id ? { ...t, unitCount: t.unitCount - unitsToSend } : t
            );

            attackQueues.push({
              id: `eq-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
              fromTowerId: enemy.id,
              toTowerId: targetId,
              remainingUnits: unitsToSend,
              unitColor: enemy.color,
              spawnTimer: 0,
              pathId: path.id,
            });
            break; // one attack per AI tick per enemy
          }
        }
      }
    }

    // ---- 6. Artillery ----
    artillery = artillery.map((a) => {
      if (a.isDisabled && Date.now() >= a.disabledUntil) {
        return { ...a, isDisabled: false };
      }
      return a;
    });

    // ---- 7. Dragon Den Spawning ----
    dragonDens = dragonDens.map((den) => {
      if (shouldDragonSpawn(den, elapsedTime)) {
        // Spawn boss units targeting random player tower
        const playerTowers = towers.filter((t) => t.color === 'blue');
        if (playerTowers.length > 0) {
          const target = playerTowers[Math.floor(Math.random() * playerTowers.length)];
          // Add boss units as high-value units
          for (let i = 0; i < 3; i++) {
            movingUnits.push({
              id: generateUnitId(),
              color: 'red',
              fromTowerId: den.id,
              toTowerId: target.id,
              progress: 0,
              value: den.bossUnitPower,
              speed: 0.7,
              passedGates: [],
            });
          }
        }
        return { ...den, lastSpawnTime: elapsedTime };
      }
      return den;
    });

    // ---- 8. Victory/Defeat Check ----
    const victory = checkVictory(towers);
    const defeat = checkDefeat(towers, movingUnits);

    if (victory) {
      const config = state.levelConfig;
      const stars = config ? calculateStars(elapsedTime, config.starThresholds) : 1;
      const goldEarned = config ? config.goldReward * stars : 0;
      set({
        towers,
        movingUnits,
        attackQueues,
        productionAccum,
        artillery,
        dragonDens,
        elapsedTime,
        enemyAiTimer,
        isVictory: true,
        isPlaying: false,
        goldEarned,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      return;
    }

    if (defeat) {
      set({
        towers,
        movingUnits,
        attackQueues,
        productionAccum,
        artillery,
        dragonDens,
        elapsedTime,
        enemyAiTimer,
        isDefeat: true,
        isPlaying: false,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    set({
      towers,
      movingUnits,
      attackQueues,
      productionAccum,
      artillery,
      dragonDens,
      elapsedTime,
      enemyAiTimer,
    });
  },

  pauseGame: () => set({ isPaused: true }),
  resumeGame: () => set({ isPaused: false }),
  endBattle: () => set({ isPlaying: false, currentScreen: 'menu' }),
}));
