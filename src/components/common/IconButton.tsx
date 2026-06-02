import React, { useMemo } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import type { Theme } from '@/theme/colors';
import { radius, hitSlop } from '@/theme/spacing';

interface IconButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  size?: number;
  color?: string;
  filled?: boolean;
  disabled?: boolean;
}

function IconButtonBase({
  icon,
  onPress,
  size = 22,
  color,
  filled = false,
  disabled = false,
}: IconButtonProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const tint = color ?? theme.text;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={hitSlop}
      style={({ pressed }) => [
        styles.button,
        filled && styles.filled,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <Ionicons name={icon} size={size} color={tint} />
    </Pressable>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    button: {
      width: 40,
      height: 40,
      borderRadius: radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
    },
    filled: { backgroundColor: theme.surface },
    pressed: { opacity: 0.6 },
    disabled: { opacity: 0.4 },
  });
}

export const IconButton = React.memo(IconButtonBase);
