import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Sword, Ghost, Bot, Lock, Check } from 'lucide-react-native';
import { useGameStore } from '../store/useGameStore';
import { COLORS, SPACING } from '../constants/theme';
import { HeroSkin } from '../types/game';

const SKINS: HeroSkin[] = [
  { id: 'default', name: 'Knight', icon: 'sword', color: '#4ADE80', price: 0 },
  { id: 'ninja', name: 'Ninja', icon: 'ninja', color: '#F472B6', price: 500 },
  { id: 'robot', name: 'Robot', icon: 'robot', color: '#38BDF8', price: 1500 },
];

export const SkinPicker = () => {
  const { currentSkin, unlockedSkins, gold, buySkin, selectSkin } = useGameStore();

  const getIcon = (iconName: string, color: string) => {
    if (iconName === 'ninja') return <Ghost color={color} size={24} />;
    if (iconName === 'robot') return <Bot color={color} size={24} />;
    return <Sword color={color} size={24} />;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>HERO MARKET (Gold: {gold})</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.list}>
        {SKINS.map((skin) => {
          const isUnlocked = unlockedSkins.includes(skin.id);
          const isSelected = currentSkin.id === skin.id;

          return (
            <TouchableOpacity
              key={skin.id}
              style={[
                styles.item,
                { borderColor: skin.color },
                isSelected && styles.selectedItem
              ]}
              onPress={() => isUnlocked ? selectSkin(skin.id) : buySkin(skin.id)}
            >
              <View style={[styles.iconBox, { backgroundColor: skin.color }]}>
                {getIcon(skin.icon, COLORS.background)}
              </View>
              <Text style={styles.itemName}>{skin.name}</Text>
              {!isUnlocked ? (
                <View style={styles.priceTag}>
                  <Lock size={12} color={COLORS.textDim} />
                  <Text style={styles.priceText}>{skin.price}</Text>
                </View>
              ) : (
                isSelected && <Check size={16} color={skin.color} />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  title: {
    color: COLORS.textDim,
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
  },
  list: {
    paddingBottom: SPACING.sm,
  },
  item: {
    width: 90,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    borderWidth: 2,
    padding: SPACING.sm,
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  selectedItem: {
    backgroundColor: '#1E293B',
    transform: [{ scale: 1.05 }],
  },
  iconBox: {
    padding: 8,
    borderRadius: 8,
    marginBottom: 4,
  },
  itemName: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: 'bold',
  },
  priceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  priceText: {
    color: COLORS.textDim,
    fontSize: 10,
    marginLeft: 2,
  },
});
