import { StyleSheet } from 'react-native';
import type { Theme } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

/** Vertical gap between favorite rows (Figma 18284:3425 → gap-8). */
export const ROW_GAP = spacing.sm;

// Figma 18284:3421/3422 — content padded py-20 px-16, rows stacked with 8px gap.
export const createStyles = (_theme: Theme) =>
  StyleSheet.create({
    content: {
      paddingHorizontal: spacing.lg,
      paddingTop: 20,
      paddingBottom: 20,
    },
    dragArea: {
      gap: ROW_GAP,
    },
    rowWrap: {
      width: '100%',
    },
  });
