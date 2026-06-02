import React, { useMemo } from 'react';
import {
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { shadows, type Theme } from '@/theme/colors';
import { spacing, radius } from '@/theme/spacing';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  elevated?: boolean;
  style?: StyleProp<ViewStyle>;
}

function CardBase({ children, onPress, elevated = true, style }: CardProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.card,
          elevated && styles.elevated,
          pressed && styles.pressed,
          style,
        ]}
      >
        {children}
      </Pressable>
    );
  }
  return <View style={[styles.card, elevated && styles.elevated, style]}>{children}</View>;
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    card: {
      backgroundColor: theme.surface,
      borderRadius: radius.md,
      padding: spacing.lg,
      borderWidth: theme.isDark ? 1 : 1,
      borderColor: theme.border,
    },
    elevated: theme.isDark
      ? { shadowOpacity: 0, elevation: 0 }
      : shadows.lg,
    pressed: { opacity: 0.9 },
  });
}

export const Card = React.memo(CardBase);
