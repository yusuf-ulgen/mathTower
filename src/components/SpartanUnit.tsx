import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  SharedValue,
} from 'react-native-reanimated';
import { TOWER_COLORS } from '../constants/theme';
import { TowerColor } from '../types/game';

interface Props {
  color: TowerColor;
  size?: number;
  isMoving?: boolean;
  value?: number;
  bobValue?: SharedValue<number>; // Global bobbing value for performance
}

/**
 * Stick-figure warrior unit.
 * 
 * Performance constraints:
 * - MAX 5 Views per unit (70 units × 5 = 350 Views total, manageable)
 * - No per-unit animations (uses shared bobValue only)
 * - All inline styles use only simple numeric properties
 * - React.memo prevents unnecessary re-renders
 */
export const SpartanUnit: React.FC<Props> = React.memo(({ color, size = 14, isMoving, value }) => {
  const colors = TOWER_COLORS[color] || TOWER_COLORS.neutral;

  // Scale based on value — very subtle
  const scale = value && value > 1 ? Math.min(1.2, 1 + (value - 1) * 0.05) : 1;
  const s = size * scale;

  return (
    <View style={[styles.container, { width: s, height: s }]}>
      {/* The "Flowing Circle" Unit - Simplified for GPU performance */}
      <View style={{
        width: s,
        height: s,
        borderRadius: s / 2,
        backgroundColor: colors.main,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        {/* Value inside if needed */}
        {value && value > 1 && (
          <Text style={[styles.valueText, { fontSize: s * 0.6 }]}>
            {value}
          </Text>
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  valueText: {
    color: '#FFF',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
