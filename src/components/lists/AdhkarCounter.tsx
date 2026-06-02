import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { palette } from '@/theme/colors';
import { useLanguage } from '@/context/LanguageContext';
import {
  adhkarCounterStyles as s,
  RING_SIZE,
  RING_CX,
  RING_CY,
  RING_R,
  RING_R_FILL,
  RING_CIRCUMFERENCE,
} from './AdhkarCounter.styles';

interface AdhkarCounterProps {
  count: number;
  total: number;
  onPress: () => void;
}

export function AdhkarCounter({ count, total, onPress }: AdhkarCounterProps) {
  const { isArabic } = useLanguage();
  const progress = total > 0 ? Math.min(count / total, 1) : 0;
  const strokeDashoffset = RING_CIRCUMFERENCE * (1 - progress);
  const totalLabel = isArabic ? `من ${total}` : `of ${total}`;

  return (
    <Pressable onPress={onPress} style={s.pressable}>
      {/* SVG ring: white fill + track + progress arc, rotated so arc starts at 12 o'clock */}
      <Svg width={RING_SIZE} height={RING_SIZE} style={StyleSheet.absoluteFill}>
        <G rotation={-90} origin={`${RING_CX}, ${RING_CY}`}>
          <Circle cx={RING_CX} cy={RING_CY} r={RING_R_FILL} fill={palette.white} />
          <Circle
            cx={RING_CX}
            cy={RING_CY}
            r={RING_R}
            strokeWidth={4}
            stroke={palette.brand[100]}
            fill="none"
          />
          {progress > 0 && (
            <Circle
              cx={RING_CX}
              cy={RING_CY}
              r={RING_R}
              strokeWidth={4}
              stroke={palette.brand[500]}
              fill="none"
              strokeDasharray={`${RING_CIRCUMFERENCE}`}
              strokeDashoffset={`${strokeDashoffset}`}
              strokeLinecap="round"
            />
          )}
        </G>
      </Svg>

      <View style={s.textGroup}>
        <Text style={s.countNum}>{count}</Text>
        <Text style={s.countLabel}>{totalLabel}</Text>
      </View>
    </Pressable>
  );
}
