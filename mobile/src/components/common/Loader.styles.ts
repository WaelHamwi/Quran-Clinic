import { StyleSheet } from 'react-native';
import type { Theme } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { fontSize } from '@/theme/typography';

export const createStyles = (theme: Theme) =>
  StyleSheet.create({
    fullScreen: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.background,
      gap: spacing.md,
    },
    inline: { alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.md },
    message: { color: theme.textSecondary, fontSize: fontSize.sm },
  });
