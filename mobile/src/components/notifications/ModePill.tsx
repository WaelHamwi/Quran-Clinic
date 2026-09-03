import React, { useCallback } from 'react';
import { Pressable, Text } from 'react-native';
import { useStyles } from '@/hooks/common/useStyles';
import { createStyles } from '@/styles/notificationsScreen.styles';

interface ModePillProps<T> {
  label: string;
  active: boolean;
  /** Handed back to `onSelect`, so a mapped list needs no inline arrow. */
  value: T;
  onSelect: (value: T) => void;
}

export function ModePill<T>({ label, active, value, onSelect }: ModePillProps<T>) {
  const s = useStyles(createStyles);
  const onPress = useCallback(() => onSelect(value), [onSelect, value]);

  return (
    <Pressable style={[s.modePill, active && s.modePillActive]} onPress={onPress}>
      <Text style={[s.modePillText, active && s.modePillTextActive]}>{label}</Text>
    </Pressable>
  );
}
