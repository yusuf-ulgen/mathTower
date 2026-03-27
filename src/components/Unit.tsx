import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { User } from 'lucide-react-native';
import Animated from 'react-native-reanimated';
import { COLORS, SPACING, THEMES } from '../constants/theme';
import { MathOperation, ThemeType } from '../types/game';
import { useGameStore } from '../store/useGameStore';

interface Props {
  type: 'player' | 'enemy' | 'neutral';
  power: number;
  operation?: MathOperation;
  isBoss?: boolean;
}

export const Unit: React.FC<Props> = ({ type, power, operation, isBoss }: Props) => {
  const {
    activeTheme
  } = useGameStore((state: any) => ({
    activeTheme: state.activeTheme
  }));

  const bgColor = (THEMES[activeTheme as ThemeType] as any)[type] || '#94A3B8';

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
      <View style={[
        styles.badge,
        { backgroundColor: bgColor },
        isBoss && styles.bossBadge
      ]}>
        <Text style={[styles.badgeText, isBoss && styles.bossText]}>
          {operation ? formatOperation(operation) : power}
        </Text>
      </View>

      {/* The Unit (Soldier) Icon */}
      <Animated.View style={[styles.unitBody, { backgroundColor: bgColor }]}>
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
  bossBadge: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 12,
  },
  badgeText: {
    color: '#FFF',
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
