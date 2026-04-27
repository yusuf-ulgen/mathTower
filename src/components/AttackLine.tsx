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

// Separate individual line for better memoization
const SinglePathLine = React.memo(({ from, to, isActive }: { from: any, to: any, isActive: boolean }) => {
  const lineColor = isActive ? COLORS.primary : 'rgba(255, 255, 255, 0.08)';
  const lineWidth = isActive ? 2 : 1;

  return (
    <Line
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
});

export const AttackLines: React.FC = () => {
  // Select only the data we need to avoid frequent re-renders
  const paths = useGameStore((state) => state.paths);
  const towerPositions = useGameStore((state) => 
    state.towers.map(t => ({ id: t.id, x: t.position.x, y: t.position.y }))
  );
  const activePathIds = useGameStore((state) => 
    state.attackQueues.map(q => q.pathId)
  );

  const towerMap = React.useMemo(() => {
    const map: { [id: string]: { x: number; y: number } } = {};
    towerPositions.forEach((t) => {
      map[t.id] = { x: t.x, y: t.y };
    });
    return map;
  }, [towerPositions]);

  const activeSet = React.useMemo(() => new Set(activePathIds), [activePathIds]);

  return (
    <Svg
      width={SCREEN_W}
      height={SCREEN_H}
      style={StyleSheet.absoluteFill}
      pointerEvents="none"
    >
      {paths.map((path) => (
        <SinglePathLine
          key={path.id}
          from={towerMap[path.fromTowerId]}
          to={towerMap[path.toTowerId]}
          isActive={activeSet.has(path.id)}
        />
      ))}
    </Svg>
  );
};
