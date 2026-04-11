// =============================================
// MATH TOWER WAR — Progress Store (Persistent)
// Handles gold, level progress, research upgrades
// =============================================

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ProgressState, ResearchUpgrade, LevelProgress } from '../types/game';

const STORAGE_KEY = 'math_tower_war_progress_v1';

const DEFAULT_RESEARCH: ResearchUpgrade[] = [
  {
    id: 'startingUnits',
    nameKey: 'STARTING_UNITS',
    descriptionKey: 'STARTING_UNITS_DESC',
    level: 0,
    maxLevel: 20,
    baseCost: 100,
    costMultiplier: 1.5,
    effectPerLevel: 2, // +2 starting units
  },
  {
    id: 'productionSpeed',
    nameKey: 'PRODUCTION_SPEED',
    descriptionKey: 'PRODUCTION_SPEED_DESC',
    level: 0,
    maxLevel: 15,
    baseCost: 150,
    costMultiplier: 1.6,
    effectPerLevel: 0.1, // +10% production speed
  },
  {
    id: 'defenseResistance',
    nameKey: 'DEFENSE_RESISTANCE',
    descriptionKey: 'DEFENSE_RESISTANCE_DESC',
    level: 0,
    maxLevel: 10,
    baseCost: 200,
    costMultiplier: 1.8,
    effectPerLevel: 1, // -1 damage from artillery
  },
];

interface ProgressStore extends ProgressState {
  loadProgress: () => Promise<void>;
  saveProgress: () => Promise<void>;
  completeLevel: (levelNumber: number, stars: 0 | 1 | 2 | 3, goldEarned: number, time: number) => void;
  buyUpgrade: (upgradeId: string) => boolean;
  getUpgradeCost: (upgrade: ResearchUpgrade) => number;
  getStartingUnitsBonus: () => number;
  getProductionBonus: () => number;
  getArtilleryResistance: () => number;
  addGold: (amount: number) => void;
}

export const useProgressStore = create<ProgressStore>((set, get) => ({
  currentLevel: 1,
  gold: 0,
  levelProgress: {},
  researchUpgrades: DEFAULT_RESEARCH.map((r) => ({ ...r })),

  loadProgress: async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        set({
          currentLevel: parsed.currentLevel || 1,
          gold: parsed.gold || 0,
          levelProgress: parsed.levelProgress || {},
          researchUpgrades: parsed.researchUpgrades || DEFAULT_RESEARCH.map((r) => ({ ...r })),
        });
      }
    } catch (e) {
      console.error('Failed to load progress:', e);
    }
  },

  saveProgress: async () => {
    try {
      const { currentLevel, gold, levelProgress, researchUpgrades } = get();
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ currentLevel, gold, levelProgress, researchUpgrades })
      );
    } catch (e) {
      console.error('Failed to save progress:', e);
    }
  },

  completeLevel: (levelNumber, stars, goldEarned, time) => {
    const { levelProgress, currentLevel, gold } = get();
    const existing = levelProgress[levelNumber];

    const newProgress: LevelProgress = {
      completed: true,
      stars: existing ? Math.max(existing.stars, stars) as 0 | 1 | 2 | 3 : stars,
      bestTime: existing ? Math.min(existing.bestTime, time) : time,
    };

    const newLevelProgress = { ...levelProgress, [levelNumber]: newProgress };
    const newCurrentLevel = Math.max(currentLevel, levelNumber + 1);

    set({
      levelProgress: newLevelProgress,
      currentLevel: newCurrentLevel,
      gold: gold + goldEarned,
    });

    get().saveProgress();
  },

  buyUpgrade: (upgradeId) => {
    const { gold, researchUpgrades } = get();
    const upgrade = researchUpgrades.find((u) => u.id === upgradeId);
    if (!upgrade) return false;

    const cost = get().getUpgradeCost(upgrade);
    if (gold < cost || upgrade.level >= upgrade.maxLevel) return false;

    const newUpgrades = researchUpgrades.map((u) =>
      u.id === upgradeId ? { ...u, level: u.level + 1 } : u
    );

    set({
      gold: gold - cost,
      researchUpgrades: newUpgrades,
    });

    get().saveProgress();
    return true;
  },

  getUpgradeCost: (upgrade) => {
    return Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, upgrade.level));
  },

  getStartingUnitsBonus: () => {
    const upgrade = get().researchUpgrades.find((u) => u.id === 'startingUnits');
    return upgrade ? upgrade.level * upgrade.effectPerLevel : 0;
  },

  getProductionBonus: () => {
    const upgrade = get().researchUpgrades.find((u) => u.id === 'productionSpeed');
    return upgrade ? upgrade.level * upgrade.effectPerLevel : 0;
  },

  getArtilleryResistance: () => {
    const upgrade = get().researchUpgrades.find((u) => u.id === 'defenseResistance');
    return upgrade ? upgrade.level * upgrade.effectPerLevel : 0;
  },

  addGold: (amount) => {
    set({ gold: get().gold + amount });
    get().saveProgress();
  },
}));
