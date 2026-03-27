import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useGameStore } from '../store/useGameStore';
import { COLORS, SPACING } from '../constants/theme';
import { Clock, Shield, Zap, TrendingDown, Palette } from 'lucide-react-native';
import { JokerType, ShopItem, ThemeType } from '../types/game';
import { THEMES } from '../constants/theme';

const { width } = Dimensions.get('window');

const SHOP_ITEMS: ShopItem[] = [
  { id: 'timeFreeze', name: 'Zaman Dondurucu', price: 100, description: 'Zamanı 5 saniyeliğine durdurur.', icon: 'clock' },
  { id: 'weaken', name: 'Zayıflatıcı', price: 250, description: 'Tüm rakiplerin asker sayısını yarıya indirir.', icon: 'trending-down' },
  { id: 'shield', name: 'Koruyucu Kalkan', price: 500, description: 'Bir sonraki hatalı hamlede yanmanı engeller.', icon: 'shield' },
];

export const ShopScreen: React.FC = () => {
  const { gold, inventory, buyItem, unlockedThemes, activeTheme, buyTheme, setTheme } = useGameStore((state: any) => ({
    gold: state.gold,
    inventory: state.inventory,
    buyItem: state.buyItem,
    unlockedThemes: state.unlockedThemes,
    activeTheme: state.activeTheme,
    buyTheme: state.buyTheme,
    setTheme: state.setTheme,
  }));

  const THEME_ITEMS = [
    { id: 'neon', name: 'Neon Paketi', price: 5000, description: 'Siberpunk gece hayatı ve neon ışıklar.', theme: 'neon' as ThemeType },
    { id: 'medieval', name: 'Ortaçağ Teması', price: 5000, description: 'Şövalyeler ve antik kale surları.', theme: 'medieval' as ThemeType },
    { id: 'space', name: 'Uzay Yolculuğu', price: 5000, description: 'Galaksiler arası savaş teması.', theme: 'space' as ThemeType },
  ];

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'clock': return <Clock size={32} color={COLORS.primary} />;
      case 'trending-down': return <TrendingDown size={32} color={COLORS.enemy} />;
      case 'shield': return <Shield size={32} color={COLORS.accent} />;
      default: return <Zap size={32} color={COLORS.primary} />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>MAĞAZA</Text>
        <Text style={styles.goldText}>💰 {gold}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>JOKERLER</Text>
        {SHOP_ITEMS.map((item) => (
          <View key={item.id} style={styles.itemCard}>
            <View style={styles.itemHeader}>
              <View style={styles.iconBox}>{getIcon(item.icon)}</View>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemDesc}>{item.description}</Text>
              </View>
            </View>

            <View style={styles.actionRow}>
              <View style={styles.inventoryCount}>
                <Text style={styles.inventoryText}>Envanter: {inventory[item.id] || 0}</Text>
              </View>
              <TouchableOpacity 
                style={[styles.buyButton, gold < item.price && styles.buyButtonDisabled]}
                onPress={() => buyItem(item.id, item.price)}
                disabled={gold < item.price}
              >
                <Text style={styles.buyButtonText}>{item.price} Altın</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <Text style={[styles.sectionTitle, { marginTop: 30 }]}>TEMALAR</Text>
        {THEME_ITEMS.map((item) => {
          const isUnlocked = unlockedThemes.includes(item.theme);
          const isActive = activeTheme === item.theme;

          return (
            <View key={item.id} style={[styles.itemCard, isActive && styles.activeCard]}>
              <View style={styles.itemHeader}>
                <View style={[styles.iconBox, { backgroundColor: isUnlocked ? THEMES[item.theme].player : 'rgba(255,255,255,0.05)' }]}>
                  <Palette size={32} color={isUnlocked ? '#FFF' : COLORS.textDim} />
                </View>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemDesc}>{item.description}</Text>
                </View>
              </View>

              <View style={styles.actionRow}>
                {isUnlocked ? (
                  <TouchableOpacity 
                    style={[styles.buyButton, isActive && styles.activeButton]}
                    onPress={() => setTheme(item.theme)}
                    disabled={isActive}
                  >
                    <Text style={styles.buyButtonText}>{isActive ? 'AKTİF' : 'SEÇ'}</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity 
                    style={[styles.buyButton, gold < item.price && styles.buyButtonDisabled]}
                    onPress={() => buyTheme(item.theme, item.price)}
                    disabled={gold < item.price}
                  >
                    <Text style={styles.buyButtonText}>{item.price} Altın</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })}
        
        <Text style={styles.infoText}>Bölüm kazandıkça altın topla, kafa tutan temaları aç!</Text>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.primary,
  },
  goldText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FCD34D',
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.text,
    marginBottom: SPACING.md,
    letterSpacing: 1,
  },
  itemCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    borderRadius: 20,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 60,
    height: 60,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  itemDesc: {
    fontSize: 13,
    color: COLORS.textDim,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    paddingTop: SPACING.md,
  },
  inventoryCount: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  inventoryText: {
    fontSize: 12,
    color: COLORS.textDim,
  },
  buyButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  buyButtonDisabled: {
    backgroundColor: '#334155',
  },
  buyButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
  activeCard: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  activeButton: {
    backgroundColor: COLORS.accent,
  },
  infoText: {
    textAlign: 'center',
    color: COLORS.textDim,
    fontSize: 12,
    marginTop: 20,
    fontStyle: 'italic',
  },
});
