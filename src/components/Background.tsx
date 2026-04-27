import React, { useMemo } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
  withSequence,
} from 'react-native-reanimated';
import { COLORS } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const StarParticle = ({ startX, startY, size, duration, delay }: {
  startX: number; startY: number; size: number; duration: number; delay: number;
}) => {
  const opacity = useSharedValue(0.1);

  React.useEffect(() => {
    setTimeout(() => {
      opacity.value = withRepeat(
        withSequence(
          withTiming(0.6, { duration: duration / 2, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.1, { duration: duration / 2, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    }, delay);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    position: 'absolute',
    left: startX,
    top: startY,
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: '#FFF',
  }));

  return (
    <Animated.View 
      style={animatedStyle} 
      renderToHardwareTextureAndroid={true}
      shouldRasterizeIOS={true}
    />
  );
};

export const Background = React.memo(() => {
  // Generate stars
  const particles = useMemo(() => {
    return Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2 + 1,
      duration: Math.random() * 3000 + 2000,
      delay: Math.random() * 2000,
    }));
  }, []);

  return (
    <View style={styles.container} pointerEvents="none">
      {particles.map((p) => (
        <StarParticle
          key={p.id}
          startX={p.x}
          startY={p.y}
          size={p.size}
          duration={p.duration}
          delay={p.delay}
        />
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0a0e1a', // Original deep black/blue theme
  },
});

