import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useGameStore } from '../store/useGameStore';
import { COLORS, SPACING } from '../constants/theme';
import { Settings as SettingsIcon, Trophy, Trash2, Info } from 'lucide-react-native';
import { DifficultyMode } from '../types/game';

export const SettingsScreen: React.FC = () => {
  const { difficulty, setDifficulty, highScores, resetGame } = useGameStore((state: any) => ({
    difficulty: state.difficulty,
    setDifficulty: state.setDifficulty,
    highScores: state.highScores,
    resetGame: state.resetGame,
  }));

  const handleReset = () => {
    Alert.alert(
      "Sıfırla",
      "Tüm ilerlemeniz ve altınlarınız silinecek. Emin misiniz?",
      [
        { text: "Vazgeç", style: "cancel" },
        { text: "Sıfırla", style: "destructive", onPress: resetGame }
      ]
    );
  };

  const difficultyModes: { id: DifficultyMode, label: string, desc: string }[] = [
    { id: 'easy', label: 'Kolay', desc: 'Yeni başlayanlar için bol süre ve basit işlemler.' },
    { id: 'normal', label: 'Normal', desc: 'Dengeli süre ve orta seviye matematik.' },
    { id: 'hard', label: 'Zor', desc: 'Hızlı refleks ve ileri seviye işlemler!' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <SettingsIcon size={28} color={COLORS.primary} />
        <Text style={styles.title}>AYARLAR</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>Zorluk Modu</Text>
        {difficultyModes.map((mode) => {
          const isActive = difficulty === mode.id;
          return (
            <TouchableOpacity 
              key={mode.id} 
              style={[styles.modeCard, isActive && styles.activeModeCard]}
              onPress={() => setDifficulty(mode.id)}
            >
              <View style={styles.modeHeader}>
                <Text style={[styles.modeLabel, isActive && styles.activeModeLabel]}>
                  {mode.label.toUpperCase()}
                </Text>
                <View style={styles.highScoreBox}>
                  <Trophy size={14} color={isActive ? COLORS.background : COLORS.primary} />
                  <Text style={[styles.highScoreText, isActive && styles.activeHighScoreText]}>
                    Level {highScores[mode.id] || 1}
                  </Text>
                </View>
              </View>
              <Text style={styles.modeDesc}>{mode.desc}</Text>
            </TouchableOpacity>
          );
        })}

        <View style={styles.divider} />

        <TouchableOpacity style={styles.dangerButton} onPress={handleReset}>
          <Trash2 size={20} color={COLORS.enemy} />
          <Text style={styles.dangerButtonText}>İlerlemeyi Sıfırla</Text>
        </TouchableOpacity>

        <View style={styles.infoBox}>
          <Info size={16} color={COLORS.textDim} />
          <Text style={styles.infoText}>Math Tower v2.0 - Developed for Speed</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: SPACING.xl,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.primary,
    marginLeft: SPACING.md,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.textDim,
    marginBottom: SPACING.md,
    letterSpacing: 1,
  },
  modeCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 15,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  activeModeCard: {
    backgroundColor: COLORS.primary,
    borderColor: 'white',
  },
  modeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  modeLabel: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.text,
  },
  activeModeLabel: {
    color: COLORS.background,
  },
  highScoreBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  highScoreText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginLeft: 4,
  },
  activeHighScoreText: {
    color: COLORS.background,
  },
  modeDesc: {
    fontSize: 12,
    color: COLORS.textDim,
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginVertical: SPACING.xl,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 12,
  },
  dangerButtonText: {
    color: COLORS.enemy,
    fontWeight: 'bold',
    marginLeft: SPACING.sm,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.xl,
  },
  infoText: {
    fontSize: 11,
    color: COLORS.textDim,
    marginLeft: 4,
  },
});
