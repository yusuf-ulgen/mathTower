import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Dimensions } from 'react-native';
import { ShoppingBag, Play, Settings as SettingsIcon } from 'lucide-react-native';
import { COLORS, SPACING } from '../constants/theme';
import { useGameStore } from '../store/useGameStore';

const { width } = Dimensions.get('window');

export const BottomNavBar: React.FC = () => {
  const { activeTab, setActiveTab } = useGameStore((state: any) => ({
    activeTab: state.activeTab,
    setActiveTab: state.setActiveTab,
  }));

  const tabs = [
    { id: 'shop', icon: ShoppingBag, label: 'Market' },
    { id: 'game', icon: Play, label: 'Oyun' },
    { id: 'settings', icon: SettingsIcon, label: 'Ayarlar' },
  ] as const;

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <TouchableOpacity
            key={tab.id}
            style={styles.tab}
            onPress={() => setActiveTab(tab.id)}
          >
            <View style={[styles.iconContainer, isActive && styles.activeIconContainer]}>
              <Icon 
                size={24} 
                color={isActive ? COLORS.background : COLORS.textDim} 
              />
            </View>
            <Text style={[styles.label, isActive && styles.activeLabel]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 80,
    backgroundColor: COLORS.surface,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: width,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 45,
    height: 45,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  activeIconContainer: {
    backgroundColor: COLORS.primary,
  },
  label: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.textDim,
  },
  activeLabel: {
    color: COLORS.primary,
  },
});
