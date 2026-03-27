import { create } from 'zustand';
import * as Haptics from 'expo-haptics';
import { Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GameState, Tower, DifficultyMode, MathOperator, MathOperation, JokerType } from '../types/game';

interface GameEffect {
  id: string;
  text: string;
  x: number;
  y: number;
}

interface GameStore extends GameState {
  currentLevel: number;
  effects: GameEffect[];
  combo: number;
  lastHitTime: number;
  isAiMode: boolean;
  attacking: { sourceId: string, targetId: string, count: number } | null;
  activeTab: 'shop' | 'game' | 'settings';
  isLevelStarted: boolean;
  isLevelCleared: boolean;
  inventory: { [key in JokerType]: number };
  activeJokers: { shield: boolean, timeFreeze: boolean };
  
  setActiveTab: (tab: 'shop' | 'game' | 'settings') => void;
  setDifficulty: (mode: DifficultyMode) => void;
  initLevel: () => void;
  attackTower: (targetId: string) => void;
  hitTower: (targetId: string) => void;
  completeAttack: (targetId: string) => void;
  updateTowerPosition: (id: string, x: number, y: number) => void;
  buyItem: (type: JokerType, price: number) => void;
  useJoker: (type: JokerType) => void;
  tick: () => void;
  goToMenu: () => void;
  resetGame: () => void;
  removeEffect: (id: string) => void;
  loadProgress: () => Promise<void>;
}

const STORAGE_KEY = 'math_tower_v2_progress';

const generateMathOperation = (difficulty: DifficultyMode, level: number, isBoss?: boolean): MathOperation => {
  const operators: MathOperator[] = ['+', '-', '*', '/'];
  
  if (isBoss) {
    const op1 = operators[Math.floor(Math.random() * 2)]; 
    const op2 = operators[Math.floor(Math.random() * 2) + 2]; 
    
    let a = Math.floor(Math.random() * 10) + 5;
    let b = Math.floor(Math.random() * 10) + 1;
    let c = Math.floor(Math.random() * 3) + 2;
    
    let subResult = op1 === '+' ? a + b : a - b;
    let result = op2 === '*' ? subResult * c : Math.floor(subResult / c);
    
    return {
      left: a,
      right: b,
      operator: op1,
      result: Math.max(1, result),
      expression: `(${a} ${op1} ${b}) ${op2} ${c}`
    };
  }

  const operator = operators[Math.floor(Math.random() * operators.length)];
  let left = Math.floor(Math.random() * (10 + level)) + 1;
  let right = Math.floor(Math.random() * (5 + level / 2)) + 1;

  if (operator === '/') {
    left = right * (Math.floor(Math.random() * 5) + 1);
  }

  let result = 0;
  switch (operator) {
    case '+': result = left + right; break;
    case '-': result = left - right; break;
    case '*': result = left * right; break;
    case '/': result = left / right; break;
  }

  if (difficulty === 'hard' && level > 5 && Math.random() > 0.7) {
    const val = Math.floor(Math.random() * 1000) + 1;
    return {
      left: val,
      right: 0,
      operator: '+',
      result: Math.round(Math.sqrt(val)),
      expression: `√${val}`
    };
  }

  return { left, right, operator, result: Math.round(result) };
};

export const useGameStore = create<GameStore>((set: any, get: any) => ({
  playerTower: { id: 'player', type: 'player', power: 5, x: 0, y: 0 },
  enemyTowers: [],
  difficulty: 'normal',
  gold: 0,
  score: 0,
  isGameOver: false,
  timeLeft: 25,
  highScores: { easy: 1, normal: 1, hard: 1 },
  currentLevel: 1,
  effects: [],
  combo: 0,
  lastHitTime: 0,
  isAiMode: false,
  attacking: null,
  activeTab: 'game',
  isLevelStarted: false,
  isLevelCleared: false,
  inventory: { timeFreeze: 0, weaken: 0, shield: 0 },
  activeJokers: { shield: false, timeFreeze: false },

  loadProgress: async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        set({ 
          highScores: parsed.highScores || { easy: 1, normal: 1, hard: 1 }, 
          gold: parsed.gold || 0,
          inventory: parsed.inventory || { timeFreeze: 0, weaken: 0, shield: 0 }
        });
      }
    } catch (e) {
      console.error('Failed to load progress', e);
    }
  },

  setActiveTab: (tab: 'shop' | 'game' | 'settings') => set({ activeTab: tab }),

  setDifficulty: (mode: DifficultyMode) => {
    const { highScores } = get();
    set({ difficulty: mode, currentLevel: highScores[mode] });
    get().initLevel();
  },

  buyItem: (type: JokerType, price: number) => {
    const { gold, inventory } = get();
    if (gold >= price) {
      const newInventory = { ...inventory, [type]: inventory[type] + 1 };
      set({ gold: gold - price, inventory: newInventory });
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ 
        highScores: get().highScores, 
        gold: gold - price,
        inventory: newInventory 
      }));
    }
  },

  useJoker: (type: JokerType) => {
    const { inventory, activeJokers, enemyTowers } = get();
    if (inventory[type] <= 0) return;

    const newInventory = { ...inventory, [type]: inventory[type] - 1 };
    
    if (type === 'timeFreeze') {
      set({ activeJokers: { ...activeJokers, timeFreeze: true }, inventory: newInventory });
      setTimeout(() => {
        set((state: GameStore) => ({ activeJokers: { ...state.activeJokers, timeFreeze: false } }));
      }, 5000);
    } else if (type === 'weaken') {
      const newTowers = enemyTowers.map((t: Tower) => ({
        ...t,
        power: Math.ceil((t.operation ? t.operation.result : t.power) / 2),
        operation: t.operation ? { ...t.operation, result: Math.ceil(t.operation.result / 2) } : undefined
      }));
      set({ enemyTowers: newTowers, inventory: newInventory });
    } else if (type === 'shield') {
      set({ activeJokers: { ...activeJokers, shield: true }, inventory: newInventory });
    }
  },

  tick: () => {
    const { timeLeft, isGameOver, isLevelCleared, activeJokers } = get();
    if (isGameOver || isLevelCleared || activeJokers.timeFreeze) return;
    
    if (timeLeft <= 0.1) {
      set({ timeLeft: 0, isGameOver: true });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else {
      set({ timeLeft: timeLeft - 0.1 });
    }
  },

  initLevel: () => {
    const { difficulty, currentLevel } = get();
    const isBossLevel = currentLevel % 10 === 0;
    const towerCount = isBossLevel ? 1 : 3 + Math.floor(currentLevel / 10);
    const enemyTowers: Tower[] = [];

    for (let i = 0; i < towerCount; i++) {
      enemyTowers.push({
        id: `enemy-${i}`,
        type: 'enemy',
        power: 0,
        operation: generateMathOperation(difficulty, currentLevel, isBossLevel),
        x: isBossLevel ? (Dimensions.get('window').width / 2) - 40 : 150 + i * 140,
        y: 0,
        isBoss: isBossLevel
      });
    }

    let startingTime = 0;
    if (difficulty === 'easy') startingTime = towerCount * 10;
    else if (difficulty === 'normal') startingTime = towerCount * 5;
    else startingTime = 10;

    set({ 
      enemyTowers, 
      timeLeft: startingTime, 
      isGameOver: false,
      playerTower: { ...get().playerTower, power: 5 + (currentLevel - 1) * 2 },
      activeJokers: { shield: false, timeFreeze: false },
      isLevelStarted: true
    });
  },

  attackTower: (targetId: string) => {
    const { playerTower, enemyTowers, isGameOver, attacking } = get();
    if (isGameOver || attacking) return;

    const target = enemyTowers.find((t: Tower) => t.id === targetId);
    if (!target || target.type !== 'enemy') return;

    const source = playerTower.power > 0 ? playerTower : enemyTowers.find((t: Tower) => t.type === 'player');
    if (!source) return;

    set({ attacking: { sourceId: source.id, targetId, count: source.power } });
  },

  hitTower: (targetId: string) => {
    const { playerTower, enemyTowers, activeJokers } = get();
    const target = enemyTowers.find((t: Tower) => t.id === targetId);
    if (!target || playerTower.power <= 0) return;

    let targetPower = target.type === 'enemy' ? (target.operation?.result || target.power) : target.power;
    
    if (playerTower.power < targetPower && activeJokers.shield) {
      set({ activeJokers: { ...activeJokers, shield: false } });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return; 
    }

    let newPower = targetPower;
    let newType = target.type;

    if (newType === 'enemy' || newType === 'neutral') {
      newPower -= 1;
      if (newPower < 0) {
        newPower = 1;
        newType = 'player';
      } else if (newPower === 0) {
        newType = 'neutral';
      }
    } else {
      newPower += 1;
    }

    set((state: GameStore) => ({
      playerTower: { ...playerTower, power: playerTower.power - 1 },
      enemyTowers: state.enemyTowers.map((t: Tower) => 
        t.id === targetId ? { ...t, type: newType, power: newPower, operation: undefined } : t
      )
    }));
  },

  completeAttack: (targetId: string) => {
    const { enemyTowers, difficulty, currentLevel, highScores, gold } = get();
    
    if (enemyTowers.every((t: Tower) => t.type === 'player')) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const { timeLeft } = get();
      const goldMultiplier = difficulty === 'easy' ? 1 : difficulty === 'normal' ? 3 : 7;
      const isBossLevel = currentLevel % 10 === 0;
      const levelGold = (Math.floor(timeLeft) * goldMultiplier) + (isBossLevel ? 500 : 0);
      
      const newTotalGold = gold + levelGold;
      const newHighScores = { ...highScores, [difficulty]: currentLevel + 1 };
      
      set({ 
        gold: newTotalGold, 
        currentLevel: currentLevel + 1, 
        highScores: newHighScores,
        isLevelCleared: true 
      });
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ 
        highScores: newHighScores, 
        gold: newTotalGold,
        inventory: get().inventory 
      }));
      
      setTimeout(() => get().initLevel(), 1500);
    }
  },

  goToMenu: () => set({ isLevelStarted: false, isLevelCleared: false, isGameOver: false }),

  updateTowerPosition: (id: string, x: number, y: number) => {
    const { playerTower, enemyTowers } = get();
    if (playerTower.id === id) {
      set({ playerTower: { ...playerTower, x, y } });
    } else {
      set({
        enemyTowers: enemyTowers.map((t: Tower) => t.id === id ? { ...t, x, y } : t)
      });
    }
  },

  removeEffect: (id: string) => set((state: GameStore) => ({
    effects: state.effects.filter((e: GameEffect) => e.id !== id)
  })),

  resetGame: () => {
    const { difficulty, highScores } = get();
    set({ score: 0, combo: 0, isGameOver: false, currentLevel: highScores[difficulty], activeJokers: { shield: false, timeFreeze: false }, isLevelStarted: false });
    get().initLevel();
  },
}));
