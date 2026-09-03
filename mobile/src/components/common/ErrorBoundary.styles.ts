import { StyleSheet } from 'react-native';
import type { Theme } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { fontSize, fontWeight } from '@/theme/typography';

// Colors are applied inline from the theme in ErrorFallback (background/text),
// so this factory only owns layout + typography.
export const createStyles = (_theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.xxl,
      gap: spacing.lg,
    },
    title: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, textAlign: 'center' },
  });
