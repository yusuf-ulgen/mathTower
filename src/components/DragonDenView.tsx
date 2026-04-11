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

export const DragonDenView: React.FC<Props> = ({ den }) => {
  const eyeGlow = useSharedValue(0.3);
  const breathAnim = useSharedValue(0);

  useEffect(() => {
    eyeGlow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.3, { duration: 800, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    breathAnim.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2000 }),
        withTiming(0, { duration: 2000 })
      ),
      -1,
      true
    );
  }, []);

  const eyeStyle = useAnimatedStyle(() => ({
    opacity: eyeGlow.value,
  }));

  const smokeStyle = useAnimatedStyle(() => ({
    opacity: breathAnim.value * 0.4,
    transform: [{ translateY: -breathAnim.value * 10 }, { scale: 1 + breathAnim.value * 0.5 }],
  }));

  return (
    <View
      style={[
        styles.container,
        {
          left: den.position.x - 40,
          top: den.position.y - 40,
        },
      ]}
    >
      {/* Smoke */}
      <Animated.View style={[styles.smoke, smokeStyle]}>
        <View style={styles.smokeCloud1} />
        <View style={styles.smokeCloud2} />
      </Animated.View>

      {/* Cave/Den structure */}
      <View style={styles.cave}>
        {/* Cave opening */}
        <View style={styles.caveOpening}>
          {/* Eyes */}
          <View style={styles.eyeRow}>
            <Animated.View style={[styles.eye, eyeStyle]} />
            <Animated.View style={[styles.eye, eyeStyle]} />
          </View>
        </View>

        {/* Rocky sides */}
        <View style={styles.rockLeft} />
        <View style={styles.rockRight} />
        <View style={styles.rockTop} />
      </View>

      {/* Bones decoration */}
      <View style={styles.bones}>
        <View style={styles.bone} />
        <View style={[styles.bone, { transform: [{ rotate: '60deg' }] }]} />
      </View>

      {/* Label */}
      <View style={styles.labelBadge}>
        <Text style={styles.labelText}>🐉 EJDERHA İNİ</Text>
      </View>

      {/* Power indicator */}
      <View style={styles.powerBadge}>
        <Text style={styles.powerText}>💀 {den.bossUnitPower}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: 80,
    height: 80,
    alignItems: 'center',
    zIndex: 8,
  },
  smoke: {
    position: 'absolute',
    top: -20,
    flexDirection: 'row',
    gap: 5,
  },
  smokeCloud1: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(100, 100, 100, 0.5)',
  },
  smokeCloud2: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(100, 100, 100, 0.3)',
    marginTop: 4,
  },
  cave: {
    width: 70,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#2D1B0E',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  caveOpening: {
    width: 40,
    height: 30,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 0,
  },
  eyeRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: -4,
  },
  eye: {
    width: 8,
    height: 5,
    borderRadius: 4,
    backgroundColor: '#FF4500',
  },
  rockLeft: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    width: 20,
    height: 25,
    backgroundColor: '#5C4033',
    borderTopRightRadius: 10,
  },
  rockRight: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 20,
    height: 25,
    backgroundColor: '#5C4033',
    borderTopLeftRadius: 10,
  },
  rockTop: {
    position: 'absolute',
    top: 0,
    width: 50,
    height: 12,
    backgroundColor: '#5C4033',
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
  },
  bones: {
    position: 'absolute',
    bottom: -5,
    left: 5,
    flexDirection: 'row',
  },
  bone: {
    width: 15,
    height: 2,
    backgroundColor: '#D3D3C0',
    borderRadius: 1,
    marginLeft: -5,
  },
  labelBadge: {
    position: 'absolute',
    bottom: -20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  labelText: {
    color: '#FF4500',
    fontSize: 8,
    fontWeight: '900',
  },
  powerBadge: {
    position: 'absolute',
    top: -10,
    right: -5,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 6,
  },
  powerText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: 'bold',
  },
});
