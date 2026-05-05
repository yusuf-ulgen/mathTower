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

  // Scale based on value — ensure it grows enough for large numbers
  const scale = value && value > 1 
    ? Math.min(1.6, 1 + (Math.log10(value)) * 0.25) 
    : 1;
  const s = size * scale;

  // Adjust font size based on number of digits
  const getFontSize = () => {
    if (!value) return s * 0.6;
    const digits = value.toString().length;
    if (digits >= 3) return s * 0.45;
    if (digits === 2) return s * 0.55;
    return s * 0.6;
  };

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
        padding: 1,
      }}>
        {/* Value inside if needed */}
        {value && value > 1 && (
          <Text 
            numberOfLines={1}
            adjustsFontSizeToFit={true}
            style={[styles.valueText, { fontSize: getFontSize() }]}
          >
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
