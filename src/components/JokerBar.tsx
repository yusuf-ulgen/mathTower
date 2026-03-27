import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Animated } from 'react-native';
import { useGameStore } from '../store/useGameStore';
import { COLORS, SPACING } from '../constants/theme';
import { Clock, TrendingDown, Shield } from 'lucide-react-native';
import { JokerType } from '../types/game';

export const JokerBar: React.FC = () => {
  const { inventory, activeJokers, useJoker } = useGameStore((state: any) => ({
    inventory: state.inventory,
    activeJokers: state.activeJokers,
    useJoker: state.useJoker,
  }));

  const jokers = [
    { id: 'timeFreeze', icon: Clock, color: COLORS.primary, label: 'Zaman' },
    { id: 'weaken', icon: TrendingDown, color: COLORS.enemy, label: 'Zayıflat' },
    { id: 'shield', icon: Shield, color: COLORS.accent, label: 'Kalkan' },
  ] as const;

  return (
    <View style={styles.container}>
      {jokers.map((joker) => {
        const Icon = joker.icon;
        const count = inventory[joker.id] || 0;
        const isActive = (activeJokers as any)[joker.id];
        
        return (
          <TouchableOpacity
            key={joker.id}
            style={[
              styles.jokerButton, 
              { borderColor: joker.color },
              isActive && { backgroundColor: joker.color }
            ]}
            onPress={() => useJoker(joker.id)}
            disabled={count <= 0 || isActive}
          >
            <Icon size={20} color={isActive ? COLORS.background : joker.color} />
            <View style={[styles.badge, { backgroundColor: joker.color }]}>
              <Text style={styles.badgeText}>{count}</Text>
            </View>
            <Text style={[styles.label, { color: joker.color }, isActive && { color: COLORS.background }]}>
              {joker.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: 20,
    gap: 20,
  },
  jokerButton: {
    width: 65,
    height: 65,
    borderRadius: 18,
    borderWidth: 2,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.background,
  },
  label: {
    fontSize: 9,
    fontWeight: 'bold',
    marginTop: 4,
  },
});
