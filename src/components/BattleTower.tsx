// =============================================
// MATH TOWER WAR — Battle Tower Component
// Stone fortress tower with faction colors
// =============================================

import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { Tower } from '../types/game';
import { COLORS, TOWER_COLORS, GAME } from '../constants/theme';
import { getTowerUpgradeCost } from '../engine/gameEngine';

interface Props {
  tower: Tower;
  onTap: (towerId: string) => void;
  onLongPress?: (towerId: string) => void;
  isSelected?: boolean;
  isNightHidden?: boolean;
}

export const BattleTower: React.FC<Props> = ({
  tower,
  onTap,
  onLongPress,
  isSelected,
  isNightHidden,
}) => {
  const colors = TOWER_COLORS[tower.color] || TOWER_COLORS.neutral;
  const pulseAnim = useSharedValue(1);

  React.useEffect(() => {
    pulseAnim.value = withRepeat(
      withSequence(
        withTiming(1.04, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const productionStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnim.value }],
  }));

  const towerScale = tower.isBoss ? 1.3 : 1;
  const upgradeCost = getTowerUpgradeCost(tower);
  const canUpgrade = tower.color === 'blue' && tower.level < GAME.MAX_TOWER_LEVEL;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onTap(tower.id)}
      onLongPress={() => onLongPress?.(tower.id)}
      style={[
        styles.container,
        {
          left: tower.position.x - 35,
          top: tower.position.y - 50,
          transform: [{ scale: towerScale }],
        },
      ]}
    >
      {/* Selection glow */}
      {isSelected && (
        <View style={[styles.selectionRing, { borderColor: colors.light }]} />
      )}

      {/* Battlement / Crown */}
      <View style={styles.battlementRow}>
        {[0, 1, 2, 3, 4].map((i) => (
          <View key={i} style={[styles.merlon, { backgroundColor: colors.dark }]} />
        ))}
      </View>

      {/* Tower Body */}
      <View style={[styles.towerBody, { backgroundColor: colors.main, borderColor: colors.dark }]}>
        {/* Windows */}
        <View style={styles.windowRow}>
          <View style={[styles.window, { borderColor: colors.dark }]} />
          <View style={[styles.window, { borderColor: colors.dark }]} />
          <View style={[styles.window, { borderColor: colors.dark }]} />
        </View>

        {/* Stone texture lines */}
        <View style={[styles.stoneLine, { backgroundColor: colors.dark, top: '35%' }]} />
        <View style={[styles.stoneLine, { backgroundColor: colors.dark, top: '60%' }]} />
      </View>

      {/* Door */}
      <View style={[styles.doorArch, { borderColor: colors.dark }]}>
        <View style={[styles.door, { backgroundColor: '#8B6914' }]} />
      </View>

      {/* Base */}
      <View style={[styles.base, { backgroundColor: colors.dark }]} />

      {/* Unit count badge */}
      <Animated.View style={[styles.unitBadge, { backgroundColor: colors.main }, productionStyle]}>
        <Text style={styles.unitCount}>
          {isNightHidden ? '?' : tower.unitCount}
        </Text>
      </Animated.View>

      {/* Level indicator */}
      {tower.level > 1 && (
        <View style={[styles.levelBadge, { backgroundColor: COLORS.primary }]}>
          <Text style={styles.levelText}>Lv.{tower.level}</Text>
        </View>
      )}

      {/* Upgrade indicator */}
      {canUpgrade && tower.unitCount >= upgradeCost && (
        <View style={styles.upgradeHint}>
          <Text style={styles.upgradeText}>⬆</Text>
        </View>
      )}

      {/* Flag */}
      <View style={styles.flagPole}>
        <View style={[styles.flag, { backgroundColor: colors.light }]} />
      </View>

      {/* Boss crown */}
      {tower.isBoss && (
        <View style={styles.bossCrown}>
          <Text style={styles.crownEmoji}>👑</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: 70,
    alignItems: 'center',
    zIndex: 10,
  },
  selectionRing: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderStyle: 'dashed',
    top: -5,
    left: -5,
    zIndex: -1,
  },
  battlementRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 60,
    marginBottom: -1,
  },
  merlon: {
    width: 8,
    height: 8,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  towerBody: {
    width: 60,
    height: 50,
    borderWidth: 2,
    borderTopWidth: 0,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  windowRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 6,
  },
  window: {
    width: 8,
    height: 12,
    backgroundColor: '#000',
    borderRadius: 4,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    borderWidth: 1,
  },
  stoneLine: {
    position: 'absolute',
    width: '100%',
    height: 1,
    opacity: 0.3,
  },
  doorArch: {
    width: 20,
    height: 16,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderWidth: 2,
    borderBottomWidth: 0,
    overflow: 'hidden',
    marginTop: -1,
  },
  door: {
    flex: 1,
    marginTop: 2,
  },
  base: {
    width: 70,
    height: 6,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
  },
  unitBadge: {
    position: 'absolute',
    bottom: -18,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    minWidth: 35,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  unitCount: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '900',
  },
  levelBadge: {
    position: 'absolute',
    top: -14,
    right: -8,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 6,
  },
  levelText: {
    color: '#000',
    fontSize: 9,
    fontWeight: '900',
  },
  upgradeHint: {
    position: 'absolute',
    top: -18,
    left: -8,
  },
  upgradeText: {
    fontSize: 16,
  },
  flagPole: {
    position: 'absolute',
    top: -18,
    left: 30,
    width: 2,
    height: 18,
    backgroundColor: '#666',
  },
  flag: {
    position: 'absolute',
    top: 0,
    left: 2,
    width: 12,
    height: 8,
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
  },
  bossCrown: {
    position: 'absolute',
    top: -28,
    alignSelf: 'center',
  },
  crownEmoji: {
    fontSize: 18,
  },
});
