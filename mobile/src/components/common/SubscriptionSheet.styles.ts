import { StyleSheet } from 'react-native';
import { palette, type Theme } from '@/theme/colors';
import { spacing, radius } from '@/theme/spacing';
import { fontSize, lineHeight, fontFamily } from '@/theme/typography';

/** Premium subscription sheet — Figma 18152:3443. Card surface sheet, crown +
 *  title, feature rows, yearly/monthly plan cards, brand CTA. */
export const createStyles = (theme: Theme) =>
  StyleSheet.create({
    // Modal scrim — intentional fixed translucent black, not a theme surface.
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
    sheet: {
      backgroundColor: theme.card,
      borderTopWidth: 1,
      borderTopColor: theme.cardBorder,
      borderTopLeftRadius: radius.lg,
      borderTopRightRadius: radius.lg,
      maxHeight: '92%',
    },
    header: { padding: spacing.lg, alignItems: 'center' },
    handle: { width: 60, height: 4, borderRadius: radius.lg, backgroundColor: theme.cardBorder },

    body: { paddingHorizontal: 20, alignItems: 'stretch', gap: 20 },
    closeBtn: {
      alignSelf: 'flex-end',
      backgroundColor: theme.fieldBg,
      padding: spacing.md,
      borderRadius: 60,
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    intro: { alignItems: 'center', gap: 20 },
    crown: { width: 72.213, height: 76.782 },
    introTexts: { width: '100%', gap: 14, alignItems: 'flex-end' },
    title: {
      fontFamily: fontFamily.alexandriaSemiBold,
      fontSize: fontSize.xxl,
      lineHeight: lineHeight.xl,
      color: theme.primary,
      textAlign: 'right',
      width: '100%',
    },
    subtitle: {
      fontFamily: fontFamily.alexandriaLight,
      fontSize: fontSize.sm,
      lineHeight: lineHeight.sm,
      color: theme.textMuted,
      textAlign: 'right',
      width: '100%',
    },

    features: { paddingTop: 30, paddingHorizontal: 20, gap: spacing.md },
    featureRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    featureTextWrap: { flex: 1, gap: spacing.xs, alignItems: 'flex-end' },
    featureTitle: {
      fontFamily: fontFamily.alexandria,
      fontSize: fontSize.sm,
      lineHeight: lineHeight.sm,
      color: theme.primary,
      textAlign: 'right',
    },
    featureDesc: {
      fontFamily: fontFamily.alexandriaLight,
      fontSize: fontSize.xs,
      lineHeight: lineHeight.xs,
      color: theme.textMuted,
      textAlign: 'right',
    },
    featureTick: { paddingLeft: spacing.sm, paddingVertical: spacing.sm },

    plans: { paddingHorizontal: spacing.lg, paddingVertical: 30, gap: spacing.md },
    planCard: {
      borderRadius: radius.md,
      padding: spacing.lg,
      borderWidth: 1,
    },
    planYearlyActive: {
      backgroundColor: theme.brandSubtle,
      borderColor: theme.primary,
    },
    planMonthly: {
      backgroundColor: theme.card,
      borderColor: theme.border,
    },
    planMonthlyActive: { borderColor: theme.primary },
    planRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
    savePill: {
      backgroundColor: palette.accents.sale,
      paddingHorizontal: 10,
      paddingVertical: spacing.xs,
      borderRadius: 60,
    },
    savePillText: {
      fontFamily: fontFamily.alexandriaSemiBold,
      fontSize: fontSize.xs,
      color: theme.textOnBrand,
    },
    planTexts: { gap: 10, alignItems: 'flex-end' },
    planTitle: {
      fontFamily: fontFamily.alexandriaSemiBold,
      fontSize: fontSize.md,
      lineHeight: lineHeight.md,
      color: theme.primary,
      textAlign: 'right',
    },
    planTitleMono: {
      fontFamily: fontFamily.alexandriaSemiBold,
      fontSize: fontSize.md,
      lineHeight: lineHeight.md,
      color: theme.textSecondary,
      textAlign: 'right',
    },
    planPriceRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, justifyContent: 'flex-end' },
    planPer: {
      fontFamily: fontFamily.alexandriaSemiBold,
      fontSize: fontSize.xs,
      lineHeight: lineHeight.sm,
      color: theme.primary,
    },
    planPrice: {
      fontFamily: fontFamily.alexandriaSemiBold,
      fontSize: fontSize.xxl,
      lineHeight: lineHeight.sm,
      color: theme.primary,
    },
    planPerMono: {
      fontFamily: fontFamily.alexandriaSemiBold,
      fontSize: fontSize.xs,
      lineHeight: lineHeight.sm,
      color: theme.textSecondary,
    },
    planPriceMono: {
      fontFamily: fontFamily.alexandriaSemiBold,
      fontSize: fontSize.xxl,
      lineHeight: lineHeight.sm,
      color: theme.textSecondary,
    },

    footer: { paddingHorizontal: spacing.lg, paddingTop: 10, paddingBottom: 30, gap: spacing.md },
    cta: {
      backgroundColor: theme.primary,
      borderRadius: radius.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    pressed: { opacity: 0.85 },
    ctaText: {
      fontFamily: fontFamily.alexandria,
      fontSize: fontSize.sm,
      lineHeight: lineHeight.sm,
      color: theme.textOnBrand,
    },
    trial: {
      fontFamily: fontFamily.alexandriaLight,
      fontSize: fontSize.xs,
      lineHeight: lineHeight.xs,
      color: theme.textMuted,
      textAlign: 'center',
    },
  });
