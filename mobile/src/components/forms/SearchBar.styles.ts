import { StyleSheet } from 'react-native';
import type { Theme } from '@/theme/colors';
import { spacing, space, radius } from '@/theme/spacing';
import { fontSize, fontFamily, lineHeight } from '@/theme/typography';

// Figma RTL Input Field/Text (17941:2320): card bg, primary border, h-40, pill,
// px-16 py-8, placeholder Alexandria Light 14/20.
export const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space.sm,
      backgroundColor: theme.card,
      borderRadius: radius.pill,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      height: 40,
      borderWidth: 1,
      borderColor: theme.border,
    },
    containerRtl: {
      flexDirection: 'row-reverse',
    },
    input: {
      flex: 1,
      fontSize: fontSize.sm,
      lineHeight: lineHeight.sm,
      color: theme.text,
      paddingVertical: 0,
      fontFamily: fontFamily.alexandriaLight,
    },
  });
