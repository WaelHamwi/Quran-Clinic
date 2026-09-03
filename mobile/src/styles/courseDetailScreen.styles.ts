import { StyleSheet } from 'react-native';
import type { Theme } from '@/theme/colors';
import { fontFamily, fontSize, lineHeight } from '@/theme/typography';
import { spacing, radius } from '@/theme/spacing';

export const createStyles = (theme: Theme) =>
  StyleSheet.create({
    flex: { flex: 1 },

    scrollContent: {
      paddingBottom: spacing.xl,
    },

    cover: {
      height: 200,
      padding: spacing.md,
      justifyContent: 'space-between',
      borderTopLeftRadius: radius.lg,
      borderTopRightRadius: radius.lg,
      overflow: 'hidden',
    },

    coverImage: {
      borderTopLeftRadius: radius.lg,
      borderTopRightRadius: radius.lg,
    },

    topRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
    },

    circleBtn: {
      width: 40,
      height: 40,
      borderRadius: radius.pill,
      backgroundColor: theme.fieldBg,
      alignItems: 'center',
      justifyContent: 'center',
    },

    dateRow: {
      alignItems: 'flex-end',
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
      padding: spacing.xl,
      gap: spacing.md,
    },

    title: {
      fontFamily: fontFamily.alexandriaMedium,
      fontSize: fontSize.md,
      lineHeight: lineHeight.md,
      color: theme.primary,
      textAlign: 'right',
    },

    instructorPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      backgroundColor: theme.brandSubtle,
      borderRadius: radius.sm,
      padding: spacing.sm,
    },

    instructorText: {
      flex: 1,
      fontFamily: fontFamily.alexandria,
      fontSize: fontSize.sm,
      lineHeight: lineHeight.sm,
      color: theme.primary,
      textAlign: 'right',
    },

    description: {
      fontFamily: fontFamily.alexandriaLight,
      fontSize: fontSize.sm,
      lineHeight: lineHeight.sm,
      color: theme.textSecondary,
      textAlign: 'right',
    },

    section: {
      gap: spacing.xs,
      width: '100%',
    },

    sectionTitle: {
      fontFamily: fontFamily.alexandriaMedium,
      fontSize: fontSize.sm,
      lineHeight: lineHeight.sm,
      color: theme.textSecondary,
      textAlign: 'right',
    },

    sectionBody: {
      fontFamily: fontFamily.alexandriaLight,
      fontSize: fontSize.sm,
      lineHeight: lineHeight.sm,
      color: theme.textSecondary,
      textAlign: 'right',
    },

    bulletRow: {
      flexDirection: 'row-reverse',
      alignItems: 'flex-start',
      gap: spacing.sm,
    },

    bullet: {
      fontFamily: fontFamily.alexandriaLight,
      fontSize: fontSize.sm,
      lineHeight: lineHeight.sm,
      color: theme.textSecondary,
    },

    bulletText: {
      flex: 1,
      fontFamily: fontFamily.alexandriaLight,
      fontSize: fontSize.sm,
      lineHeight: lineHeight.sm,
      color: theme.textSecondary,
      textAlign: 'right',
    },

    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderTopWidth: 1,
      borderTopColor: theme.cardBorder,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
      paddingBottom: spacing.md,
    },

    bookBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      backgroundColor: theme.success,
      borderRadius: radius.sm,
      paddingHorizontal: spacing.xxl,
      paddingVertical: spacing.md,
    },

    bookBtnText: {
      fontFamily: fontFamily.alexandria,
      fontSize: fontSize.sm,
      lineHeight: lineHeight.sm,
      color: theme.textOnBrand,
    },

    priceBlock: {
      alignItems: 'flex-end',
    },

    price: {
      fontFamily: fontFamily.alexandriaBold,
      fontSize: fontSize.xl,
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
