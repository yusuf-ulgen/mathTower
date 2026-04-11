// =============================================
// MATH TOWER WAR — Type Definitions
// =============================================

// Tower ownership/faction colors
export type TowerColor = 'blue' | 'red' | 'purple' | 'yellow' | 'neutral';

// Math gate operations placed on paths
export type GateOperation = 'x2' | '/2' | '+10' | '-5' | '+20' | 'x3' | '/3' | '-10';

// Environmental hazards
export type HazardType = 'nightMode' | 'icyGround';

// ===================
// Position
// ===================
export interface Position {
  x: number;
  y: number;
}

// ===================
// Tower
// ===================
export interface Tower {
  id: string;
  color: TowerColor;
  unitCount: number;
  maxCapacity: number;
  level: number;
  productionRate: number; // units per second
  position: Position;
  isBoss?: boolean;
}

// ===================
// Math Gate
// ===================
export interface MathGate {
  id: string;
  operation: GateOperation;
  position: Position;  // position along the path for rendering
  pathId: string;      // which path this gate belongs to
}

// ===================
// Moving Unit
// ===================
export interface MovingUnit {
  id: string;
  color: TowerColor;
  fromTowerId: string;
  toTowerId: string;
  progress: number;    // 0 to 1 along the path
  value: number;       // how many "units" this represents (can change via gates)
  speed: number;       // movement speed multiplier
  passedGates: string[]; // IDs of gates already passed
}

// ===================
// Attack Path (connection between towers)
// ===================
export interface AttackPath {
  id: string;
  fromTowerId: string;
  toTowerId: string;
  gates: MathGate[];
  distance: number;  // calculated path length
}

// ===================
// Neutral Artillery (Level 21+)
// ===================
export interface NeutralArtillery {
  id: string;
  position: Position;
  range: number;
  damage: number;
  fireRate: number;       // shots per second
  isDisabled: boolean;
  disabledUntil: number;  // timestamp
  disableCost: number;    // units to sacrifice (default 3)
}

// ===================
// Dragon Den (Boss Building, Level 100+)
// ===================
export interface DragonDen {
  id: string;
  position: Position;
  spawnInterval: number;    // seconds between boss unit spawns
  bossUnitPower: number;    // worth X normal units
  targetTowerId?: string;   // current target
  lastSpawnTime: number;
}

// ===================
// Research / Meta-Progression Upgrades
// ===================
export interface ResearchUpgrade {
  id: 'startingUnits' | 'productionSpeed' | 'defenseResistance';
  nameKey: string;          // Turkish display name key
  descriptionKey: string;   // Turkish description key
  level: number;
  maxLevel: number;
  baseCost: number;
  costMultiplier: number;   // cost = baseCost * (costMultiplier ^ level)
  effectPerLevel: number;   // +X units, +X% speed, -X% damage
}

// ===================
// Level Configuration
// ===================
export interface LevelConfig {
  levelNumber: number;
  towers: Tower[];
  paths: AttackPath[];
  artillery: NeutralArtillery[];
  dragonDens: DragonDen[];
  hazards: HazardType[];
  goldReward: number;
  starThresholds: {
    oneStar: number;   // seconds to complete
    twoStar: number;
    threeStar: number;
  };
}

// ===================
// Level Progress (saved per level)
// ===================
export interface LevelProgress {
  completed: boolean;
  stars: 0 | 1 | 2 | 3;
  bestTime: number;
}

// ===================
// Game State (battle in progress)
// ===================
export interface BattleState {
  levelConfig: LevelConfig | null;
  towers: Tower[];
  movingUnits: MovingUnit[];
  paths: AttackPath[];
  artillery: NeutralArtillery[];
  dragonDens: DragonDen[];
  activeHazards: HazardType[];
  isPlaying: boolean;
  isPaused: boolean;
  isVictory: boolean;
  isDefeat: boolean;
  elapsedTime: number;
  goldEarned: number;
}

// ===================
// Progress State (persistent)
// ===================
export interface ProgressState {
  currentLevel: number;
  gold: number;
  levelProgress: { [levelNumber: number]: LevelProgress };
  researchUpgrades: ResearchUpgrade[];
}

// ===================
// Screen Navigation
// ===================
export type ScreenName = 'menu' | 'levelMap' | 'researchLab' | 'battle';
