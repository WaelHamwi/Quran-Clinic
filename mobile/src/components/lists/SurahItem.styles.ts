import { StyleSheet } from 'react-native';
import type { Theme } from '@/theme/colors';
import { spacing, radius } from '@/theme/spacing';
import { fontFamily, fontSize, lineHeight } from '@/theme/typography';

export const createStyles = (theme: Theme) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      backgroundColor: theme.card,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: theme.cardBorder,
    },
    pressed: { opacity: 0.85 },

    leftGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    arrowText: {
      fontSize: fontSize.lg,
      lineHeight: lineHeight.xs,
      color: theme.primary,
      fontFamily: fontFamily.alexandriaBold,
    },
    versePill: {
      backgroundColor: theme.brandSubtle,
      borderRadius: radius.pill,
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    verseCount: {
      fontSize: fontSize['2xs'],
      lineHeight: lineHeight['2xs'],
      color: theme.text,
      fontFamily: fontFamily.alexandriaLight,
    },

    bookmarkBtn: { padding: 2 },

    rightGroup: {
      alignItems: 'flex-end',
      gap: spacing.xs,
    },
    nameAr: {
      fontSize: fontSize.md,
      lineHeight: 22,
      color: theme.primary,
      fontFamily: fontFamily.alexandriaMedium,
      textAlign: 'right',
    },
  });
