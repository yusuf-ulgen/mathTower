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

export const BattleTower: React.FC<Props> = React.memo(({
  tower,
  onTap,
  onLongPress,
  isSelected,
  isNightHidden,
}) => {
  const colors = TOWER_COLORS[tower.color] || TOWER_COLORS.neutral;
  const pulseAnim = useSharedValue(1);
  const flagAnim = useSharedValue(0);
  const glimmerAnim = useSharedValue(0);

  React.useEffect(() => {
    pulseAnim.value = withRepeat(
      withTiming(1.05, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );

    flagAnim.value = withRepeat(
      withTiming(1, { duration: 800, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );

    glimmerAnim.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 3000 }),
        withTiming(0, { duration: 0 })
      ),
      -1,
      false
    );
  }, []);

  const productionStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnim.value }],
  }));

  const glimmerStyle = useAnimatedStyle(() => ({
    opacity: Math.max(0, 1 - Math.abs(glimmerAnim.value * 2 - 1)) * 0.3,
    transform: [{ translateX: -50 + glimmerAnim.value * 150 }],
  }));

  const flagStyle = useAnimatedStyle(() => ({
    transform: [
      { skewY: `${flagAnim.value * 8}deg` },
      { scaleX: 1 + flagAnim.value * 0.05 }
    ],
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
      {isSelected && (
        <View style={[styles.selectionRing, { borderColor: colors.light }]} />
      )}
      <View style={styles.flagPole}>
        <Animated.View style={[styles.flag, { backgroundColor: colors.light }, flagStyle]} />
      </View>
      <View style={styles.battlementRow}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={[styles.merlon, { backgroundColor: colors.dark }]} />
        ))}
      </View>
      <View style={[styles.towerTop, { backgroundColor: colors.main, borderColor: colors.dark }]}>
        <View style={styles.windowRow}>
          <View style={[styles.window, { backgroundColor: '#000' }]} />
        </View>
      </View>
      <View style={[styles.towerBody, { backgroundColor: colors.main, borderColor: colors.dark }]}>
        <View style={styles.shading} />
        <View style={[styles.stoneDetail, { top: '20%', left: '10%' }]} />
        <View style={[styles.stoneDetail, { top: '40%', right: '15%' }]} />
        <View style={[styles.stoneDetail, { top: '70%', left: '25%' }]} />
        <Animated.View style={[styles.glimmer, glimmerStyle]} />
      </View>
      <View style={[styles.doorArch, { borderColor: colors.dark }]}>
        <View style={[styles.door, { backgroundColor: '#3D2B1F' }]} />
      </View>
      <View style={[styles.base, { backgroundColor: colors.dark }]} />
      <Animated.View style={[styles.unitBadge, { backgroundColor: colors.main }, productionStyle]}>
        <Text style={styles.unitCount}>
          {isNightHidden ? '?' : tower.unitCount}
        </Text>
      </Animated.View>
      {tower.level > 1 && (
        <View style={[styles.levelBadge, { backgroundColor: COLORS.primary }]}>
          <Text style={styles.levelText}>L{tower.level}</Text>
        </View>
      )}
      {canUpgrade && tower.unitCount >= upgradeCost && (
        <View style={styles.upgradeHint}>
          <Animated.Text style={[styles.upgradeText, productionStyle]}>⚡</Animated.Text>
        </View>
      )}
      {tower.isBoss && (
        <View style={styles.bossCrown}>
          <Text style={styles.crownEmoji}>👑</Text>
        </View>
      )}
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: 70,
    alignItems: 'center',
    zIndex: 10,
  },
  selectionRing: {
    position: 'absolute',
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 2,
    borderStyle: 'dashed',
    top: -7,
    left: -7,
    zIndex: -1,
    opacity: 0.5,
  },
  battlementRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 46,
    marginBottom: -1,
    zIndex: 3,
  },
  merlon: {
    width: 10,
    height: 6,
    borderTopLeftRadius: 1,
    borderTopRightRadius: 1,
  },
  towerTop: {
    width: 50,
    height: 14,
    borderWidth: 1.5,
    borderBottomWidth: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  towerBody: {
    width: 44,
    height: 36,
    borderWidth: 1.5,
    borderTopWidth: 0,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    zIndex: 1,
  },
  shading: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '35%',
    backgroundColor: 'rgba(0,0,0,0.12)',
  },
  glimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 10,
    backgroundColor: 'rgba(255,255,255,0.4)',
    transform: [{ skewX: '-20deg' }],
  },
  windowRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  window: {
    width: 5,
    height: 6,
    borderRadius: 1,
  },
  stoneDetail: {
    position: 'absolute',
    width: 6,
    height: 1.5,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 1,
  },
  doorArch: {
    width: 16,
    height: 12,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderWidth: 1.5,
    borderBottomWidth: 0,
    overflow: 'hidden',
    marginTop: -1,
    zIndex: 2,
  },
  door: {
    flex: 1,
    marginTop: 1.5,
  },
  base: {
    width: 56,
    height: 5,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
    zIndex: 0,
  },
  unitBadge: {
    position: 'absolute',
    bottom: -20,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
    minWidth: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  unitCount: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '900',
  },
  levelBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 3,
    borderRadius: 3,
  },
  levelText: {
    color: '#000',
    fontSize: 7,
    fontWeight: '900',
  },
  upgradeHint: {
    position: 'absolute',
    top: -18,
    left: -8,
  },
  upgradeText: {
    fontSize: 14,
  },
  flagPole: {
    position: 'absolute',
    top: -20,
    left: 38,
    width: 1.5,
    height: 20,
    backgroundColor: '#333',
    zIndex: 5,
  },
  flag: {
    position: 'absolute',
    top: 0,
    left: 1.5,
    width: 14,
    height: 8,
    borderTopRightRadius: 1,
    borderBottomRightRadius: 1,
  },
  bossCrown: {
    position: 'absolute',
    top: -30,
    alignSelf: 'center',
  },
  crownEmoji: {
    fontSize: 18,
  },
});
