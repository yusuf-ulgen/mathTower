// =============================================
// MATH TOWER WAR — Level Generator Bot
// Generates 1000+ levels with smooth difficulty curve
// =============================================

import { Dimensions } from 'react-native';
import {
  LevelConfig,
  Tower,
  AttackPath,
  MathGate,
  NeutralArtillery,
  DragonDen,
  HazardType,
  TowerColor,
  GateOperation,
  Position,
} from '../types/game';
import { GAME } from '../constants/theme';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// Seeded random for deterministic levels
class SeededRandom {
  private seed: number;
  constructor(seed: number) {
    this.seed = seed;
  }
  next(): number {
    this.seed = (this.seed * 16807 + 0) % 2147483647;
    return this.seed / 2147483647;
  }
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
  pick<T>(arr: T[]): T {
    return arr[Math.floor(this.next() * arr.length)];
  }
  shuffle<T>(arr: T[]): T[] {
    const result = [...arr];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
}

// =================== TOWER POSITION LAYOUTS ===================

const BATTLEFIELD_W = SCREEN_W - 40;
const BATTLEFIELD_H = SCREEN_H * 0.6;
const BATTLEFIELD_X = 20;
const BATTLEFIELD_Y = 80;

function generateTowerPositions(count: number, rng: SeededRandom): Position[] {
  const positions: Position[] = [];
  const cols = Math.ceil(Math.sqrt(count + 1));
  const rows = Math.ceil((count + 1) / cols);
  const cellW = BATTLEFIELD_W / cols;
  const cellH = BATTLEFIELD_H / rows;

  for (let i = 0; i < count + 1; i++) {
    const row = Math.floor(i / cols);
    const col = i % cols;
    const jitterX = rng.nextInt(-15, 15);
    const jitterY = rng.nextInt(-15, 15);
    positions.push({
      x: BATTLEFIELD_X + col * cellW + cellW / 2 + jitterX,
      y: BATTLEFIELD_Y + row * cellH + cellH / 2 + jitterY,
    });
  }
  return positions;
}

// =================== GATE OPERATIONS BY DIFFICULTY ===================

const TUTORIAL_GATES: GateOperation[] = ['+10', 'x2'];
const MEDIUM_GATES: GateOperation[] = ['+10', '-5', 'x2', '/2'];
const ADVANCED_GATES: GateOperation[] = ['+10', '-5', 'x2', '/2', '+20', 'x3', '/3', '-10'];

function getAvailableGates(level: number): GateOperation[] {
  if (level <= 20) return TUTORIAL_GATES;
  if (level <= 50) return MEDIUM_GATES;
  return ADVANCED_GATES;
}

// =================== ENEMY COLORS BY LEVEL ===================

function getEnemyColors(level: number): TowerColor[] {
  if (level <= 20) return ['red'];
  if (level <= 50) return ['red', 'purple'];
  return ['red', 'purple', 'yellow'];
}

// =================== LEVEL GENERATOR ===================

export function generateLevel(levelNumber: number): LevelConfig {
  const rng = new SeededRandom(levelNumber * 7919 + 1337);
  const isBossLevel = levelNumber % 10 === 0 && levelNumber >= 10;

  // ---------- Tower Count ----------
  let enemyCount: number;
  if (levelNumber <= 5) enemyCount = 1;
  else if (levelNumber <= 20) enemyCount = rng.nextInt(1, 3);
  else if (levelNumber <= 50) enemyCount = rng.nextInt(2, 4);
  else if (levelNumber <= 100) enemyCount = rng.nextInt(3, 5);
  else enemyCount = rng.nextInt(4, 7);

  if (isBossLevel) enemyCount = Math.max(enemyCount, 3);

  const totalTowers = enemyCount + 1; // +1 for player
  const positions = generateTowerPositions(totalTowers - 1, rng);

  // ---------- Player Tower ----------
  const playerStartUnits = GAME.BASE_STARTING_UNITS + Math.floor(levelNumber * 0.5);
  const playerTower: Tower = {
    id: 'player',
    color: 'blue',
    unitCount: playerStartUnits,
    maxCapacity: 50 + levelNumber,
    level: 1,
    productionRate: GAME.BASE_PRODUCTION_RATE,
    position: positions[0],
  };

  // ---------- Enemy Towers ----------
  const enemyColors = getEnemyColors(levelNumber);
  const towers: Tower[] = [playerTower];

  for (let i = 0; i < enemyCount; i++) {
    const baseUnits = Math.floor(3 + levelNumber * 0.8 + rng.nextInt(0, levelNumber / 3));
    const color = rng.pick(enemyColors);
    const isBossTower = isBossLevel && i === enemyCount - 1;

    towers.push({
      id: `enemy-${i}`,
      color,
      unitCount: isBossTower ? baseUnits * 3 : baseUnits,
      maxCapacity: isBossTower ? 200 : 50 + levelNumber,
      level: Math.min(GAME.MAX_TOWER_LEVEL, 1 + Math.floor(levelNumber / 25)),
      productionRate: GAME.BASE_PRODUCTION_RATE * (0.5 + levelNumber * 0.02),
      position: positions[i + 1],
      isBoss: isBossTower,
    });
  }

  // ---------- Paths (connect all towers) ----------
  const paths: AttackPath[] = [];
  const gates: GateOperation[] = getAvailableGates(levelNumber);

  for (let i = 0; i < towers.length; i++) {
    for (let j = i + 1; j < towers.length; j++) {
      const from = towers[i];
      const to = towers[j];
      const dx = to.position.x - from.position.x;
      const dy = to.position.y - from.position.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const pathId = `path-${from.id}-${to.id}`;

      // Add math gates on some paths
      const pathGates: MathGate[] = [];
      const gateCount = levelNumber <= 10 ? rng.nextInt(0, 1) : rng.nextInt(1, Math.min(3, Math.floor(levelNumber / 20) + 1));

      for (let g = 0; g < gateCount; g++) {
        let tFinal = 0.5;
        if (gateCount === 1) {
          // Force single gates away from the exact center (0.5) to avoid overlap on 'X' crossing paths
          // Use the index or sum of IDs to deterministically pick 35% or 65% of the way
          const sum = (from.id.length + to.id.length + i + j) % 2;
          tFinal = sum === 0 ? 0.35 : 0.65;
        } else {
          const t = (g + 1) / (gateCount + 1);
          const jitter = rng.nextInt(-8, 8) / 100;
          tFinal = Math.max(0.2, Math.min(0.8, t + jitter));
        }

        pathGates.push({
          id: `gate-${pathId}-${g}`,
          operation: rng.pick(gates),
          position: {
            x: from.position.x + dx * tFinal,
            y: from.position.y + dy * tFinal,
          },
          pathId,
        });
      }

      paths.push({
        id: pathId,
        fromTowerId: from.id,
        toTowerId: to.id,
        gates: pathGates,
        distance: dist,
      });
    }
  }

  // ---------- Artillery (Level 21+) ----------
  const artillery: NeutralArtillery[] = [];
  if (levelNumber >= 21) {
    const artilleryCount = levelNumber < 50 ? 1 : levelNumber < 100 ? rng.nextInt(1, 2) : rng.nextInt(1, 3);
    for (let i = 0; i < artilleryCount; i++) {
      artillery.push({
        id: `artillery-${i}`,
        position: {
          x: BATTLEFIELD_X + rng.nextInt(60, BATTLEFIELD_W - 60),
          y: BATTLEFIELD_Y + rng.nextInt(60, BATTLEFIELD_H - 60),
        },
        range: 80 + levelNumber * 0.5,
        damage: 1 + Math.floor(levelNumber / 30),
        fireRate: 0.5 + levelNumber * 0.01,
        isDisabled: false,
        disabledUntil: 0,
        disableCost: GAME.ARTILLERY_DISABLE_COST,
      });
    }
  }

  // ---------- Dragon Dens (Level 100+) ----------
  const dragonDens: DragonDen[] = [];
  if (levelNumber >= 100 && isBossLevel) {
    dragonDens.push({
      id: 'dragon-den-0',
      position: {
        x: BATTLEFIELD_X + BATTLEFIELD_W / 2,
        y: BATTLEFIELD_Y + 40,
      },
      spawnInterval: Math.max(8, 20 - Math.floor(levelNumber / 50)),
      bossUnitPower: GAME.BOSS_UNIT_POWER + Math.floor(levelNumber / 100) * 5,
      lastSpawnTime: 0,
    });
  }

  // ---------- Hazards (Level 51+) ----------
  const hazards: HazardType[] = [];
  if (levelNumber >= 51) {
    if (rng.next() > 0.5) hazards.push('nightMode');
    if (levelNumber >= 60 && rng.next() > 0.5) hazards.push('icyGround');
  }

  // ---------- Rewards ----------
  const baseGold = 10 + levelNumber * 2;
  const goldReward = isBossLevel ? baseGold * 3 : baseGold;

  // ---------- Star Thresholds (seconds) ----------
  const baseTime = 30 + enemyCount * 15;
  const starThresholds = {
    oneStar: baseTime * 2,
    twoStar: baseTime * 1.3,
    threeStar: baseTime,
  };

  return {
    levelNumber,
    towers,
    paths,
    artillery,
    dragonDens,
    hazards,
    goldReward,
    starThresholds,
  };
}

// Apply a gate operation to a value
export function applyGateOperation(value: number, operation: GateOperation): number {
  switch (operation) {
    case 'x2': return value * 2;
    case 'x3': return value * 3;
    case '/2': return Math.max(1, Math.floor(value / 2));
    case '/3': return Math.max(1, Math.floor(value / 3));
    case '+10': return value + 10;
    case '+20': return value + 20;
    case '-5': return Math.max(1, value - 5);
    case '-10': return Math.max(1, value - 10);
    default: return value;
  }
}

// Get display text for gate operation
export function getGateDisplayText(operation: GateOperation): string {
  switch (operation) {
    case 'x2': return '×2';
    case 'x3': return '×3';
    case '/2': return '÷2';
    case '/3': return '÷3';
    case '+10': return '+10';
    case '+20': return '+20';
    case '-5': return '-5';
    case '-10': return '-10';
    default: return operation;
  }
}

// Check if an operation is beneficial
export function isGateBeneficial(operation: GateOperation): boolean {
  return ['x2', 'x3', '+10', '+20'].includes(operation);
}
