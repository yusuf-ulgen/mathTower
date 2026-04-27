// =============================================
// MATH TOWER WAR — Artillery View
// Wooden guard tower (neutral artillery)
// =============================================

import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { NeutralArtillery } from '../types/game';
import { COLORS } from '../constants/theme';
import { TR } from '../constants/strings';

interface Props {
  artillery: NeutralArtillery;
  onDisable: (id: string) => void;
}

export const ArtilleryView: React.FC<Props> = React.memo(({ artillery, onDisable }) => {
  const isDisabled = artillery.isDisabled;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => !isDisabled && onDisable(artillery.id)}
      style={[
        styles.container,
        {
          left: artillery.position.x - 30,
          top: artillery.position.y - 40,
        },
      ]}
    >
      {/* Watchtower Roof */}
      <View style={[styles.roof, isDisabled && styles.disabledPart]} />
      
      {/* Balcony / Top Platform */}
      <View style={[styles.platform, isDisabled && styles.disabledPart]}>
        <View style={styles.balconyRail} />
        <View style={styles.balconyRail} />
      </View>

      {/* Main Body / Pillar */}
      <View style={[styles.pillar, isDisabled && styles.disabledPart]} />

      {/* Crossbeams / Legs */}
      <View style={[styles.legsRow, isDisabled && styles.disabledPart]}>
        <View style={[styles.leg, { transform: [{ rotate: '-15deg' }] }]} />
        <View style={[styles.leg, { transform: [{ rotate: '15deg' }] }]} />
      </View>

      {/* Range indicator */}
      <View
        style={[
          styles.rangeCircle,
          {
            width: artillery.range * 2,
            height: artillery.range * 2,
            borderRadius: artillery.range,
            left: 30 - artillery.range,
            top: 40 - artillery.range,
            borderColor: isDisabled ? 'transparent' : 'rgba(231, 76, 60, 0.12)',
          },
        ]}
      />

      {/* Status badge */}
      <View style={[styles.statusBadge, { backgroundColor: isDisabled ? COLORS.success : COLORS.danger }]}>
        <Text style={styles.statusText}>
          {isDisabled ? '✓' : `⚡${artillery.disableCost}`}
        </Text>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: 60,
    height: 80,
    alignItems: 'center',
    justifyContent: 'flex-start',
    zIndex: 8,
  },
  roof: {
    width: 44,
    height: 0,
    borderLeftWidth: 22,
    borderRightWidth: 22,
    borderBottomWidth: 14,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#5D4037',
    marginBottom: -2,
    zIndex: 3,
  },
  platform: {
    width: 32,
    height: 18,
    backgroundColor: '#8D6E63',
    borderWidth: 1.5,
    borderColor: '#4E342E',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    zIndex: 2,
  },
  balconyRail: {
    width: 3,
    height: 10,
    backgroundColor: '#4E342E',
    marginTop: -5,
  },
  pillar: {
    width: 10,
    height: 20,
    backgroundColor: '#795548',
    borderWidth: 1.5,
    borderColor: '#4E342E',
    zIndex: 1,
  },
  legsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: 40,
    marginTop: -2,
  },
  leg: {
    width: 4,
    height: 16,
    backgroundColor: '#5D4037',
    marginHorizontal: 4,
  },
  disabledPart: {
    opacity: 0.4,
  },
  rangeCircle: {
    position: 'absolute',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    zIndex: -1,
  },
  statusBadge: {
    position: 'absolute',
    bottom: -15,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '900',
  },
});
