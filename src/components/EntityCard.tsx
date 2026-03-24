import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Sword, Shield } from 'lucide-react-native';
import Animated, { 
  useAnimatedStyle, 
  withSpring, 
  useSharedValue,
  withSequence,
  withTiming
} from 'react-native-reanimated';
import { Entity } from '../types/game';
import { COLORS, SPACING } from '../constants/theme';

interface Props {
  entity: Entity;
  onPress?: () => void;
  isHero?: boolean;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export const EntityCard: React.FC<Props> = ({ entity, onPress, isHero }) => {
  const color = isHero ? COLORS.hero : entity.type === 'boss' ? COLORS.boss : COLORS.enemy;
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSequence(
      withSpring(1.1),
      withSpring(1)
    );
    onPress?.();
  };

  return (
    <AnimatedTouchableOpacity 
      activeOpacity={0.8} 
      onPress={handlePress} 
      disabled={!onPress}
      style={[styles.container, { borderColor: color }, animatedStyle]}
    >
      <View style={[styles.iconContainer, { backgroundColor: color }]}>
        {isHero ? (
          <Sword color={COLORS.background} size={20} />
        ) : (
          <Shield color={COLORS.background} size={20} />
        )}
      </View>
      <View style={styles.info}>
        <Text style={styles.label}>{isHero ? 'HERO' : 'ENEMY'}</Text>
        <Text style={[styles.power, { color }]}>{entity.power}</Text>
      </View>
    </AnimatedTouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.sm,
    borderRadius: 12,
    borderWidth: 2,
    width: 120,
    marginVertical: 4,
  },
  iconContainer: {
    padding: 6,
    borderRadius: 8,
    marginRight: SPACING.sm,
  },
  info: {
    flex: 1,
  },
  label: {
    color: COLORS.textDim,
    fontSize: 10,
    fontWeight: 'bold',
  },
  power: {
    fontSize: 18,
    fontWeight: '900',
  },
});
