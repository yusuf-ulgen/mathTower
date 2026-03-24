import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Tower as TowerType } from '../types/game';
import { EntityCard } from './EntityCard';
import { COLORS, SPACING } from '../constants/theme';
import { useGameStore } from '../store/useGameStore';

import Animated, { FadeIn, FadeOut, Layout } from 'react-native-reanimated';

interface Props {
  tower: TowerType;
}

export const Tower: React.FC<Props> = ({ tower }) => {
  const attackEnemy = useGameStore((state) => state.attackEnemy);

  return (
    <View style={styles.container}>
      {/* Tower Roof */}
      <View style={styles.roof} />

      <View style={styles.body}>
        {tower.floors.map((floor) => (
          <Animated.View 
            key={floor.id} 
            layout={Layout.springify()} 
            style={styles.floor}
          >
            {floor.enemy ? (
              <Animated.View entering={FadeIn.duration(400)} exiting={FadeOut.duration(300)}>
                <EntityCard 
                  entity={floor.enemy} 
                  onPress={(x, y) => attackEnemy(tower.id, floor.id, x, y)} 
                />
              </Animated.View>
            ) : (
              <Animated.View entering={FadeIn} style={styles.emptyFloor}>
                <Text style={styles.clearedText}>CLEARED</Text>
              </Animated.View>
            )}
          </Animated.View>
        ))}
      </View>

      {/* Tower Base */}
      <View style={styles.base} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginHorizontal: SPACING.md,
  },
  roof: {
    width: 140,
    height: 20,
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    borderBottomWidth: 4,
    borderBottomColor: COLORS.background,
  },
  body: {
    backgroundColor: COLORS.surface,
    padding: SPACING.sm,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderColor: '#334155',
  },
  floor: {
    paddingVertical: SPACING.sm,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.background,
    minHeight: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyFloor: {
    width: 120,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.3,
  },
  clearedText: {
    color: COLORS.textDim,
    fontSize: 12,
    fontWeight: 'bold',
  },
  base: {
    width: 160,
    height: 10,
    backgroundColor: COLORS.surface,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
});
