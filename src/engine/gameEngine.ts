// =============================================
// MATH TOWER WAR — Game Engine
// Handles real-time game loop logic
// =============================================

import {
  Tower,
  MovingUnit,
  AttackPath,
  MathGate,
  NeutralArtillery,
  DragonDen,
  TowerColor,
} from '../types/game';
import { applyGateOperation } from './levelGenerator';
import { GAME } from '../constants/theme';

let unitIdCounter = 0;

export function resetUnitIdCounter() {
  unitIdCounter = 0;
}

export function generateUnitId(): string {
  return `unit-${++unitIdCounter}`;
}

// =================== FIND PATH ===================

export function findPath(
  fromId: string,
  toId: string,
  paths: AttackPath[]
): AttackPath | null {
  // Direct path
  const direct = paths.find(
    (p) =>
      (p.fromTowerId === fromId && p.toTowerId === toId) ||
      (p.fromTowerId === toId && p.toTowerId === fromId)
  );
  return direct || null;
}

// =================== GET TOWER POSITION ===================

export function getTowerCenter(tower: Tower): { x: number; y: number } {
  return { x: tower.position.x, y: tower.position.y };
}

// =================== SPAWN UNIT ===================

export function spawnUnit(
  fromTower: Tower,
  toTower: Tower,
  path: AttackPath
): MovingUnit | null {
  if (fromTower.unitCount <= 0) return null;

  const isReversed =
    path.fromTowerId === toTower.id && path.toTowerId === fromTower.id;

  return {
    id: generateUnitId(),
    color: fromTower.color,
    fromTowerId: fromTower.id,
    toTowerId: toTower.id,
    progress: 0,
    value: 1,
    speed: 1,
    passedGates: [],
  };
}

// =================== PROCESS UNIT MOVEMENT ===================

export interface UnitTickResult {
  unit: MovingUnit;
  arrived: boolean;
  gateTriggered?: { gateId: string; oldValue: number; newValue: number };
}

export function tickUnit(
  unit: MovingUnit,
  path: AttackPath,
  dt: number,
  icyGround: boolean
): UnitTickResult {
  const speedMultiplier = icyGround ? 1.5 : 1;
  const pixelsPerSecond = GAME.UNIT_SPEED * unit.speed * speedMultiplier;
  const progressPerSecond = pixelsPerSecond / Math.max(path.distance, 1);
  const newProgress = Math.min(1, unit.progress + progressPerSecond * dt);

  const updatedUnit = { ...unit, progress: newProgress };

  // Check gate collisions
  for (const gate of path.gates) {
    if (updatedUnit.passedGates.includes(gate.id)) continue;

    // Use pre-calculated t-position if available, otherwise fallback
    const gateT = gate.tPosition !== undefined ? gate.tPosition : 0.5;

    // If unit has passed this gate's position
    if (unit.progress < gateT && newProgress >= gateT) {
      const oldValue = updatedUnit.value;
      updatedUnit.value = applyGateOperation(updatedUnit.value, gate.operation);
      updatedUnit.passedGates = [...updatedUnit.passedGates, gate.id];

      return {
        unit: updatedUnit,
        arrived: newProgress >= 1,
        gateTriggered: {
          gateId: gate.id,
          oldValue,
          newValue: updatedUnit.value,
        },
      };
    }
  }

  return {
    unit: updatedUnit,
    arrived: newProgress >= 1,
  };
}

// =================== TOWER PRODUCTION ===================

export function calculateProduction(
  tower: Tower,
  dt: number,
  productionBonus: number
): number {
  if (tower.unitCount >= tower.maxCapacity) return 0;
  const rate = tower.productionRate * (1 + productionBonus) * (1 + (tower.level - 1) * GAME.PRODUCTION_PER_LEVEL);
  return rate * dt;
}

// =================== TOWER UPGRADE COST ===================

export function getTowerUpgradeCost(tower: Tower): number {
  return Math.floor(tower.level * 8 * GAME.TOWER_UPGRADE_COST_MULT);
}

// =================== ARTILLERY LOGIC ===================

export function processArtillery(
  artillery: NeutralArtillery,
  units: MovingUnit[],
  dt: number,
  damageReduction: number
): { hitUnitIds: string[]; updatedArtillery: NeutralArtillery } {
  if (artillery.isDisabled && Date.now() < artillery.disabledUntil) {
    return { hitUnitIds: [], updatedArtillery: artillery };
  }

  // Re-enable if disabled time has passed
  const updatedArtillery = {
    ...artillery,
    isDisabled: Date.now() < artillery.disabledUntil,
  };

  const hitUnitIds: string[] = [];
  const damage = Math.max(1, artillery.damage - damageReduction);

  for (const unit of units) {
    // We'd need unit world position — for now, skip
    // This will be handled in the store tick
  }

  return { hitUnitIds, updatedArtillery };
}

// =================== DRAGON DEN LOGIC ===================

export function shouldDragonSpawn(
  den: DragonDen,
  elapsedTime: number
): boolean {
  const timeSinceLastSpawn = elapsedTime - den.lastSpawnTime;
  return timeSinceLastSpawn >= den.spawnInterval;
}

// =================== AI ENEMY ATTACK ===================

export function getEnemyAttackDecision(
  enemyTowers: Tower[],
  allTowers: Tower[],
  paths: AttackPath[],
  elapsedTime: number,
  level: number
): { fromId: string; toId: string } | null {
  // Simple AI: periodically attack the weakest nearby tower
  const attackInterval = Math.max(3, 10 - level * 0.05); // faster attacks at higher levels

  for (const enemy of enemyTowers) {
    if (enemy.unitCount < 5) continue;

    // Find connected towers of different color
    const connectedPaths = paths.filter(
      (p) => p.fromTowerId === enemy.id || p.toTowerId === enemy.id
    );

    for (const path of connectedPaths) {
      const targetId =
        path.fromTowerId === enemy.id ? path.toTowerId : path.fromTowerId;
      const target = allTowers.find((t) => t.id === targetId);

      if (target && target.color !== enemy.color && enemy.unitCount > target.unitCount * 1.2) {
        return { fromId: enemy.id, toId: targetId };
      }
    }
  }

  return null;
}

// =================== VICTORY/DEFEAT CHECK ===================

export function checkVictory(towers: Tower[]): boolean {
  return towers.every(
    (t) => t.color === 'blue' || t.color === 'neutral'
  );
}

export function checkDefeat(towers: Tower[], movingUnits: MovingUnit[]): boolean {
  const playerTowers = towers.filter((t) => t.color === 'blue');
  const playerUnits = movingUnits.filter((u) => u.color === 'blue');
  if (playerTowers.length === 0 && playerUnits.length === 0) return true;
  if (playerTowers.length === 0 && playerTowers.every(t => t.unitCount <= 0)) return true;
  return false;
}

// =================== STAR RATING ===================

export function calculateStars(
  elapsedTime: number,
  thresholds: { oneStar: number; twoStar: number; threeStar: number }
): 0 | 1 | 2 | 3 {
  if (elapsedTime <= thresholds.threeStar) return 3;
  if (elapsedTime <= thresholds.twoStar) return 2;
  if (elapsedTime <= thresholds.oneStar) return 1;
  return 1; // always at least 1 star if completed
}
