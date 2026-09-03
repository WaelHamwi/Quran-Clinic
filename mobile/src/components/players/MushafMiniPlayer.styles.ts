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
      paddingVertical: spacing.sm,
    },
    texts: { flex: 1 },
    title: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: theme.text },
    label: { fontSize: fontSize.xs, color: theme.textMuted },
  });
