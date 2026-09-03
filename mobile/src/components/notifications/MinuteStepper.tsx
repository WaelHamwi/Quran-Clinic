import React, { useCallback } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { useStyles } from '@/hooks/common/useStyles';
import { createStyles } from '@/styles/notificationsScreen.styles';

interface MinuteStepperProps {
  label: string;
  /** Already-formatted, already-pluralised value text. */
  valueText: string;
  icon: keyof typeof Ionicons.glyphMap;
  value: number;
  min: number;
  max: number;
  onShift: (delta: number) => void;
}

export function MinuteStepper({
  label,
  valueText,
  icon,
  value,
  min,
  max,
  onShift,
}: MinuteStepperProps) {
  const { theme } = useTheme();
  const s = useStyles(createStyles);

  const atMin = value <= min;
  const atMax = value >= max;

  const onDecrement = useCallback(() => onShift(-1), [onShift]);
  const onIncrement = useCallback(() => onShift(1), [onShift]);

  return (
    <View style={s.delayField}>
      <Text style={s.timeLabel}>{label}</Text>
      <View style={s.timeInput}>
        <Pressable style={s.stepBtn} onPress={onDecrement} hitSlop={8} disabled={atMin}>
          <Ionicons
            name="remove"
            size={18}
            color={atMin ? theme.textPlaceholder : theme.primary}
          />
        </Pressable>
        <View style={s.timeInputContent}>
          <Text style={s.timeInputText}>{valueText}</Text>
          <Ionicons name={icon} size={18} color={theme.primary} />
        </View>
        <Pressable style={s.stepBtn} onPress={onIncrement} hitSlop={8} disabled={atMax}>
          <Ionicons name="add" size={18} color={atMax ? theme.textPlaceholder : theme.primary} />
        </Pressable>
      </View>
    </View>
  );
}
