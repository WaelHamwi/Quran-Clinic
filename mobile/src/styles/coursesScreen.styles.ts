import { StyleSheet } from 'react-native';
import type { Theme } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

export const createStyles = (_theme: Theme) =>
  StyleSheet.create({
    content: { padding: spacing.lg, flexGrow: 1 },
    separator: { height: spacing.md },
  });
