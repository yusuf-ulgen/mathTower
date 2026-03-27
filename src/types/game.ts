export type EntityType = 'player' | 'enemy' | 'neutral';
export type MathOperator = '+' | '-' | '*' | '/';
export type DifficultyMode = 'easy' | 'normal' | 'hard';

export interface MathOperation {
  left: number;
  right: number;
  operator: MathOperator;
  result: number;
  expression?: string; // For Boss levels: (5+5)*2
}

export interface HeroSkin {
  id: string;
  name: string;
  icon: 'sword' | 'shield' | 'ninja' | 'robot';
  color: string;
  price: number;
}

export type TowerType = 'player' | 'enemy' | 'neutral';

export interface Tower {
  id: string;
  type: TowerType;
  power: number; // Current army size
  operation?: MathOperation; // Only for enemy towers
  x: number; // For positioning
  y: number; // For positioning
  isBoss?: boolean;
}

export type JokerType = 'timeFreeze' | 'weaken' | 'shield';

export interface ShopItem {
  id: JokerType;
  name: string;
  price: number;
  description: string;
  icon: string;
}

export interface UserStats {
  totalTowersCaptured: number;
  totalLevelsCleared: number;
  totalGoldEarned: number;
  maxComboReached: number;
  lastDailyReset: number; 
  lastWheelSpin: number; // timestamp
}

export type ThemeType = 'default' | 'neon' | 'medieval' | 'space';
export type GameMode = 'normal' | 'weekly';

export type QuestType = 'capture_towers' | 'clear_levels' | 'earn_gold';

export interface Quest {
  id: string;
  type: QuestType;
  title: string;
  target: number;
  current: number;
  reward: number;
  isClaimed: boolean;
}

export interface RunLog {
  timeOffset: number;
  targetId: string;
}

export interface BestRun {
  totalTime: number;
  logs: RunLog[];
}

export interface GameState {
  playerTower: Tower; 
  enemyTowers: Tower[];
  difficulty: DifficultyMode;
  gameMode: GameMode;
  activeTheme: ThemeType;
  unlockedThemes: ThemeType[];
  gold: number;
  score: number;
  isGameOver: boolean;
  timeLeft: number;
  highScores: { [key in DifficultyMode]: number }; // Progress (last level reached)
}
