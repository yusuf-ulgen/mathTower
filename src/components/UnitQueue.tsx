// =============================================
// MATH TOWER WAR — Unit Queue (Single-file line)
// Renders all moving units with individual animations
// =============================================

import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  SharedValue,
} from 'react-native-reanimated';
import { useGameStore } from '../store/useGameStore';
import { SpartanUnit } from './SpartanUnit';
import { MovingUnit, Tower, AttackPath } from '../types/game';

// Calculate world position of a unit based on its progress
function getUnitWorldPosition(
  unit: MovingUnit,
  fromTower: Tower | undefined,
  toTower: Tower | undefined
): { x: number; y: number } | null {
  if (!fromTower || !toTower) return null;

  const fx = fromTower.position.x;
  const fy = fromTower.position.y;
  const tx = toTower.position.x;
  const ty = toTower.position.y;

  return {
    x: fx + (tx - fx) * unit.progress,
    y: fy + (ty - fy) * unit.progress,
  };
}

// Single animated unit on the battlefield
const AnimatedUnit: React.FC<{
  unit: MovingUnit;
  fromTower: Tower | undefined;
  toTower: Tower | undefined;
  bobValue: SharedValue<number>;
}> = React.memo(({ unit, fromTower, toTower, bobValue }) => {
  const pos = getUnitWorldPosition(unit, fromTower, toTower);
  if (!pos) return null;

  // Determine direction for flipping
  const facingLeft = fromTower && toTower
    ? toTower.position.x < fromTower.position.x
    : false;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: pos.x - 8 },
      { translateY: pos.y - 8 },
      { scaleX: facingLeft ? -1 : 1 }
    ],
  }));

  return (
    <Animated.View 
      style={[styles.unitContainer, animatedStyle]}
      renderToHardwareTextureAndroid={true}
      shouldRasterizeIOS={true}
    >
      <SpartanUnit
        color={unit.color}
        size={14}
        isMoving={true}
        value={unit.value > 1 ? unit.value : undefined}
      />
    </Animated.View>
  );
});

// The full queue renderer
export const UnitQueue: React.FC<{ bobValue: SharedValue<number> }> = React.memo(({ bobValue }) => {
  const movingUnits = useGameStore((state) => state.movingUnits);
  const towers = useGameStore((state) => state.towers);

  // Create a lookup map for towers by ID
  const towerMap = useMemo(() => {
    const map: { [id: string]: Tower } = {};
    towers.forEach((t) => {
      map[t.id] = t;
    });
    return map;
  }, [towers]);

  // Limit rendered units for performance (max 50 for rock-solid performance)
  const visibleUnits = useMemo(() => {
    if (movingUnits.length <= 50) return movingUnits;
    const playerUnits = movingUnits.filter((u) => u.color === 'blue');
    const enemyUnits = movingUnits.filter((u) => u.color !== 'blue');
    const maxEnemy = Math.max(10, 50 - playerUnits.length);
    return [...playerUnits, ...enemyUnits.slice(0, maxEnemy)];
  }, [movingUnits]);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {visibleUnits.map((unit) => (
        <AnimatedUnit
          key={unit.id}
          unit={unit}
          fromTower={towerMap[unit.fromTowerId]}
          toTower={towerMap[unit.toTowerId]}
          bobValue={bobValue}
        />
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  unitContainer: {
    position: 'absolute',
    zIndex: 20,
  },
});
