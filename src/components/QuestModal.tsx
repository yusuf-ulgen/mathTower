import React from 'react';
import { View, StyleSheet, Text, Modal, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useGameStore } from '../store/useGameStore';
import { COLORS, SPACING } from '../constants/theme';
import { Trophy, X, CheckCircle2 } from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface Props {
  visible: boolean;
  onClose: () => void;
}

export const QuestModal: React.FC<Props> = ({ visible, onClose }) => {
  const { quests, claimQuestReward } = useGameStore((state: any) => ({
    quests: state.quests,
    claimQuestReward: state.claimQuestReward,
  }));

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <Animated.View entering={FadeInUp} style={styles.content}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Trophy color={COLORS.primary} size={28} />
              <Text style={styles.title}>GÖREVLER</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X color={COLORS.text} size={24} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
            {quests.map((quest: any) => {
              const progress = Math.min(1, quest.current / quest.target);
              const isCompleted = quest.current >= quest.target;
              
              return (
                <View key={quest.id} style={styles.questCard}>
                  <View style={styles.questHeader}>
                    <Text style={styles.questTitle}>{quest.title}</Text>
                    <Text style={styles.rewardText}>💰 {quest.reward}</Text>
                  </View>

                  <View style={styles.progressContainer}>
                    <View style={styles.progressBarBg}>
                      <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
                    </View>
                    <Text style={styles.progressText}>{quest.current} / {quest.target}</Text>
                  </View>

                  {quest.isClaimed ? (
                    <View style={styles.claimedBadge}>
                      <CheckCircle2 color={COLORS.player} size={16} />
                      <Text style={styles.claimedText}>ALINDI</Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={[styles.claimButton, !isCompleted && styles.disabledButton]}
                      onPress={() => claimQuestReward(quest.id)}
                      disabled={!isCompleted}
                    >
                      <Text style={styles.claimButtonText}>
                        {isCompleted ? 'ÖDÜLÜ AL' : 'DEVAM EDİYOR'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: width * 0.9,
    maxHeight: '80%',
    backgroundColor: '#1E293B',
    borderRadius: 32,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.text,
  },
  closeButton: {
    padding: 8,
  },
  scroll: {
    width: '100%',
  },
  questCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  questHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  questTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  rewardText: {
    color: '#FCD34D',
    fontWeight: 'bold',
    fontSize: 16,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  progressText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'right',
  },
  claimButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  claimButtonText: {
    fontWeight: 'bold',
    color: COLORS.background,
  },
  claimedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 10,
  },
  claimedText: {
    color: COLORS.player,
    fontWeight: 'bold',
    fontSize: 14,
  },
});
