import { create } from 'zustand';
import * as Haptics from 'expo-haptics';
import { GameState, Entity, Tower, Floor, HeroSkin } from '../types/game';

interface GameEffect {
  id: string;
  text: string;
  x: number;
  y: number;
}

const SKINS: HeroSkin[] = [
  { id: 'default', name: 'Knight', icon: 'sword', color: '#4ADE80', price: 0 },
  { id: 'ninja', name: 'Ninja', icon: 'ninja', color: '#F472B6', price: 500 },
  { id: 'robot', name: 'Robot', icon: 'robot', color: '#38BDF8', price: 1500 },
];

interface GameStore extends GameState {
  isAiMode: boolean;
  effects: GameEffect[];
  combo: number;
  lastHitTime: number;
  gold: number;
  currentSkin: HeroSkin;
  unlockedSkins: string[];
  
  toggleAiMode: () => void;
  attackEnemy: (towerId: string, floorId: string, x?: number, y?: number) => void;
  resetGame: () => void;
  initLevel: (level: number) => void;
  removeEffect: (id: string) => void;
  runAiStep: () => void;
  buySkin: (skinId: string) => void;
  selectSkin: (skinId: string) => void;
}

const createEntity = (type: 'enemy' | 'mystery' | 'boss', power: number): Entity => ({
  id: Math.random().toString(36).substr(2, 9),
  type,
  power,
});

export const useGameStore = create<GameStore>((set, get) => ({
  hero: { id: 'hero', type: 'hero', power: 10 },
  towers: [],
  currentLevel: 1,
  isGameOver: false,
  score: 0,
  isAiMode: false,
  effects: [],
  combo: 0,
  lastHitTime: 0,
  gold: 0,
  currentSkin: SKINS[0],
  unlockedSkins: ['default'],

  toggleAiMode: () => set((state) => ({ isAiMode: !state.isAiMode })),

  initLevel: (level) => {
    const isBossLevel = level % 5 === 0;
    let towers: Tower[] = [];

    if (isBossLevel) {
      // ONE GIANT BOSS TOWER
      towers = [
        {
          id: 'boss-tower',
          floors: [
            { id: 'b1', enemy: createEntity('enemy', 20 + level * 2) },
            { id: 'b2', enemy: createEntity('mystery', 0) },
            { id: 'b3', enemy: createEntity('boss', 50 + level * 5) },
          ],
        }
      ];
    } else {
      towers = [
        {
          id: 'tower-1',
          floors: [
            { id: 'f1', enemy: createEntity('enemy', 5 + level) },
            { id: 'f2', enemy: Math.random() > 0.7 ? createEntity('mystery', 0) : createEntity('enemy', 12 + level) },
            { id: 'f3', enemy: createEntity('enemy', 25 + level) },
          ],
        },
        {
          id: 'tower-2',
          floors: [
            { id: 'f4', enemy: createEntity('enemy', 8 + level) },
            { id: 'f5', enemy: Math.random() > 0.5 ? createEntity('mystery', 0) : createEntity('enemy', 20 + level) },
          ],
        },
      ];
    }

    set({ towers, currentLevel: level, isGameOver: false, hero: { id: 'hero', type: 'hero', power: 10 + (level - 1) * 5 } });
  },

  attackEnemy: (towerId, floorId, x = 100, y = 100) => {
    const { hero, towers, isGameOver, combo, lastHitTime } = get();
    if (isGameOver) return;

    const tower = towers.find((t) => t.id === towerId);
    const floor = tower?.floors.find((f) => f.id === floorId);

    if (floor && floor.enemy) {
      const now = Date.now();
      let newCombo = (now - lastHitTime < 2000) ? combo + 1 : 1;
      
      let effectText = '';
      let win = false;
      let finalEnemyPower = floor.enemy.power;

      if (floor.enemy.type === 'mystery') {
        const isTrap = Math.random() > 0.4;
        finalEnemyPower = isTrap ? -Math.floor(hero.power * 0.4) : Math.floor(hero.power * 0.6);
        effectText = isTrap ? `${finalEnemyPower}` : `+${finalEnemyPower}`;
        win = true;
      } else {
        if (hero.power >= floor.enemy.power) {
          win = true;
          effectText = `+${floor.enemy.power}`;
        } else {
          set({ isGameOver: true, combo: 0 });
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          return;
        }
      }

      if (win) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); // STRONGER HAPTIC FOR PHASE 3
        const newPower = Math.max(1, hero.power + finalEnemyPower);
        const comboBonus = newCombo > 1 ? ` COMBO x${newCombo}!` : '';
        const newEffect: GameEffect = { 
          id: Math.random().toString(), 
          text: effectText + comboBonus, 
          x, y 
        };

        const newTowers = towers.map((t) => ({
          ...t,
          floors: t.id === towerId ? t.floors.map((f) => (f.id === floorId ? { ...f, enemy: null } : f)) : t.floors,
        }));

        set((state) => ({
          hero: { ...hero, power: newPower },
          towers: newTowers,
          score: state.score + Math.max(0, finalEnemyPower) * newCombo,
          gold: state.gold + Math.max(0, finalEnemyPower),
          effects: [...state.effects, newEffect],
          combo: newCombo,
          lastHitTime: now,
        }));

        const allCleared = newTowers.every((t) => t.floors.every((f) => f.enemy === null));
        if (allCleared) {
          setTimeout(() => get().initLevel(get().currentLevel + 1), 1000);
        }
      }
    }
  },

  buySkin: (skinId) => {
    const skin = SKINS.find(s => s.id === skinId);
    if (skin && get().gold >= skin.price && !get().unlockedSkins.includes(skinId)) {
      set(state => ({
        gold: state.gold - skin.price,
        unlockedSkins: [...state.unlockedSkins, skinId],
        currentSkin: skin
      }));
    }
  },

  selectSkin: (skinId) => {
    const skin = SKINS.find(s => s.id === skinId);
    if (skin && get().unlockedSkins.includes(skinId)) {
      set({ currentSkin: skin });
    }
  },

  runAiStep: () => {
    const { towers, isAiMode, isGameOver } = get();
    if (!isAiMode || isGameOver) return;

    const available = towers.flatMap(t => 
      t.floors.filter(f => f.enemy).map(f => ({ towerId: t.id, floor: f }))
    );

    if (available.length === 0) return;

    const shouldFail = Math.random() > 0.3;
    let target;
    
    if (shouldFail) {
      const candidates = available.filter(a => a.floor.enemy!.power > get().hero.power);
      target = candidates.length > 0 ? candidates[Math.floor(Math.random() * candidates.length)] : available[0];
    } else {
      const candidates = available.filter(a => a.floor.enemy!.power <= get().hero.power);
      target = candidates.length > 0 ? candidates[Math.floor(Math.random() * candidates.length)] : available[0];
    }

    if (target) {
      get().attackEnemy(target.towerId, target.floor.id);
    }
  },

  removeEffect: (id) => set((state) => ({
    effects: state.effects.filter(e => e.id !== id)
  })),

  resetGame: () => {
    set({ score: 0, gold: 0, isAiMode: false, combo: 0 });
    get().initLevel(1);
  },
}));
