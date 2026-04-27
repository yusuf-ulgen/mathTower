// =============================================
// MATH TOWER WAR — Dragon Den View
// Boss building (indestructible, spawns boss units)
// =============================================

import React, { useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { DragonDen } from '../types/game';
import { COLORS } from '../constants/theme';

interface Props {
  den: DragonDen;
}

export const DragonDenView: React.FC<Props> = React.memo(({ den }) => {
  const pulseAnim = useSharedValue(0.5);

  useEffect(() => {
    pulseAnim.value = withRepeat(
      withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: pulseAnim.value * 0.4 + 0.2,
    transform: [{ scale: pulseAnim.value * 1.2 }],
  }));

  return (
    <View
      style={[
        styles.container,
        {
          left: den.position.x - 45,
          top: den.position.y - 45,
        },
      ]}
    >
      <Animated.View style={[styles.outerGlow, glowStyle]} />
      
      {/* Stone Cave Shape */}
      <View style={styles.caveBack}>
        <View style={styles.stone1} />
        <View style={styles.stone2} />
        <View style={styles.stone3} />
      </View>

      {/* Dark Entrance */}
      <View style={styles.entrance}>
        <View style={styles.eyeRow}>
          <View style={styles.eye} />
          <View style={styles.eye} />
        </View>
      </View>

      {/* Label */}
      <View style={styles.labelBadge}>
        <Text style={styles.labelText}>🐉 EJDERHA YUVASI</Text>
      </View>

      {/* Power indicator */}
      <View style={styles.powerBadge}>
        <Text style={styles.powerText}>💀 {den.bossUnitPower}</Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: 90,
    height: 90,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 8,
  },
  outerGlow: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 69, 0, 0.15)',
  },
  caveBack: {
    width: 70,
    height: 50,
    backgroundColor: '#4A4A4A',
    borderRadius: 35,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    borderWidth: 2,
    borderColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stone1: {
    position: 'absolute',
    top: -10,
    left: 10,
    width: 20,
    height: 15,
    backgroundColor: '#5A5A5A',
    borderRadius: 8,
  },
  stone2: {
    position: 'absolute',
    top: -5,
    right: 5,
    width: 25,
    height: 20,
    backgroundColor: '#3F3F3F',
    borderRadius: 10,
  },
  stone3: {
    position: 'absolute',
    bottom: 5,
    left: -5,
    width: 30,
    height: 15,
    backgroundColor: '#555',
    borderRadius: 7,
  },
  entrance: {
    position: 'absolute',
    bottom: 20,
    width: 34,
    height: 24,
    backgroundColor: '#1A1A1A',
    borderTopLeftRadius: 17,
    borderTopRightRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#000',
  },
  eyeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  eye: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#FF3300',
  },
  labelBadge: {
    position: 'absolute',
    bottom: -25,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  labelText: {
    color: '#FFD700',
    fontSize: 9,
    fontWeight: '900',
  },
  powerBadge: {
    position: 'absolute',
    top: -15,
    right: -10,
    backgroundColor: 'rgba(220, 20, 60, 0.9)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFF',
  },
  powerText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
