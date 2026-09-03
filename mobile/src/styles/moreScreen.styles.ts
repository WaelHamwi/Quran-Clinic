import { StyleSheet } from 'react-native';
import { palette, type Theme } from '@/theme/colors';
import { fontFamily, fontSize, lineHeight } from '@/theme/typography';
import { spacing, radius } from '@/theme/spacing';

export const createStyles = (theme: Theme) =>
  StyleSheet.create({
    moreScreen__content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: 96 },

    moreScreen__profileCard: {
      backgroundColor: theme.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.cardBorder,
      paddingVertical: spacing.xl,
      paddingHorizontal: spacing.lg,
      alignItems: 'center',
      gap: spacing.sm,
    },
    moreScreen__profileName: {
      fontFamily: fontFamily.alexandriaSemiBold,
      fontSize: fontSize.md,
      lineHeight: lineHeight.md,
      color: theme.text,
      textAlign: 'center',
    },
    moreScreen__profileEmail: {
      fontFamily: fontFamily.alexandriaLight,
      fontSize: fontSize.xs,
      lineHeight: lineHeight.xs,
      color: theme.textMuted,
      textAlign: 'center',
    },

    moreScreen__banner: {
      backgroundColor: theme.success,
      borderRadius: radius.md,
      overflow: 'hidden',
    },
    moreScreen__bannerHeader: {
      padding: 14,
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
    },
    moreScreen__bannerCloseBtn: {
      width: 24,
      height: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
    moreScreen__bannerRow: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    moreScreen__bannerIconWrap: {
      width: 50,
      height: 50,
      alignItems: 'center',
      justifyContent: 'center',
    },
    moreScreen__bannerTexts: {
      flex: 1,
      gap: spacing.sm,
      alignItems: 'flex-end',
    },
    moreScreen__bannerTitle: {
      fontFamily: fontFamily.alexandriaSemiBold,
      fontSize: fontSize.md,
      lineHeight: lineHeight.md,
      color: theme.textOnBrand,
      textAlign: 'right',
    },
    moreScreen__bannerRowRtl: { flexDirection: 'row-reverse' },
    moreScreen__bannerHeaderRtl: { flexDirection: 'row-reverse' },
    moreScreen__bannerSub: {
      fontFamily: fontFamily.alexandriaLight,
      fontSize: fontSize.xs,
      lineHeight: lineHeight.xs,
      color: theme.textOnBrand,
      textAlign: 'right',
    },
    moreScreen__bannerCta: {
      backgroundColor: theme.card,
      borderRadius: 40,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
    },
    moreScreen__bannerCtaText: {
      fontFamily: fontFamily.alexandriaMedium,
      fontSize: fontSize.xs,
      lineHeight: lineHeight.xs,
      color: theme.success,
      textAlign: 'center',
    },

    moreScreen__sectionTitle: {
      fontSize: fontSize.sm,
      lineHeight: lineHeight.sm,
      fontFamily: fontFamily.alexandriaMedium,
      color: theme.text,
      textAlign: 'right',
    },

    moreScreen__group: {
      backgroundColor: theme.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.cardBorder,
      paddingHorizontal: spacing.md,
    },

    moreScreen__separator: {
      height: 1,
      backgroundColor: theme.cardBorder,
    },

    moreScreen__footer: {
      alignItems: 'center',
      gap: spacing.xs,
      paddingVertical: spacing.sm,
    },
    moreScreen__appName: {
      fontSize: fontSize.sm,
      lineHeight: lineHeight.sm,
      fontFamily: fontFamily.alexandriaMedium,
      color: theme.text,
      textAlign: 'center',
    },
    moreScreen__versionText: {
      fontSize: fontSize['2xs'],
      lineHeight: lineHeight['2xs'],
      fontFamily: fontFamily.alexandriaLight,
      color: theme.textMuted,
      textAlign: 'center',
    },

    // Modal scrim — intentional fixed translucent black, not a theme surface.
    moreScreen__modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.lg,
    },
    moreScreen__modalCard: {
      backgroundColor: theme.card,
      borderRadius: 20,
      padding: spacing.xl,
      width: '100%',
      maxWidth: 360,
      alignItems: 'center',
      gap: spacing.sm,
    },
    moreScreen__modalIconWrap: {
      width: 56,
      height: 56,
      borderRadius: 28,
      // Subtle error tint bubble — palette ref (no exact theme token).
      backgroundColor: palette.system.error[50],
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.xs,
    },
    moreScreen__modalTitle: {
      fontFamily: fontFamily.alexandriaSemiBold,
      fontSize: fontSize.lg,
      lineHeight: lineHeight.lg,
      color: theme.text,
      textAlign: 'center',
    },
    moreScreen__modalBody: {
      fontFamily: fontFamily.alexandriaLight,
      fontSize: fontSize.sm,
      lineHeight: lineHeight.sm,
      color: theme.textSecondary,
      textAlign: 'center',
      marginBottom: spacing.xs,
    },
    moreScreen__modalBtnDanger: {
      width: '100%',
      height: 40,
      borderRadius: radius.pill,
      backgroundColor: theme.error,
      alignItems: 'center',
      justifyContent: 'center',
    },
    moreScreen__modalBtnDisabled: { opacity: 0.6 },
    moreScreen__modalBtnDangerText: {
      fontFamily: fontFamily.alexandria,
      fontSize: fontSize.sm,
      lineHeight: lineHeight.sm,
      color: theme.textOnBrand,
    },
    moreScreen__modalBtnCancel: {
      width: '100%',
      height: 40,
      borderRadius: radius.pill,
      borderWidth: 1,
      borderColor: theme.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    moreScreen__modalBtnCancelText: {
      fontFamily: fontFamily.alexandria,
      fontSize: fontSize.sm,
      lineHeight: lineHeight.sm,
      color: theme.textSecondary,
    },
  });
