// =============================================
// MATH TOWER WAR — Level Map Screen
// Vertically scrollable map with 1000+ levels
// =============================================

import React, { useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Animated, { FadeIn, FadeInLeft } from 'react-native-reanimated';
import { COLORS, SPACING } from '../constants/theme';
import { Background } from '../components/Background';
import { TR } from '../constants/strings';
import { useGameStore } from '../store/useGameStore';
import { useProgressStore } from '../store/useProgressStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const TOTAL_LEVELS = 1000;
const LEVELS_PER_CHAPTER = 10;

interface LevelNodeProps {
  levelNumber: number;
  currentLevel: number;
  stars: number;
  completed: boolean;
  isBoss: boolean;
  onPress: (level: number) => void;
}

const LevelNode: React.FC<LevelNodeProps> = React.memo(
  ({ levelNumber, currentLevel, stars, completed, isBoss, onPress }) => {
    const isLocked = levelNumber > currentLevel;
    const isCurrent = levelNumber === currentLevel;
    const isLeft = levelNumber % 2 === 0;

    return (
      <View style={[styles.nodeRow, { justifyContent: isLeft ? 'flex-start' : 'flex-end' }]}>
        {/* Path connector */}
        <View style={[styles.pathLine, { left: isLeft ? width * 0.25 : width * 0.45 }]} />

        <TouchableOpacity
          style={[
            styles.nodeContainer,
            isBoss && styles.bossNode,
            isCurrent && styles.currentNode,
            isLocked && styles.lockedNode,
            { marginLeft: isLeft ? width * 0.1 : 0, marginRight: isLeft ? 0 : width * 0.1 },
          ]}
          onPress={() => !isLocked && onPress(levelNumber)}
          disabled={isLocked}
          activeOpacity={0.8}
        >
          {/* Castle icon */}
          <View style={styles.miniCastle}>
            {/* Battlements */}
            <View style={styles.miniBattlements}>
              {[0, 1, 2].map((i) => (
                <View
                  key={i}
                  style={[
                    styles.miniMerlon,
                    {
                      backgroundColor: isLocked
                        ? COLORS.neutralDark
                        : isCurrent
                        ? COLORS.primary
                        : completed
                        ? COLORS.playerBlue
                        : COLORS.neutral,
                    },
                  ]}
                />
              ))}
            </View>
            {/* Body */}
            <View
              style={[
                styles.miniBody,
                {
                  backgroundColor: isLocked
                    ? COLORS.neutralDark
                    : isCurrent
                    ? COLORS.primary
                    : completed
                    ? COLORS.playerBlue
                    : COLORS.neutral,
                },
              ]}
            >
              <Text
                style={[
                  styles.levelNumber,
                  { color: isLocked ? COLORS.textDim : '#FFF' },
                ]}
              >
                {levelNumber}
              </Text>
            </View>
          </View>

          {/* Stars */}
          {completed && (
            <View style={styles.starsRow}>
              {[1, 2, 3].map((s) => (
                <Text key={s} style={[styles.star, s <= stars && styles.starEarned]}>
                  ★
                </Text>
              ))}
            </View>
          )}

          {/* Boss label */}
          {isBoss && !isLocked && (
            <View style={styles.bossLabel}>
              <Text style={styles.bossLabelText}>👑</Text>
            </View>
          )}

          {/* Current indicator */}
          {isCurrent && (
            <View style={styles.currentIndicator}>
              <Text style={styles.currentArrow}>▶</Text>
            </View>
          )}

          {/* Lock */}
          {isLocked && (
            <Text style={styles.lockIcon}>🔒</Text>
          )}

          {/* Flag for completed */}
          {completed && (
            <View style={[styles.flag, { backgroundColor: COLORS.playerBlue }]} />
          )}
        </TouchableOpacity>
      </View>
    );
  }
);

export const LevelMap: React.FC = () => {
  const setScreen = useGameStore((s) => s.setScreen);
  const startLevel = useGameStore((s) => s.startLevel);
  const { currentLevel, levelProgress, getStartingUnitsBonus } = useProgressStore((s) => ({
    currentLevel: s.currentLevel,
    levelProgress: s.levelProgress,
    getStartingUnitsBonus: s.getStartingUnitsBonus,
  }));

  const insets = useSafeAreaInsets();

  const flatListRef = useRef<FlatList>(null);

  // Generate level data
  const levels = React.useMemo(() => {
    return Array.from({ length: TOTAL_LEVELS }, (_, i) => ({
      levelNumber: i + 1,
      isBoss: (i + 1) % 10 === 0 && i + 1 >= 10,
    }));
  }, []);

  // Auto scroll to current level
  useEffect(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToIndex({
        index: Math.max(0, currentLevel - 3),
        animated: true,
      });
    }, 500);
  }, []);

  const handleLevelPress = (level: number) => {
    startLevel(level, getStartingUnitsBonus());
  };

  const renderLevel = ({ item }: { item: { levelNumber: number; isBoss: boolean } }) => {
    const progress = levelProgress[item.levelNumber];
    return (
      <LevelNode
        levelNumber={item.levelNumber}
        currentLevel={currentLevel}
        stars={progress?.stars || 0}
        completed={progress?.completed || false}
        isBoss={item.isBoss}
        onPress={handleLevelPress}
      />
    );
  };

  // Chapter headers
  const renderChapterHeader = (chapterNumber: number) => (
    <View style={styles.chapterHeader}>
      <View style={styles.chapterLine} />
      <Text style={styles.chapterText}>
        {TR.CHAPTER} {chapterNumber}
      </Text>
      <View style={styles.chapterLine} />
    </View>
  );

  return (
    <View style={styles.container}>
      <Background />
      {/* Header */}
      <Animated.View entering={FadeIn} style={[styles.header, { paddingTop: Math.max(insets.top, 20) }]}>
        <TouchableOpacity onPress={() => setScreen('menu')} style={styles.backButton}>
          <Text style={styles.backText}>← {TR.BACK}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{TR.LEVELS}</Text>
        <View style={styles.headerRight}>
          <Text style={styles.goldText}>💰 {useProgressStore.getState().gold}</Text>
        </View>
      </Animated.View>

      {/* Level list */}
      <FlatList
        ref={flatListRef}
        data={levels}
        renderItem={renderLevel}
        keyExtractor={(item) => `level-${item.levelNumber}`}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        initialNumToRender={20}
        maxToRenderPerBatch={10}
        windowSize={5}
        getItemLayout={(_, index) => ({
          length: 90,
          offset: 90 * index,
          index,
        })}
        onScrollToIndexFailed={() => {}}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  backButton: {
    paddingVertical: 8,
    paddingRight: 16,
  },
  backText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  title: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 2,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  goldText: {
    color: COLORS.gold,
    fontSize: 16,
    fontWeight: 'bold',
  },
  listContent: {
    paddingVertical: SPACING.lg,
    paddingBottom: 100,
  },
  nodeRow: {
    width: width,
    height: 90,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  pathLine: {
    position: 'absolute',
    width: 2,
    height: 90,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  nodeContainer: {
    width: 70,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bossNode: {
    transform: [{ scale: 1.2 }],
  },
  currentNode: {
    transform: [{ scale: 1.15 }],
  },
  lockedNode: {
    opacity: 0.4,
  },
  miniCastle: {
    alignItems: 'center',
  },
  miniBattlements: {
    flexDirection: 'row',
    gap: 3,
    marginBottom: -1,
  },
  miniMerlon: {
    width: 6,
    height: 6,
    borderTopLeftRadius: 1,
    borderTopRightRadius: 1,
  },
  miniBody: {
    width: 30,
    height: 25,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.2)',
    borderTopWidth: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelNumber: {
    fontSize: 12,
    fontWeight: '900',
  },
  starsRow: {
    flexDirection: 'row',
    marginTop: 2,
    gap: 1,
  },
  star: {
    fontSize: 10,
    color: COLORS.neutralDark,
  },
  starEarned: {
    color: COLORS.gold,
  },
  bossLabel: {
    position: 'absolute',
    top: -8,
  },
  bossLabelText: {
    fontSize: 14,
  },
  currentIndicator: {
    position: 'absolute',
    left: -20,
  },
  currentArrow: {
    fontSize: 16,
    color: COLORS.primary,
  },
  lockIcon: {
    position: 'absolute',
    fontSize: 12,
    opacity: 0.6,
  },
  flag: {
    position: 'absolute',
    top: -4,
    right: 2,
    width: 8,
    height: 5,
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
  },
  chapterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    gap: 10,
  },
  chapterLine: {
    width: 40,
    height: 1,
    backgroundColor: COLORS.primary,
    opacity: 0.3,
  },
  chapterText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2,
  },
});
