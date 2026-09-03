import { StyleSheet } from 'react-native';
import type { Theme } from '@/theme/colors';
import { spacing, radius } from '@/theme/spacing';
import { fontSize, fontFamily, lineHeight } from '@/theme/typography';

export const createStyles = (theme: Theme) =>
  StyleSheet.create({
    base: {
      minHeight: 44,
      paddingHorizontal: spacing.lg,
      borderRadius: radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
    },
    content: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    primary: { backgroundColor: theme.primary },
    secondary: { backgroundColor: theme.accent },
    outline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: theme.primary },
    ghost: { backgroundColor: 'transparent' },
    fullWidth: { alignSelf: 'stretch' },
    disabled: { opacity: 0.5 },
    pressed: { opacity: 0.85 },
    label: {
      fontSize: fontSize.md,
      lineHeight: lineHeight.md,
      fontFamily: fontFamily.alexandriaBold,
    },
  });
