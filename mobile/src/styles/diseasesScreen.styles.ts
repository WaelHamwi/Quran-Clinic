import { StyleSheet } from 'react-native';
import type { Theme } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

export const createStyles = (_theme: Theme) =>
  StyleSheet.create({
    searchBar: {
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.md,
    },
  });
