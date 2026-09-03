import React from 'react';
import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { useStyles } from '@/hooks/common/useStyles';
import { hitSlop } from '@/theme/spacing';
import { createStyles } from './IconButton.styles';

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
  const styles = useStyles(createStyles);
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

export const IconButton = React.memo(IconButtonBase);
