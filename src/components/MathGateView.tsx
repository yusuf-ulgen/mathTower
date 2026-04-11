// =============================================
// MATH TOWER WAR — Math Gate View
// Renders math gates on paths between towers
// =============================================

import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { MathGate } from '../types/game';
import { COLORS } from '../constants/theme';
import { getGateDisplayText, isGateBeneficial } from '../engine/levelGenerator';

interface Props {
  gate: MathGate;
}

export const MathGateView: React.FC<Props> = ({ gate }) => {
  const beneficial = isGateBeneficial(gate.operation);
  const displayText = getGateDisplayText(gate.operation);
  const bgColor = beneficial ? COLORS.gatePositive : COLORS.gateNegative;

  return (
    <View
      style={[
        styles.container,
        {
          left: gate.position.x - 18,
          top: gate.position.y - 14,
        },
      ]}
    >
      {/* Gate arch */}
      <View style={[styles.gateArch, { borderColor: bgColor }]}>
        <View style={[styles.gatePillarLeft, { backgroundColor: bgColor }]} />
        <View style={[styles.gatePillarRight, { backgroundColor: bgColor }]} />
      </View>

      {/* Operation label */}
      <View style={[styles.label, { backgroundColor: bgColor }]}>
        <Text style={styles.labelText}>{displayText}</Text>
      </View>

      {/* Glow effect */}
      <View
        style={[
          styles.glow,
          { backgroundColor: bgColor, shadowColor: bgColor },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: 36,
    height: 28,
    alignItems: 'center',
    zIndex: 15,
  },
  gateArch: {
    width: 30,
    height: 18,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderRightWidth: 3,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    borderBottomWidth: 0,
  },
  gatePillarLeft: {
    position: 'absolute',
    left: -3,
    bottom: -6,
    width: 3,
    height: 6,
  },
  gatePillarRight: {
    position: 'absolute',
    right: -3,
    bottom: -6,
    width: 3,
    height: 6,
  },
  label: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: -2,
  },
  labelText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '900',
  },
  glow: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    opacity: 0.15,
    top: 4,
    elevation: 10,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
});
