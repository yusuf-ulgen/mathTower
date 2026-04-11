// =============================================
// MATH TOWER WAR — Hazard Overlay
// Night Mode & Icy Ground effects
// =============================================

import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { HazardType, Tower } from '../types/game';
import { COLORS } from '../constants/theme';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

interface Props {
  hazards: HazardType[];
  playerTowers: Tower[];
}

export const HazardOverlay: React.FC<Props> = ({ hazards, playerTowers }) => {
  const iceShimmer = useSharedValue(0);

  const hasNight = hazards.includes('nightMode');
  const hasIce = hazards.includes('icyGround');

  useEffect(() => {
    if (hasIce) {
      iceShimmer.value = withRepeat(
        withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    }
  }, [hasIce]);

  const iceStyle = useAnimatedStyle(() => ({
    opacity: 0.05 + iceShimmer.value * 0.08,
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Night Mode Overlay */}
      {hasNight && (
        <View style={styles.nightOverlay}>
          {/* Visibility circles around player towers */}
          {playerTowers.map((tower) => (
            <View
              key={tower.id}
              style={[
                styles.visibilityCircle,
                {
                  left: tower.position.x - 60,
                  top: tower.position.y - 60,
                },
              ]}
            />
          ))}
        </View>
      )}

      {/* Icy Ground Effect */}
      {hasIce && (
        <Animated.View style={[styles.iceOverlay, iceStyle]}>
          {/* Ice crystal decorations */}
          {Array.from({ length: 15 }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.iceCrystal,
                {
                  left: (i * 73 + 20) % SCREEN_W,
                  top: 100 + ((i * 137 + 50) % (SCREEN_H - 200)),
                  transform: [{ rotate: `${i * 24}deg` }],
                },
              ]}
            />
          ))}
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  nightOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.nightOverlay,
    zIndex: 30,
  },
  visibilityCircle: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(0, 0, 20, 0)',
    borderWidth: 40,
    borderColor: 'rgba(255, 200, 50, 0.05)',
    shadowColor: '#FFA500',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 5,
  },
  iceOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.icyBlue,
    zIndex: 25,
  },
  iceCrystal: {
    position: 'absolute',
    width: 6,
    height: 6,
    backgroundColor: 'rgba(147, 197, 253, 0.3)',
    borderRadius: 1,
  },
});
