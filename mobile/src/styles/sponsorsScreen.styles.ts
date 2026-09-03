import { StyleSheet } from 'react-native';
import type { Theme } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

/** Figma sponsor list — node 18272:3330. Body padding 16h / 20v, 12px gap. */
export const createStyles = (_theme: Theme) =>
  StyleSheet.create({
    content: { paddingHorizontal: spacing.lg, paddingVertical: 20, flexGrow: 1 },
    separator: { height: spacing.md },
  });
