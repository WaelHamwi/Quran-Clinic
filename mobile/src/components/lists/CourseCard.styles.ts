import { StyleSheet } from 'react-native';
import type { Theme } from '@/theme/colors';
import { fontFamily, fontSize, lineHeight } from '@/theme/typography';
import { spacing, radius } from '@/theme/spacing';

export const createStyles = (theme: Theme) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.card,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: theme.cardBorder,
      overflow: 'hidden',
    },

    // Cover image header with the date / coming-soon pill in the top-right corner.
    cover: {
      height: 112,
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'flex-end',
      padding: spacing.md,
    },

    coverImage: {
      borderTopLeftRadius: radius.md,
      borderTopRightRadius: radius.md,
    },

    datePill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2,
      backgroundColor: theme.card,
      borderRadius: radius.pill,
      paddingLeft: 10,
      paddingRight: spacing.sm,
      paddingVertical: 2,
    },

    datePillText: {
      fontFamily: fontFamily.alexandria,
      fontSize: fontSize.xs,
      lineHeight: lineHeight.xs,
      color: theme.text,
    },

    body: {
      padding: spacing.md,
      gap: spacing.md,
    },

    textGroup: {
      gap: spacing.xs,
    },

    title: {
      fontFamily: fontFamily.alexandriaMedium,
      fontSize: fontSize.sm,
      lineHeight: lineHeight.sm,
      color: theme.primary,
      textAlign: 'right',
    },

    description: {
      fontFamily: fontFamily.alexandriaLight,
      fontSize: fontSize.xs,
      lineHeight: lineHeight.xs,
      color: theme.textMuted,
      textAlign: 'right',
    },

    instructorPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      backgroundColor: theme.brandSubtle,
      borderRadius: radius.sm,
      padding: spacing.xs,
    },

    instructorText: {
      flex: 1,
      fontFamily: fontFamily.alexandria,
      fontSize: fontSize.xs,
      lineHeight: lineHeight.xs,
      color: theme.primary,
      textAlign: 'right',
    },

    footerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },

    detailsBtn: {
      backgroundColor: theme.primary,
      borderRadius: radius.sm,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
    },

    detailsBtnText: {
      fontFamily: fontFamily.alexandria,
      fontSize: fontSize.xs,
      lineHeight: lineHeight.xs,
      color: theme.textOnBrand,
    },

    priceBlock: {
      alignItems: 'flex-end',
    },

    price: {
      fontFamily: fontFamily.alexandriaBold,
      fontSize: fontSize.lg,
      lineHeight: lineHeight.lg,
      color: theme.primary,
      textAlign: 'right',
    },

    priceSuffix: {
      fontFamily: fontFamily.alexandriaLight,
      fontSize: fontSize.xs,
      lineHeight: lineHeight.xs,
      color: theme.textMuted,
      textAlign: 'right',
    },
  });
