import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Tower as TowerType } from '../types/game';
import { Unit } from './Unit';
import { COLORS, SPACING } from '../constants/theme';
import { useGameStore } from '../store/useGameStore';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

interface Props {
  tower: TowerType;
}

export const Tower: React.FC<Props> = ({ tower }: Props) => {
  const { attackTower, updateTowerPosition } = useGameStore((state: any) => ({
    attackTower: state.attackTower,
    updateTowerPosition: state.updateTowerPosition,
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
        <View style={[styles.body, tower.isBoss && styles.bossBody]}>
          <View style={styles.window} />
        </View>
        <View style={[styles.base, tower.isBoss && styles.bossBase]} />
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
    backgroundColor: COLORS.surface,
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  bossBody: {
    width: 100,
    height: 160,
    borderColor: COLORS.enemy,
    backgroundColor: '#1e1b4b', // Dark purple/blue for boss
  },
  window: {
    width: 20,
    height: 30,
    backgroundColor: COLORS.background,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#475569',
  },
  base: {
    width: 80,
    height: 10,
    backgroundColor: COLORS.surface,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  bossBase: {
    width: 120,
    backgroundColor: '#1e1b4b',
  },
});
