import { StyleSheet } from 'react-native';
import { shadows, type Theme } from '@/theme/colors';
import { fontFamily, fontSize, lineHeight } from '@/theme/typography';
import { radius, spacing } from '@/theme/spacing';

export const createStyles = (theme: Theme) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.background,
    },

    closeBtn: {
      position: 'absolute',
      top: spacing.lg,
      right: 20,
      zIndex: 10,
      width: 32,
      height: 32,
      borderRadius: radius.pill,
      // Translucent control over the dark hero — documented opacity tint.
      backgroundColor: 'rgba(255,255,255,0.25)',
      alignItems: 'center',
      justifyContent: 'center',
    },

    hero: {
      backgroundColor: theme.primaryDark,
      paddingTop: 60,
      paddingBottom: spacing.xxl,
      alignItems: 'center',
      gap: spacing.lg,
    },
    lockCircle: {
      width: 80,
      height: 80,
      borderRadius: radius.pill,
      // Subtle light wash on the dark hero — documented opacity tint.
      backgroundColor: 'rgba(255,255,255,0.1)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    heroTitle: {
      fontFamily: fontFamily.alexandriaSemiBold,
      fontSize: fontSize.xl,
      lineHeight: lineHeight.xl,
      color: theme.textOnBrand,
      textAlign: 'center',
      paddingHorizontal: spacing.xl,
    },
    heroSubtitle: {
      fontFamily: fontFamily.alexandria,
      fontSize: 13,
      lineHeight: lineHeight.sm,
      color: theme.onBrandMuted,
      textAlign: 'center',
      paddingHorizontal: spacing.xxl,
    },

    featuresSection: {
      paddingHorizontal: 20,
      paddingTop: spacing.xl,
      gap: spacing.lg,
    },
    featureRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.md,
    },
    featureIcon: {
      width: 40,
      height: 40,
      borderRadius: radius.sm,
      backgroundColor: theme.brandSubtle,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    featureText: {
      flex: 1,
      gap: 2,
    },
    featureTitle: {
      fontFamily: fontFamily.alexandriaSemiBold,
      fontSize: fontSize.sm,
      lineHeight: 22,
      color: theme.text,
    },
    featureDesc: {
      fontFamily: fontFamily.alexandria,
      fontSize: fontSize.xs,
      lineHeight: lineHeight.xs,
      color: theme.textMuted,
    },

    pricingSection: {
      paddingHorizontal: 20,
      paddingTop: spacing.xl,
      gap: spacing.md,
    },
    priceCard: {
      borderWidth: 1.5,
      borderColor: theme.border,
      borderRadius: radius.md,
      padding: spacing.lg,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    'priceCard--selected': {
      borderColor: theme.primary,
      backgroundColor: theme.brandSubtle,
    },
    priceCardRadio: {
      width: 20,
      height: 20,
      borderRadius: radius.pill,
      borderWidth: 2,
      borderColor: theme.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    'priceCardRadio--selected': {
      borderColor: theme.primary,
    },
    priceCardRadioDot: {
      width: 10,
      height: 10,
      borderRadius: radius.pill,
      backgroundColor: theme.primary,
    },
    priceCardContent: {
      flex: 1,
      gap: 2,
    },
    priceCardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    priceCardLabel: {
      fontFamily: fontFamily.alexandriaSemiBold,
      fontSize: fontSize.sm,
      lineHeight: 22,
      color: theme.text,
    },
    saveBadge: {
      backgroundColor: theme.primary,
      borderRadius: radius.pill,
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
    },
    saveBadgeText: {
      fontFamily: fontFamily.alexandriaSemiBold,
      fontSize: fontSize['2xs'],
      lineHeight: lineHeight['2xs'],
      color: theme.textOnBrand,
    },
    priceRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: spacing.xs,
    },
    priceAmount: {
      fontFamily: fontFamily.alexandriaBold,
      fontSize: fontSize.lg,
      lineHeight: 26,
      color: theme.primary,
    },
    pricePer: {
      fontFamily: fontFamily.alexandria,
      fontSize: fontSize.xs,
      lineHeight: lineHeight.xs,
      color: theme.textMuted,
    },

    ctaSection: {
      paddingHorizontal: 20,
      paddingTop: spacing.xl,
      paddingBottom: spacing.xxxl,
      gap: spacing.md,
      alignItems: 'center',
    },
    ctaButton: {
      width: '100%',
      height: 52,
      borderRadius: radius.pill,
      backgroundColor: theme.primary,
      alignItems: 'center',
      justifyContent: 'center',
      ...shadows.lg,
    },
    ctaLabel: {
      fontFamily: fontFamily.alexandriaSemiBold,
      fontSize: fontSize.md,
      lineHeight: lineHeight.md,
      color: theme.textOnBrand,
    },
    trialText: {
      fontFamily: fontFamily.alexandria,
      fontSize: 13,
      lineHeight: lineHeight.sm,
      color: theme.textMuted,
      textDecorationLine: 'underline',
    },
  });
