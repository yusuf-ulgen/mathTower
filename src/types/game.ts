export type EntityType = 'hero' | 'enemy' | 'boss' | 'mystery';

export interface HeroSkin {
  id: string;
  name: string;
  icon: 'sword' | 'shield' | 'ninja' | 'robot';
  color: string;
  price: number;
}

export interface Entity {
  id: string;
  type: EntityType;
  power: number;
}

export interface Floor {
  id: string;
  enemy: Entity | null;
}

export interface Tower {
  id: string;
  floors: Floor[];
}

export interface GameState {
  hero: Entity;
  towers: Tower[];
  currentLevel: number;
  isGameOver: boolean;
  score: number;
}
