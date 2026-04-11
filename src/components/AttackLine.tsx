// =============================================
// MATH TOWER WAR — Attack Line (SVG Dashed)
// Draws dashed lines between connected towers
// =============================================

import React from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import Svg, { Line, Defs, Marker, Circle } from 'react-native-svg';
import { useGameStore } from '../store/useGameStore';
import { COLORS, TOWER_COLORS } from '../constants/theme';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

export const AttackLines: React.FC = () => {
  const paths = useGameStore((state) => state.paths);
  const towers = useGameStore((state) => state.towers);
  const attackQueues = useGameStore((state) => state.attackQueues);

  // Create tower position lookup
  const towerMap = React.useMemo(() => {
    const map: { [id: string]: { x: number; y: number; color: string } } = {};
    towers.forEach((t) => {
      map[t.id] = { x: t.position.x, y: t.position.y, color: t.color };
    });
    return map;
  }, [towers]);

  // Check which paths have active attacks
  const activePathIds = React.useMemo(() => {
    return new Set(attackQueues.map((q) => q.pathId));
  }, [attackQueues]);

  return (
    <Svg
      width={SCREEN_W}
      height={SCREEN_H}
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
    >
      {paths.map((path) => {
        const from = towerMap[path.fromTowerId];
        const to = towerMap[path.toTowerId];
        if (!from || !to) return null;

        const isActive = activePathIds.has(path.id);
        const lineColor = isActive
          ? COLORS.primary
          : 'rgba(255, 255, 255, 0.08)';
        const lineWidth = isActive ? 2 : 1;

        return (
          <Line
            key={path.id}
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            stroke={lineColor}
            strokeWidth={lineWidth}
            strokeDasharray={isActive ? '8,4' : '4,8'}
            strokeLinecap="round"
          />
        );
      })}
    </Svg>
  );
};
