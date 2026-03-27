import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withDelay,
  runOnJS,
  Easing
} from 'react-native-reanimated';
import { useGameStore } from '../store/useGameStore';
import { User } from 'lucide-react-native';
import { COLORS } from '../constants/theme';

const UNIT_SIZE = 30;
const ANIM_DURATION = 800;
const STAGGER = 100;

interface MovingUnitProps {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  delay: number;
  onFinish?: () => void;
}

const MovingUnit: React.FC<MovingUnitProps> = ({ startX, startY, endX, endY, delay, onFinish }) => {
  const translateX = useSharedValue(startX);
  const translateY = useSharedValue(startY);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 100 }));
    translateX.value = withDelay(delay, withTiming(endX, { duration: ANIM_DURATION, easing: Easing.bezier(0.25, 0.1, 0.25, 1) }));
    translateY.value = withDelay(delay, withTiming(endY, { duration: ANIM_DURATION, easing: Easing.bezier(0.25, 0.1, 0.25, 1) }, (finished) => {
      if (finished && onFinish) {
        runOnJS(onFinish)();
      }
    }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.unit, animatedStyle]}>
      <User size={20} color={COLORS.background} />
    </Animated.View>
  );
};

export const RushAnimation: React.FC = () => {
  const { attacking, playerTower, enemyTowers, completeAttack } = useGameStore((state: any) => ({
    attacking: state.attacking,
    playerTower: state.playerTower,
    enemyTowers: state.enemyTowers,
    completeAttack: state.completeAttack,
  }));

  const finishedCount = React.useRef(0);

  if (!attacking) {
    finishedCount.current = 0;
    return null;
  }

  const source = playerTower.id === attacking.sourceId ? playerTower : enemyTowers.find((t: any) => t.id === attacking.sourceId);
  const target = enemyTowers.find((t: any) => t.id === attacking.targetId);

  if (!source || !target) return null;

  const startX = source.x + 40; // Total Tower width effectively 80 (base) but container centers content. 
  const startY = 30; // Center of 60x60 Unit 
  const endX = target.x + 40;
  const endY = 30;

  const unitsCount = Math.min(attacking.count, 20);
  const units = Array.from({ length: unitsCount });

  const handleUnitFinish = () => {
    const { hitTower, completeAttack, playerTower } = useGameStore.getState();
    
    hitTower(target.id);
    finishedCount.current++;
    
    // Check if player failed during sequential hits
    if (playerTower.power === 0 && target.type === 'enemy' && (target.operation?.result || target.power) > 0) {
      useGameStore.setState({ isGameOver: true, attacking: null });
      return;
    }

    if (finishedCount.current === units.length) {
      setTimeout(() => {
        completeAttack(target.id);
        useGameStore.setState({ attacking: null });
      }, 300);
    }
  };

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {units.map((_, i) => (
        <MovingUnit 
          key={i}
          startX={startX}
          startY={startY}
          endX={endX}
          endY={endY}
          delay={i * STAGGER}
          onFinish={handleUnitFinish}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  unit: {
    position: 'absolute',
    width: UNIT_SIZE,
    height: UNIT_SIZE,
    borderRadius: UNIT_SIZE / 2,
    backgroundColor: COLORS.player,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
    zIndex: 100,
  },
});
