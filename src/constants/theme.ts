// =============================================
// MATH TOWER WAR — War Theme Constants
// =============================================

export const COLORS = {
  // Core backgrounds
  background: '#0A0E1A',
  surface: '#141B2D',
  surfaceLight: '#1E293B',

  // Primary accent (gold/brass)
  primary: '#D4AF37',
  primaryDark: '#B8941F',
  primaryLight: '#F0D060',

  // Faction colors
  playerBlue: '#2B7FFF',
  playerBlueDark: '#1A5FCC',
  playerBlueLight: '#5A9FFF',

  enemyRed: '#DC2626',
  enemyRedDark: '#B91C1C',
  enemyRedLight: '#EF4444',

  enemyPurple: '#7C3AED',
  enemyPurpleDark: '#6D28D9',
  enemyPurpleLight: '#A78BFA',

  enemyYellow: '#EAB308',
  enemyYellowDark: '#CA8A04',
  enemyYellowLight: '#FDE047',

  neutral: '#6B7280',
  neutralDark: '#4B5563',
  neutralLight: '#9CA3AF',

  // Text
  text: '#E8E0D0',
  textDim: '#8B8578',
  textBright: '#FFFFFF',

  // Status
  danger: '#EF4444',
  success: '#22C55E',
  warning: '#F59E0B',

  // Gate colors
  gatePositive: '#22C55E',
  gateNegative: '#EF4444',
  gateMultiply: '#3B82F6',
  gateDivide: '#F59E0B',

  // Hazard
  nightOverlay: 'rgba(0, 0, 20, 0.7)',
  icyBlue: '#93C5FD',

  // Misc
  gold: '#FCD34D',
  shadow: 'rgba(0, 0, 0, 0.5)',
};

// Color mapping by tower color
export const TOWER_COLORS: { [key: string]: { main: string; dark: string; light: string } } = {
  blue: { main: COLORS.playerBlue, dark: COLORS.playerBlueDark, light: COLORS.playerBlueLight },
  red: { main: COLORS.enemyRed, dark: COLORS.enemyRedDark, light: COLORS.enemyRedLight },
  purple: { main: COLORS.enemyPurple, dark: COLORS.enemyPurpleDark, light: COLORS.enemyPurpleLight },
  yellow: { main: COLORS.enemyYellow, dark: COLORS.enemyYellowDark, light: COLORS.enemyYellowLight },
  neutral: { main: COLORS.neutral, dark: COLORS.neutralDark, light: COLORS.neutralLight },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Game balance constants
export const GAME = {
  BASE_PRODUCTION_RATE: 1,      // 1 unit per second
  BASE_STARTING_UNITS: 5,
  UNIT_SPEED: 80,               // pixels per second
  UNIT_SPAWN_INTERVAL: 150,     // ms between each unit in a queue
  TOWER_UPGRADE_COST_MULT: 1.5,
  ARTILLERY_DISABLE_COST: 3,
  ARTILLERY_DISABLE_DURATION: 5000, // ms
  BOSS_UNIT_POWER: 10,
  MAX_TOWER_LEVEL: 5,
  PRODUCTION_PER_LEVEL: 0.3,    // +30% per tower level
  CAPACITY_PER_LEVEL: 10,       // +10 max capacity per level
};
