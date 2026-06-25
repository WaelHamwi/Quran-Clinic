import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import type { Theme } from '@/theme/colors';
import { spacing, radius } from '@/theme/spacing';
import { fontSize, fontWeight } from '@/theme/typography';

export type BadgeTone = 'primary' | 'muted' | 'locked' | 'success' | 'error';

interface BadgeProps {
  label: string;
  tone?: BadgeTone;
  icon?: keyof typeof Ionicons.glyphMap;
}

function BadgeBase({ label, tone = 'primary', icon }: BadgeProps) {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const palette: Record<BadgeTone, { bg: string; fg: string }> = {
    primary: { bg: theme.primaryLight, fg: theme.primaryDark },
    muted: { bg: theme.surface, fg: theme.textSecondary },
    locked: { bg: theme.surface, fg: theme.textMuted },
    success: { bg: theme.primaryLight, fg: theme.primary },
    error: { bg: theme.surface, fg: theme.error },
  };
  const { bg, fg } = palette[tone];

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      {icon ? <Ionicons name={icon} size={12} color={fg} /> : null}
      <Text style={[styles.label, { color: fg }]}>{label}</Text>
    </View>
  );
}

function createStyles(_theme: Theme) {
  return StyleSheet.create({
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      paddingHorizontal: spacing.sm,
      paddingVertical: 3,
      borderRadius: radius.pill,
      alignSelf: 'flex-start',
    },
    label: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold },
  });
}

export const Badge = React.memo(BadgeBase);
