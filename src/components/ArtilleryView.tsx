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

export const ArtilleryView: React.FC<Props> = ({ artillery, onDisable }) => {
  const isDisabled = artillery.isDisabled;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => !isDisabled && onDisable(artillery.id)}
      style={[
        styles.container,
        {
          left: artillery.position.x - 25,
          top: artillery.position.y - 45,
        },
      ]}
    >
      {/* Wooden watchtower roof */}
      <View style={[styles.roof, isDisabled && styles.disabledPart]}>
        <View style={styles.roofPeak} />
      </View>

      {/* Lookout platform */}
      <View style={[styles.platform, isDisabled && styles.disabledPart]}>
        <View style={styles.railing} />
        {/* Scout */}
        <View style={[styles.scout, isDisabled && styles.disabledScout]}>
          <View style={styles.scoutHead} />
          <View style={styles.scoutBody} />
        </View>
      </View>

      {/* Wooden supports (X pattern) */}
      <View style={[styles.supports, isDisabled && styles.disabledPart]}>
        <View style={styles.xBrace1} />
        <View style={styles.xBrace2} />
        <View style={styles.supportLeft} />
        <View style={styles.supportRight} />
      </View>

      {/* Stone base */}
      <View style={[styles.base, isDisabled && styles.disabledPart]} />

      {/* Range indicator */}
      <View
        style={[
          styles.rangeCircle,
          {
            width: artillery.range * 2,
            height: artillery.range * 2,
            borderRadius: artillery.range,
            left: 25 - artillery.range,
            top: 45 - artillery.range,
            borderColor: isDisabled ? 'transparent' : 'rgba(239, 68, 68, 0.15)',
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
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: 50,
    alignItems: 'center',
    zIndex: 8,
  },
  roof: {
    width: 40,
    height: 10,
    backgroundColor: '#5C4033',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  roofPeak: {
    position: 'absolute',
    top: -6,
    left: 12,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#5C4033',
  },
  platform: {
    width: 36,
    height: 14,
    backgroundColor: '#8B6914',
    borderWidth: 1,
    borderColor: '#5C4033',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  railing: {
    position: 'absolute',
    top: -2,
    width: 38,
    height: 2,
    backgroundColor: '#5C4033',
  },
  scout: {
    alignItems: 'center',
  },
  scoutHead: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#DEB887',
  },
  scoutBody: {
    width: 4,
    height: 6,
    backgroundColor: '#556B2F',
    borderRadius: 1,
  },
  supports: {
    width: 30,
    height: 30,
    position: 'relative',
  },
  supportLeft: {
    position: 'absolute',
    left: 2,
    width: 3,
    height: 30,
    backgroundColor: '#8B6914',
  },
  supportRight: {
    position: 'absolute',
    right: 2,
    width: 3,
    height: 30,
    backgroundColor: '#8B6914',
  },
  xBrace1: {
    position: 'absolute',
    left: 2,
    top: 5,
    width: 26,
    height: 2,
    backgroundColor: '#5C4033',
    transform: [{ rotate: '35deg' }],
  },
  xBrace2: {
    position: 'absolute',
    left: 2,
    top: 20,
    width: 26,
    height: 2,
    backgroundColor: '#5C4033',
    transform: [{ rotate: '-35deg' }],
  },
  base: {
    width: 40,
    height: 8,
    backgroundColor: '#808080',
    borderRadius: 2,
  },
  disabledPart: {
    opacity: 0.4,
  },
  disabledScout: {
    opacity: 0.3,
  },
  rangeCircle: {
    position: 'absolute',
    borderWidth: 1,
    borderStyle: 'dashed',
    zIndex: -1,
  },
  statusBadge: {
    position: 'absolute',
    bottom: -14,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '900',
  },
});
