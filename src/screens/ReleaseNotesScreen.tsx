import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Rocket, ArrowRight, ShieldCheck } from 'lucide-react-native';
import { APP_RELEASE_NOTES } from '../utils/releaseNotes';
import { COLORS, SPACING } from '../constants/theme';
import { TR } from '../constants/strings';

const { width } = Dimensions.get('window');

interface ReleaseNotesScreenProps {
  onContinue: () => void;
}

export default function ReleaseNotesScreen({ onContinue }: ReleaseNotesScreenProps) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Rocket color={COLORS.primary} size={48} />
          </View>
          <Text style={styles.title}>KOMUTANIM, YENİLİKLER VAR!</Text>
          <View style={styles.versionBadge}>
            <Text style={styles.versionText}>Sürüm {APP_RELEASE_NOTES.version}</Text>
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.notesCard}>
            <View style={styles.cardHeader}>
              <ShieldCheck color={COLORS.primary} size={20} />
              <Text style={styles.cardTitle}>Savaş Günlüğü</Text>
            </View>
            <Text style={styles.notesText}>
              {APP_RELEASE_NOTES.notes}
            </Text>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.button}
            onPress={onContinue}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>CEPHEYE DÖN</Text>
            <ArrowRight size={20} color={COLORS.background} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.textBright,
    textAlign: 'center',
    letterSpacing: 2,
    marginBottom: 12,
  },
  versionBadge: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  versionText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  notesCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
  },
  cardTitle: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  notesText: {
    fontSize: 16,
    lineHeight: 26,
    color: COLORS.text,
    letterSpacing: 0.3,
  },
  footer: {
    paddingVertical: 30,
  },
  button: {
    backgroundColor: COLORS.primary,
    height: 64,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonText: {
    color: COLORS.background,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
  },
});
