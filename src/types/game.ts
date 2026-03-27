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

export interface GameState {
  playerTower: Tower; // The tower player starts with
  enemyTowers: Tower[];
  difficulty: DifficultyMode;
  gold: number;
  score: number;
  isGameOver: boolean;
  timeLeft: number;
  highScores: { [key in DifficultyMode]: number }; // Progress (last level reached)
}
