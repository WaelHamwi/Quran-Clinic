import { StyleSheet } from 'react-native';
import { palette, shadows } from '@/theme/colors';
import { fontFamily } from '@/theme/typography';
import { radius, spacing } from '@/theme/spacing';

export const subscriptionScreenStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.white,
  },

  /* ── Close button ─────────────────────────────────────────── */
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 20,
    zIndex: 10,
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* ── Hero illustration area ───────────────────────────────── */
  hero: {
    backgroundColor: palette.brand[700],
    paddingTop: 60,
    paddingBottom: 32,
    alignItems: 'center',
    gap: 16,
  },
  lockCircle: {
    width: 80,
    height: 80,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    fontFamily: fontFamily.alexandriaSemiBold,
    fontSize: 20,
    lineHeight: 30,
    color: palette.text.onBrand,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  heroSubtitle: {
    fontFamily: fontFamily.alexandria,
    fontSize: 13,
    lineHeight: 20,
    color: palette.text.secondaryOnBrand,
    textAlign: 'center',
    paddingHorizontal: 32,
  },

  /* ── Features section ─────────────────────────────────────── */
  featuresSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    gap: 16,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: palette.brand[25],
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
    fontSize: 14,
    lineHeight: 22,
    color: palette.text.primary,
  },
  featureDesc: {
    fontFamily: fontFamily.alexandria,
    fontSize: 12,
    lineHeight: 18,
    color: palette.text.tertiary,
  },

  /* ── Pricing cards ────────────────────────────────────────── */
  pricingSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    gap: 12,
  },
  priceCard: {
    borderWidth: 1.5,
    borderColor: palette.border.primary,
    borderRadius: radius.md,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  'priceCard--selected': {
    borderColor: palette.brand[500],
    backgroundColor: palette.brand[25],
  },
  priceCardRadio: {
    width: 20,
    height: 20,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: palette.border.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  'priceCardRadio--selected': {
    borderColor: palette.brand[500],
  },
  priceCardRadioDot: {
    width: 10,
    height: 10,
    borderRadius: radius.pill,
    backgroundColor: palette.brand[500],
  },
  priceCardContent: {
    flex: 1,
    gap: 2,
  },
  priceCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priceCardLabel: {
    fontFamily: fontFamily.alexandriaSemiBold,
    fontSize: 14,
    lineHeight: 22,
    color: palette.text.primary,
  },
  saveBadge: {
    backgroundColor: palette.brand[500],
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  saveBadgeText: {
    fontFamily: fontFamily.alexandriaSemiBold,
    fontSize: 10,
    lineHeight: 16,
    color: palette.text.onBrand,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  priceAmount: {
    fontFamily: fontFamily.alexandriaBold,
    fontSize: 18,
    lineHeight: 26,
    color: palette.brand[500],
  },
  pricePer: {
    fontFamily: fontFamily.alexandria,
    fontSize: 12,
    lineHeight: 18,
    color: palette.text.tertiary,
  },

  /* ── CTA section ──────────────────────────────────────────── */
  ctaSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: spacing.xxxl,
    gap: 12,
    alignItems: 'center',
  },
  ctaButton: {
    width: '100%',
    height: 52,
    borderRadius: radius.pill,
    backgroundColor: palette.brand[500],
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.lg,
  },
  ctaLabel: {
    fontFamily: fontFamily.alexandriaSemiBold,
    fontSize: 16,
    lineHeight: 24,
    color: palette.text.onBrand,
  },
  trialText: {
    fontFamily: fontFamily.alexandria,
    fontSize: 13,
    lineHeight: 20,
    color: palette.text.tertiary,
    textDecorationLine: 'underline',
  },
});
