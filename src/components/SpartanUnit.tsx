import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { TOWER_COLORS } from '../constants/theme';
import { TowerColor } from '../types/game';

interface Props {
  color: TowerColor;
  size?: number;
  isMoving?: boolean;
  value?: number;
}

export const SpartanUnit: React.FC<Props> = React.memo(({ color, size = 16, value }) => {
  const colors = TOWER_COLORS[color] || TOWER_COLORS.neutral;

  return (
    <View style={[styles.container, { width: size, height: size, backgroundColor: colors.dark, borderColor: colors.light }]}>
      <View style={[styles.innerGlow, { backgroundColor: colors.main }]} />
      {value && value > 1 && (
        <View style={[styles.badge, { backgroundColor: '#000' }]}>
           <Text style={styles.badgeText}>{value}</Text>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    borderRadius: 50,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 3,
  },
  innerGlow: {
    width: '60%',
    height: '60%',
    borderRadius: 50,
    opacity: 0.8,
  },
  badge: {
    position: 'absolute',
    bottom: -6,
    paddingHorizontal: 3,
    paddingVertical: 1,
    borderRadius: 4,
    minWidth: 14,
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#333',
  },
  badgeText: {
    color: '#FFF',
    fontSize: 7,
    fontWeight: '900',
  },
});

