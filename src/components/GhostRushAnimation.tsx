import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { useGameStore } from '../store/useGameStore';
import { COLORS } from '../constants/theme';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  runOnJS,
  FadeIn,
  FadeOut
} from 'react-native-reanimated';
import { User } from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface GhostUnitProps {
  sourceX: number;
  targetX: number;
  onFinish: () => void;
}

const GhostUnit: React.FC<GhostUnitProps> = ({ sourceX, targetX, onFinish }) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(1, { duration: 800 }, (isFinished) => {
      if (isFinished) {
        runOnJS(onFinish)();
      }
    });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: sourceX + (targetX - sourceX) * progress.value },
      { translateY: 30 }
    ],
    opacity: 0.4,
  }));

  return (
    <Animated.View style={[styles.ghostUnit, animatedStyle]}>
      <User color={COLORS.player} size={24} />
    </Animated.View>
  );
};

export const GhostRushAnimation: React.FC = () => {
  const { 
    bestRunLogs, 
    difficulty, 
    currentLevel, 
    enemyTowers,
    playerTower,
    timeLeft,
    isLevelStarted,
    isGameOver,
    isLevelCleared,
    activeJokers
  } = useGameStore((state: any) => ({
    bestRunLogs: state.bestRunLogs,
    difficulty: state.difficulty,
    currentLevel: state.currentLevel,
    enemyTowers: state.enemyTowers,
    playerTower: state.playerTower,
    timeLeft: state.timeLeft,
    isLevelStarted: state.isLevelStarted,
    isGameOver: state.isGameOver,
    isLevelCleared: state.isLevelCleared,
    activeJokers: state.activeJokers,
  }));

  const [activeGhostAttacks, setActiveGhostAttacks] = useState<{id: number, targetId: string}[]>([]);
  const levelKey = `${difficulty}_${currentLevel}`;
  const bestRun = bestRunLogs[levelKey];

  useEffect(() => {
    if (!bestRun || !isLevelStarted || isGameOver || isLevelCleared || activeJokers.timeFreeze) return;

    const towerCount = enemyTowers.length + 1;
    const initialTime = difficulty === 'easy' ? towerCount * 10 : difficulty === 'normal' ? towerCount * 5 : 10;
    const currentTimeOffset = initialTime - timeLeft;

    // Check if any ghost attack should start
    const upcomingAttack = bestRun.logs.find((log: any) => 
      Math.abs(log.timeOffset - currentTimeOffset) < 0.1
    );

    if (upcomingAttack) {
      // Avoid duplicate triggers for the same timestamp
      setActiveGhostAttacks(prev => {
        if (prev.some(a => a.targetId === upcomingAttack.targetId && Math.abs(currentTimeOffset - (prev.find(p => p.targetId === upcomingAttack.targetId) ? 0 : 0)) < 0.5)) {
           return prev;
        }
        return [...prev, { id: Date.now(), targetId: upcomingAttack.targetId }];
      });
    }
  }, [timeLeft]);

  if (!bestRun) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {activeGhostAttacks.map((attack) => {
        const target = enemyTowers.find((t: any) => t.id === attack.targetId) || playerTower;
        // Simplified source: always from player area for ghost? 
        // Or record sourceId too. For now let's assume it moves toward target.
        return (
          <GhostUnit 
            key={attack.id}
            sourceX={playerTower.x + 40}
            targetX={target.x + 40}
            onFinish={() => setActiveGhostAttacks(prev => prev.filter(a => a.id !== attack.id))}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  ghostUnit: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 40,
  }
});
