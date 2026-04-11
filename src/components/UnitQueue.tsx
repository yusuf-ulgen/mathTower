// =============================================
// MATH TOWER WAR — Unit Queue (Single-file line)
// Renders all moving units with individual animations
// =============================================

import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
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
}> = React.memo(({ unit, fromTower, toTower }) => {
  const pos = getUnitWorldPosition(unit, fromTower, toTower);
  if (!pos) return null;

  // Determine direction for flipping
  const facingLeft = fromTower && toTower
    ? toTower.position.x < fromTower.position.x
    : false;

  return (
    <View
      style={[
        styles.unitContainer,
        {
          left: pos.x - 8,
          top: pos.y - 8,
          transform: [{ scaleX: facingLeft ? -1 : 1 }],
        },
      ]}
    >
      <SpartanUnit
        color={unit.color}
        size={20}
        isMoving={true}
        value={unit.value > 1 ? unit.value : undefined}
      />
    </View>
  );
});

// The full queue renderer
export const UnitQueue: React.FC = () => {
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

  // Limit rendered units for performance (max 150 since rendering is lightweight now)
  const visibleUnits = useMemo(() => {
    if (movingUnits.length <= 150) return movingUnits;
    const playerUnits = movingUnits.filter((u) => u.color === 'blue');
    const enemyUnits = movingUnits.filter((u) => u.color !== 'blue');
    const maxEnemy = Math.max(10, 150 - playerUnits.length);
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
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  unitContainer: {
    position: 'absolute',
    zIndex: 20,
  },
});
