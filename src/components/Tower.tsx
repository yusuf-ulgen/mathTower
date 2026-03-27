import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { COLORS, SPACING, THEMES } from '../constants/theme';
import { useGameStore } from '../store/useGameStore';
import { Tower as TowerType, ThemeType } from '../types/game';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

interface Props {
  tower: TowerType;
}

export const Tower: React.FC<Props> = ({ tower }: Props) => {
  const { attackTower, updateTowerPosition, activeTheme } = useGameStore((state: any) => ({
    attackTower: state.attackTower,
    updateTowerPosition: state.updateTowerPosition,
    activeTheme: state.activeTheme,
  }));

  const handleLayout = (event: any) => {
    const { x, y } = event.nativeEvent.layout;
    updateTowerPosition(tower.id, x, y);
  };

  return (
    <View style={styles.container} onLayout={handleLayout}>
      <TouchableOpacity 
        activeOpacity={0.8}
        onPress={() => attackTower(tower.id)}
        disabled={tower.type === 'player'}
      >
        <Unit 
          type={tower.type} 
          power={tower.power} 
          operation={tower.operation} 
          isBoss={tower.isBoss}
        />
        
        {/* Simple Tower Visuals */}
        <View style={[
          styles.body, 
          { 
            backgroundColor: THEMES[activeTheme as ThemeType].bg, 
            borderColor: (THEMES[activeTheme as ThemeType] as any)[tower.type] || '#334155' 
          },
          tower.isBoss && styles.bossBody
        ]}>
          <View style={[styles.window, { borderColor: THEMES[activeTheme as ThemeType].accent }]} />
        </View>
        <View style={[
          styles.base, 
          { backgroundColor: THEMES[activeTheme as ThemeType].bg },
          tower.isBoss && styles.bossBase
        ]} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginHorizontal: SPACING.lg,
  },
  body: {
    width: 60,
    height: 100,
    borderLeftWidth: 4,
    borderRightWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  bossBody: {
    width: 100,
    height: 160,
    backgroundColor: '#1e1b4b', 
  },
  window: {
    width: 20,
    height: 30,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 10,
    borderWidth: 2,
  },
  base: {
    width: 80,
    height: 10,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  bossBase: {
    width: 120,
  },
});
