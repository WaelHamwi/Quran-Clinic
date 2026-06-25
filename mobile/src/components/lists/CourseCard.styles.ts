import { StyleSheet } from 'react-native';
import { palette } from '@/theme/colors';
import { fontFamily, fontSize, lineHeight } from '@/theme/typography';
import { spacing, radius } from '@/theme/spacing';

export const courseCardStyles = StyleSheet.create({
  card: {
    backgroundColor: palette.bg.primary,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.border.secondary,
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
    backgroundColor: palette.bg.primary,
    borderRadius: radius.pill,
    paddingLeft: 10,
    paddingRight: spacing.sm,
    paddingVertical: 2,
  },

  datePillText: {
    fontFamily: fontFamily.alexandria,
    fontSize: fontSize.xs,
    lineHeight: lineHeight.xs,
    color: palette.text.primary,
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
    color: palette.brand[500],
    textAlign: 'right',
  },

  description: {
    fontFamily: fontFamily.alexandriaLight,
    fontSize: fontSize.xs,
    lineHeight: lineHeight.xs,
    color: palette.text.tertiary,
    textAlign: 'right',
  },

  instructorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: palette.brand[25],
    borderRadius: radius.sm,
    padding: spacing.xs,
  },

  instructorText: {
    flex: 1,
    fontFamily: fontFamily.alexandria,
    fontSize: fontSize.xs,
    lineHeight: lineHeight.xs,
    color: palette.brand[500],
    textAlign: 'right',
  },

  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  detailsBtn: {
    backgroundColor: palette.brand[500],
    borderRadius: radius.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },

  detailsBtnText: {
    fontFamily: fontFamily.alexandria,
    fontSize: fontSize.xs,
    lineHeight: lineHeight.xs,
    color: palette.text.onBrand,
  },

  priceBlock: {
    alignItems: 'flex-end',
  },

  price: {
    fontFamily: fontFamily.alexandriaBold,
    fontSize: fontSize.lg,
    lineHeight: lineHeight.lg,
    color: palette.brand[500],
    textAlign: 'right',
  },

  priceSuffix: {
    fontFamily: fontFamily.alexandriaLight,
    fontSize: fontSize.xs,
    lineHeight: lineHeight.xs,
    color: palette.text.tertiary,
    textAlign: 'right',
  },
});
