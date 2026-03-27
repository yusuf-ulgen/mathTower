import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { User } from 'lucide-react-native';
import Animated from 'react-native-reanimated';
import { COLORS, SPACING } from '../constants/theme';
import { MathOperation } from '../types/game';

interface Props {
  type: 'player' | 'enemy' | 'neutral';
  power: number;
  operation?: MathOperation;
  isBoss?: boolean;
}

export const Unit: React.FC<Props> = ({ type, power, operation, isBoss }: Props) => {
  const color = type === 'player' ? COLORS.player : type === 'enemy' ? COLORS.enemy : COLORS.neutral;

  const formatOperation = (op: MathOperation) => {
    if (op.expression) return op.expression;
    if (op.right === 0 && op.operator === '+') {
      return `√${op.left}`;
    }
    return `${op.left}${op.operator}${op.right}`;
  };

  const scale = isBoss ? 1.5 : 1;

  return (
    <View style={[styles.container, { transform: [{ scale }] }]}>
      {/* Math Operation or Power Display */}
      <View style={[styles.badge, { backgroundColor: color, minWidth: isBoss ? 80 : 50 }]}>
        <Text style={[styles.badgeText, isBoss && styles.bossText]}>
          {operation ? formatOperation(operation) : power}
        </Text>
      </View>

      {/* The Unit (Soldier) Icon */}
      <Animated.View style={[styles.unitBody, { backgroundColor: color }]}>
        <User color={COLORS.background} size={30} strokeWidth={3} />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 4,
    minWidth: 50,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  badgeText: {
    color: COLORS.background,
    fontWeight: '900',
    fontSize: 16,
  },
  bossText: {
    fontSize: 20,
  },
  unitBody: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
});
