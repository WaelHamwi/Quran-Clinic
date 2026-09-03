import { StyleSheet } from 'react-native';
import type { Theme } from '@/theme/colors';
import { spacing, radius } from '@/theme/spacing';
import { fontFamily, fontSize, lineHeight } from '@/theme/typography';

export const createStyles = (theme: Theme) =>
  StyleSheet.create({
    scrollContent: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.lg,
      paddingBottom: spacing.xxxl,
    },
    card: {
      backgroundColor: theme.card,
      borderRadius: radius.md,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.xl,
      gap: 20,
      alignItems: 'center',
    },
    illustration: {
      width: 160,
      height: 160,
      alignItems: 'center',
      justifyContent: 'center',
    },
    illustrationCircle: {
      position: 'absolute',
      width: 160,
      height: 160,
      borderRadius: 80,
      backgroundColor: theme.brandSubtle,
    },
    listRow: {
      flexDirection: 'row',
      gap: spacing.sm,
      alignSelf: 'stretch',
      alignItems: 'flex-start',
    },
    'listRow--rtl': {
      flexDirection: 'row-reverse',
    },
    bullet: {
      fontFamily: fontFamily.alexandriaLight,
      fontSize: fontSize.sm,
      lineHeight: lineHeight.sm,
      color: theme.textSecondary,
      minWidth: 20,
      textAlign: 'center',
    },
    listText: {
      flex: 1,
      fontFamily: fontFamily.alexandriaLight,
      fontSize: fontSize.sm,
      lineHeight: lineHeight.sm,
      color: theme.textSecondary,
    },
    'listText--rtl': {
      textAlign: 'right',
    },
    'listText--ltr': {
      textAlign: 'left',
    },
  });
