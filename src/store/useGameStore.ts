import { create } from 'zustand';
import * as Haptics from 'expo-haptics';
import { Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GameState, Tower, DifficultyMode, MathOperator, MathOperation, JokerType, UserStats, Quest, RunLog, BestRun, ThemeType, GameMode } from '../types/game';

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
  stats: UserStats;
  quests: Quest[];
  currentRunLog: RunLog[];
  bestRunLogs: { [key: string]: BestRun };
  
  setGameMode: (mode: GameMode) => void;
  setTheme: (theme: ThemeType) => void;
  buyTheme: (theme: ThemeType, price: number) => void;
  spinWheelReward: (rewardType: 'gold' | 'joker', amount: number, jokerType?: JokerType) => void;
  
  setActiveTab: (tab: 'shop' | 'game' | 'settings') => void;
  setDifficulty: (mode: DifficultyMode) => void;
  initLevel: () => void;
  attackTower: (targetId: string) => void;
  hitTower: (targetId: string) => void;
  completeAttack: (targetId: string) => void;
  updateTowerPosition: (id: string, x: number, y: number) => void;
  buyItem: (type: JokerType, price: number) => void;
  useJoker: (type: JokerType) => void;
  claimQuestReward: (questId: string) => void;
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
  gameMode: 'normal',
  activeTheme: 'default',
  unlockedThemes: ['default'],
  isLevelStarted: false,
  isLevelCleared: false,
  inventory: { timeFreeze: 0, weaken: 0, shield: 0 },
  activeJokers: { shield: false, timeFreeze: false },
  stats: {
    totalTowersCaptured: 0,
    totalLevelsCleared: 0,
    totalGoldEarned: 0,
    maxComboReached: 0,
    lastDailyReset: Date.now(),
    lastWheelSpin: 0
  },
  quests: [
    { id: 'q1', type: 'capture_towers', title: '10 Kule Fethet', target: 10, current: 0, reward: 100, isClaimed: false },
    { id: 'q2', type: 'clear_levels', title: '5 Bölüm Tamamla', target: 5, current: 0, reward: 250, isClaimed: false },
    { id: 'q3', type: 'earn_gold', title: '500 Altın Kazan', target: 500, current: 0, reward: 150, isClaimed: false },
  ],
  currentRunLog: [],
  bestRunLogs: {},

  loadProgress: async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        set({ 
          highScores: parsed.highScores || { easy: 1, normal: 1, hard: 1 }, 
          gold: parsed.gold || 0,
          inventory: parsed.inventory || { timeFreeze: 0, weaken: 0, shield: 0 },
          stats: parsed.stats || get().stats,
          quests: parsed.quests || get().quests,
          bestRunLogs: parsed.bestRunLogs || {},
          activeTheme: parsed.activeTheme || 'default',
          unlockedThemes: parsed.unlockedThemes || ['default']
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
        inventory: newInventory,
        stats: get().stats,
        quests: get().quests,
        bestRunLogs: get().bestRunLogs,
        activeTheme: get().activeTheme,
        unlockedThemes: get().unlockedThemes
      }));
    }
  },

  setTheme: (theme: ThemeType) => set({ activeTheme: theme }),

  buyTheme: (theme: ThemeType, price: number) => {
    const { gold, unlockedThemes } = get();
    if (gold >= price && !unlockedThemes.includes(theme)) {
      const newThemes = [...unlockedThemes, theme];
      set({ gold: gold - price, unlockedThemes: newThemes, activeTheme: theme });
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ 
        ...get(),
        gold: gold - price,
        unlockedThemes: newThemes,
        activeTheme: theme
      }));
    }
  },

  setGameMode: (mode: GameMode) => set({ gameMode: mode }),

  spinWheelReward: (rewardType: 'gold' | 'joker', amount: number, jokerType?: JokerType) => {
    const { gold, inventory, stats } = get();
    let newGold = gold;
    let newInventory = { ...inventory };

    if (rewardType === 'gold') {
      newGold += amount;
    } else if (rewardType === 'joker' && jokerType) {
      newInventory[jokerType] += amount;
    }

    const newStats = { ...stats, lastWheelSpin: Date.now() };
    set({ gold: newGold, inventory: newInventory, stats: newStats });
    
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ 
      ...get(),
      gold: newGold,
      inventory: newInventory,
      stats: newStats
    }));
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

  claimQuestReward: (questId: string) => {
    const { quests, gold, stats } = get();
    const quest = quests.find((q: Quest) => q.id === questId);
    if (!quest || quest.isClaimed || quest.current < quest.target) return;

    const newQuests = quests.map((q: Quest) => q.id === questId ? { ...q, isClaimed: true } : q);
    const newGold = gold + quest.reward;
    
    set({ gold: newGold, quests: newQuests });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ 
      highScores: get().highScores, 
      gold: newGold,
      inventory: get().inventory,
      stats: stats,
      quests: newQuests
    }));
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
    const { currentLevel, difficulty, gameMode } = get();
    
    // Player starts with 5 or 10 power
    const playerPower = 5;
    const playerTower: Tower = {
      id: 'player',
      type: 'player',
      power: playerPower,
      x: 0,
      y: 0,
    };

    let towerCount = 5;
    let enemyTowers: Tower[] = [];

    if (gameMode === 'weekly') {
      // Fixed hard level for everyone
      towerCount = 7;
      enemyTowers = [
        { id: 'e1', type: 'enemy', power: 2, operation: { left: 4, operator: '/', right: 2, result: 2 }, x: 0, y: 0 },
        { id: 'e2', type: 'enemy', power: 3, operation: { left: 9, operator: '/', right: 3, result: 3 }, x: 0, y: 0 },
        { id: 'e3', type: 'enemy', power: 7, operation: { left: 49, operator: '+', right: 0, result: 7, expression: '√49' }, x: 0, y: 0 }, // sqrt(49)
        { id: 'e4', type: 'enemy', power: 12, operation: { left: 144, operator: '+', right: 0, result: 12, expression: '√144' }, x: 0, y: 0 }, // sqrt(144)
        { id: 'e5', type: 'enemy', power: 25, isBoss: true, operation: { left: 5, operator: '*', right: 5, result: 25 }, x: 0, y: 0 },
        { id: 'e6', type: 'enemy', power: 50, isBoss: true, operation: { left: 2, operator: '*', right: 25, result: 50 }, x: 0, y: 0 },
        { id: 'e7', type: 'enemy', power: 100, isBoss: true, operation: { left: 50, right: 50, operator: '+', expression: '(50+50)*1', result: 100 }, x: 0, y: 0 },
      ];
    } else {
      // Random generation (Existing logic)
      const isBossLevel = currentLevel % 10 === 0;
      towerCount = isBossLevel ? 1 : 3 + Math.floor(currentLevel / 10);
      for (let i = 0; i < towerCount; i++) {
        enemyTowers.push({
          id: `enemy-${i}`,
          type: 'enemy',
          power: 0, // This will be overwritten by operation.result
          operation: generateMathOperation(difficulty, currentLevel, isBossLevel),
          x: isBossLevel ? (Dimensions.get('window').width / 2) - 40 : 150 + i * 140,
          y: 0,
          isBoss: isBossLevel
        });
      }
    }

    let startingTime = 0;
    if (gameMode === 'weekly') {
      startingTime = 15; // Hard challenge time
    } else {
      startingTime = difficulty === 'easy' ? towerCount * 10 : (difficulty === 'normal' ? towerCount * 5 : 10);
    }

    set({ 
      enemyTowers, 
      timeLeft: startingTime, 
      isGameOver: false,
      isLevelCleared: false,
      playerTower: { ...get().playerTower, power: 5 + (currentLevel - 1) * 2 },
      activeJokers: { shield: false, timeFreeze: false },
      isLevelStarted: true,
      currentRunLog: []
    });
  },

  attackTower: (targetId: string) => {
    const { playerTower, enemyTowers, isGameOver, attacking } = get();
    if (isGameOver || attacking) return;

    const target = enemyTowers.find((t: Tower) => t.id === targetId);
    if (!target || target.type !== 'enemy') return;

    const source = playerTower.power > 0 ? playerTower : enemyTowers.find((t: Tower) => t.type === 'player');
    if (!source) return;

    // Log the attack for ghost mode
    const { difficulty, currentLevel, timeLeft, currentRunLog } = get();
    const towerCount = enemyTowers.length + 1;
    const initialTime = difficulty === 'easy' ? towerCount * 10 : difficulty === 'normal' ? towerCount * 5 : 10;
    const timeOffset = initialTime - timeLeft;
    
    set({ 
      attacking: { sourceId: source.id, targetId, count: source.power },
      currentRunLog: [...currentRunLog, { timeOffset, targetId }]
    });
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

    set((state: GameStore) => {
      const isCaptured = newType === 'player';
      const updatedStats = { 
        ...state.stats, 
        totalTowersCaptured: isCaptured ? state.stats.totalTowersCaptured + 1 : state.stats.totalTowersCaptured 
      };
      
      const updatedQuests = state.quests.map((q: Quest) => {
        if (q.type === 'capture_towers' && isCaptured) {
          return { ...q, current: q.current + 1 };
        }
        return q;
      });

      return {
        playerTower: { ...playerTower, power: playerTower.power - 1 },
        enemyTowers: state.enemyTowers.map((t: Tower) => 
          t.id === targetId ? { ...t, type: newType, power: newPower, operation: undefined } : t
        ),
        stats: updatedStats,
        quests: updatedQuests
      };
    });
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
      
      const updatedStats = {
        ...get().stats,
        totalLevelsCleared: get().stats.totalLevelsCleared + 1,
        totalGoldEarned: get().stats.totalGoldEarned + levelGold
      };

      const updatedQuests = get().quests.map((q: Quest) => {
        if (q.type === 'clear_levels') return { ...q, current: q.current + 1 };
        if (q.type === 'earn_gold') return { ...q, current: q.current + levelGold };
        return q;
      });

      set({ 
        gold: newTotalGold, 
        currentLevel: currentLevel + 1, 
        highScores: newHighScores,
        isLevelCleared: true,
        stats: updatedStats,
        quests: updatedQuests
      });

      // Ghost Mode logic: check if this was a better run
      const levelKey = `${difficulty}_${currentLevel}`;
      const bestRun = get().bestRunLogs[levelKey];
      const newTotalTime = (difficulty === 'easy' ? (enemyTowers.length + 1) * 10 : difficulty === 'normal' ? (enemyTowers.length + 1) * 5 : 10) - timeLeft;

      if (!bestRun || newTotalTime < bestRun.totalTime) {
        const newBestRunLogs = {
          ...get().bestRunLogs,
          [levelKey]: { totalTime: newTotalTime, logs: get().currentRunLog }
        };
        set({ bestRunLogs: newBestRunLogs });
        
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ 
          highScores: newHighScores, 
          gold: newTotalGold,
          inventory: get().inventory,
          stats: updatedStats,
          quests: updatedQuests,
          bestRunLogs: newBestRunLogs
        }));
      } else {
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ 
          highScores: newHighScores, 
          gold: newTotalGold,
          inventory: get().inventory,
          stats: updatedStats,
          quests: updatedQuests,
          bestRunLogs: get().bestRunLogs
        }));
      }
      
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
