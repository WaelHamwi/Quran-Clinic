import { StyleSheet } from 'react-native';
import type { Theme } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { fontSize, fontWeight } from '@/theme/typography';

export const createStyles = (theme: Theme) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.md,
      gap: spacing.md,
    },
    icon: { width: 24, textAlign: 'center' },
    texts: { flex: 1, gap: 2 },
    label: { fontSize: fontSize.md, fontWeight: fontWeight.medium, color: theme.text },
    description: { fontSize: fontSize.xs, color: theme.textMuted },
  });
