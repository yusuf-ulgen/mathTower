import React, { useState, useEffect } from 'react';
import { View, StyleSheet, StatusBar, Text, BackHandler, Alert } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useGameStore } from './src/store/useGameStore';
import { useProgressStore } from './src/store/useProgressStore';
import { MainMenu } from './src/screens/MainMenu';
import { LevelMap } from './src/screens/LevelMap';
import { ResearchLab } from './src/screens/ResearchLab';
import { BattleScreen } from './src/screens/BattleScreen';
import { COLORS, SPACING } from './src/constants/theme';
import { TR } from './src/constants/strings';
import { Modal, TouchableOpacity } from 'react-native';
import { X, RefreshCw } from 'lucide-react-native';
import ReleaseNotesScreen from './src/screens/ReleaseNotesScreen';
import { 
  checkShowReleaseNotes, 
  markReleaseNotesAsShown, 
  redirectToPlayStore, 
  checkForUpdate 
} from './src/utils/updateManager';

export default function App() {
  const currentScreen = useGameStore((state) => state.currentScreen);
  const setScreen = useGameStore((state) => state.setScreen);
  const endBattle = useGameStore((state) => state.endBattle);
  const loadProgress = useProgressStore((state) => state.loadProgress);
  const [isLoading, setIsLoading] = useState(true);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  useEffect(() => {
    const init = async () => {
      await loadProgress();
      
      // Release notes check
      const shouldShowNotes = await checkShowReleaseNotes();
      if (shouldShowNotes) {
        setScreen('releaseNotes');
      }

      // Update check
      const hasUpdate = await checkForUpdate();
      if (hasUpdate) {
        setShowUpdateModal(true);
      }

      setIsLoading(false);
    };
    init();
  }, []);

  // Handle Back Button
  useEffect(() => {
    const backAction = () => {
      if (currentScreen === 'battle') {
        Alert.alert(TR.PAUSE, TR.BACK_TO_MENU + '?', [
          { text: TR.CANCEL, style: 'cancel' },
          {
            text: TR.CONFIRM,
            onPress: () => {
              endBattle();
              setScreen('menu');
            },
          },
        ]);
        return true;
      }
      
      if (currentScreen !== 'menu') {
        setScreen('menu');
        return true;
      }

      return false; // Dynamic back behavior: close app only from menu
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [currentScreen]);

  if (isLoading) {
    return (
      <View style={[styles.container, styles.center]}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
        <Text style={styles.loadingTitle}>{TR.GAME_TITLE}</Text>
        <Text style={styles.loadingSubtitle}>{TR.LOADING}</Text>
      </View>
    );
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'menu':
        return <MainMenu />;
      case 'levelMap':
        return <LevelMap />;
      case 'researchLab':
        return <ResearchLab />;
      case 'battle':
        return <BattleScreen />;
      case 'releaseNotes':
        return (
          <ReleaseNotesScreen 
            onContinue={async () => {
              await markReleaseNotesAsShown();
              setScreen('menu');
            }} 
          />
        );
      default:
        return <MainMenu />;
    }
  };

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
        {renderScreen()}

        {/* Update Modal */}
        <Modal visible={showUpdateModal} transparent animationType="fade">
          <View style={styles.overlay}>
            <Animated.View entering={FadeIn} style={styles.modalContent}>
              <TouchableOpacity 
                style={styles.closeButton} 
                onPress={() => setShowUpdateModal(false)}
              >
                <X color={COLORS.textDim} size={24} />
              </TouchableOpacity>
              
              <View style={styles.updateIconContainer}>
                <RefreshCw color={COLORS.primary} size={48} />
              </View>
              
              <Text style={styles.modalTitle}>GÜNCELLEME VAR!</Text>
              <Text style={styles.modalSubtitle}>
                Savaş alanına yeni özellikler eklendi. En iyi deneyim için lütfen uygulamayı güncelleyin.
              </Text>
              
              <TouchableOpacity 
                style={styles.modalButton} 
                onPress={() => {
                  redirectToPlayStore();
                  setShowUpdateModal(false);
                }}
              >
                <Text style={styles.modalButtonText}>ŞİMDİ GÜNCELLE</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </Modal>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingTitle: {
    color: COLORS.primary,
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: 4,
  },
  loadingSubtitle: {
    color: COLORS.textDim,
    fontSize: 14,
    marginTop: 12,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    padding: 30,
    borderRadius: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
    width: '85%',
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    top: 16,
    padding: 4,
  },
  updateIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.textBright,
    marginBottom: 10,
    letterSpacing: 1,
  },
  modalSubtitle: {
    fontSize: 15,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  modalButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: COLORS.background,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
});
