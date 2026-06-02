import { StyleSheet } from 'react-native';
import { palette } from '@/theme/colors';
import { fontFamily, fontSize, lineHeight } from '@/theme/typography';
import { spacing, radius } from '@/theme/spacing';

export const courseDetailStyles = StyleSheet.create({
  content: {
    padding: spacing.lg,
    paddingBottom: 32,
    gap: spacing.lg,
  },

  headerRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },

  title: {
    flex: 1,
    fontFamily: fontFamily.alexandriaBold,
    fontSize: fontSize.xl,
    lineHeight: lineHeight.xl,
    color: palette.text.primary,
    textAlign: 'right',
  },

  badge: {
    backgroundColor: palette.brand[25],
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    flexShrink: 0,
  },

  badgeText: {
    fontFamily: fontFamily.alexandriaMedium,
    fontSize: fontSize.xs,
    lineHeight: lineHeight.xs,
    color: palette.brand[600],
  },

  divider: {
    height: 1,
    backgroundColor: palette.border.secondary,
  },

  metaGroup: {
    gap: spacing.sm,
  },

  metaRow: {
    fontFamily: fontFamily.alexandria,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
    color: palette.text.secondary,
    textAlign: 'right',
  },

  priceText: {
    fontFamily: fontFamily.alexandriaSemiBold,
    fontSize: fontSize.md,
    lineHeight: lineHeight.md,
    color: palette.brand[600],
    textAlign: 'right',
  },

  dateText: {
    fontFamily: fontFamily.alexandriaLight,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
    color: palette.text.tertiary,
    textAlign: 'right',
  },

  section: {
    gap: spacing.sm,
  },

  sectionTitle: {
    fontFamily: fontFamily.alexandriaSemiBold,
    fontSize: fontSize.md,
    lineHeight: lineHeight.md,
    color: palette.text.primary,
    textAlign: 'right',
  },

  sectionBody: {
    fontFamily: fontFamily.alexandriaLight,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.md,
    color: palette.text.secondary,
    textAlign: 'right',
  },

  ctaBtn: {
    height: 48,
    borderRadius: radius.pill,
    backgroundColor: palette.brand[500],
    alignItems: 'center',
    justifyContent: 'center',
  },

  ctaBtnText: {
    fontFamily: fontFamily.alexandriaSemiBold,
    fontSize: fontSize.md,
    lineHeight: lineHeight.md,
    color: palette.text.onBrand,
  },
});
