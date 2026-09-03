import { StyleSheet } from 'react-native';
import type { Theme } from '@/theme/colors';
import { spacing, radius } from '@/theme/spacing';
import { fontSize } from '@/theme/typography';

export const createStyles = (theme: Theme) =>
  StyleSheet.create({
    wrap: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
    toast: {
      maxWidth: '88%',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderRadius: radius.pill,
    },
    text: { color: theme.textOnBrand, fontSize: fontSize.sm, textAlign: 'center' },
  });
