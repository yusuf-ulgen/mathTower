// =============================================
// MATH TOWER WAR — Floating Text
// Damage numbers, gate operation feedback
// =============================================

import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, { FadeOutUp } from 'react-native-reanimated';
import { COLORS } from '../constants/theme';

interface Props {
  text: string;
  x: number;
  y: number;
  color?: string;
  onComplete?: () => void;
}

export const FloatingText: React.FC<Props> = ({ text, x, y, color, onComplete }) => {
  return (
    <Animated.Text
      exiting={FadeOutUp.duration(1000)}
      style={[
        styles.text,
        { left: x, top: y, color: color || COLORS.primary },
      ]}
    >
      {text}
    </Animated.Text>
  );
};

const styles = StyleSheet.create({
  text: {
    position: 'absolute',
    fontSize: 24,
    fontWeight: '900',
    zIndex: 1000,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
});
