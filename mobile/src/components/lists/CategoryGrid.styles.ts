import { StyleSheet } from 'react-native';
import type { Theme } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

export const createStyles = (_theme: Theme) =>
  StyleSheet.create({
    categoryGrid__content: {
      paddingHorizontal: spacing.lg,
      paddingBottom: 20,
      gap: spacing.sm,
    },
  });
