import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withTiming, 
  withSequence,
  runOnJS,
  FadeOutUp
} from 'react-native-reanimated';
import { COLORS } from '../constants/theme';

interface Props {
  text: string;
  x: number;
  y: number;
  onComplete: () => void;
}

export const FloatingText: React.FC<Props> = ({ text, x, y, onComplete }) => {
  return (
    <Animated.Text
      exiting={FadeOutUp.duration(1000)}
      style={[
        styles.text,
        { left: x, top: y }
      ]}
    >
      {text}
    </Animated.Text>
  );
};

const styles = StyleSheet.create({
  text: {
    position: 'absolute',
    color: COLORS.hero,
    fontSize: 24,
    fontWeight: '900',
    zIndex: 1000,
  },
});
