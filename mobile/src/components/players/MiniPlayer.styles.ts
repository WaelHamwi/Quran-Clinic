import { StyleSheet } from 'react-native';
import type { Theme } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { fontSize, fontWeight } from '@/theme/typography';

export const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.surface,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.border,
    },
    // Tall touch area so the finger can comfortably land anywhere on the bar
    progressWrap: {
      height: 16,
      justifyContent: 'center',
      paddingHorizontal: 0,
    },
    progressTrack: {
      height: 3,
      backgroundColor: theme.border,
      overflow: 'hidden',
    },
    progressFill: {
      height: 3,
      backgroundColor: theme.primary,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.sm,
    },
    texts: { flex: 1 },
    title: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: theme.text },
    label: { fontSize: fontSize.xs, color: theme.textMuted },
  });
