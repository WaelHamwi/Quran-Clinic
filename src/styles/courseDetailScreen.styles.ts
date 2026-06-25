import { StyleSheet } from 'react-native';
import { palette } from '@/theme/colors';
import { fontFamily, fontSize, lineHeight } from '@/theme/typography';
import { spacing, radius } from '@/theme/spacing';

export const courseDetailStyles = StyleSheet.create({
  flex: { flex: 1 },

  scrollContent: {
    paddingBottom: spacing.xl,
  },

  // Cover image header: floating action buttons on top, date pill at the bottom.
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
    backgroundColor: palette.gray[100],
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
    padding: spacing.xl,
    gap: spacing.md,
  },

  title: {
    fontFamily: fontFamily.alexandriaMedium,
    fontSize: fontSize.md,
    lineHeight: lineHeight.md,
    color: palette.brand[500],
    textAlign: 'right',
  },

  instructorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: palette.brand[25],
    borderRadius: radius.sm,
    padding: spacing.sm,
  },

  instructorText: {
    flex: 1,
    fontFamily: fontFamily.alexandria,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
    color: palette.brand[500],
    textAlign: 'right',
  },

  description: {
    fontFamily: fontFamily.alexandriaLight,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
    color: palette.text.secondary,
    textAlign: 'right',
  },

  // "لمن هذه الدورة؟" / "محاور الدورة" / "معلومات التقديم" sections.
  section: {
    gap: spacing.xs,
    width: '100%',
  },

  sectionTitle: {
    fontFamily: fontFamily.alexandriaMedium,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
    color: palette.text.secondary,
    textAlign: 'right',
  },

  sectionBody: {
    fontFamily: fontFamily.alexandriaLight,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
    color: palette.text.secondary,
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
    color: palette.text.secondary,
  },

  bulletText: {
    flex: 1,
    fontFamily: fontFamily.alexandriaLight,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
    color: palette.text.secondary,
    textAlign: 'right',
  },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: palette.border.secondary,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },

  bookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: palette.secondaryGreen[600],
    borderRadius: radius.sm,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
  },

  bookBtnText: {
    fontFamily: fontFamily.alexandria,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
    color: palette.text.onBrand,
  },

  priceBlock: {
    alignItems: 'flex-end',
  },

  price: {
    fontFamily: fontFamily.alexandriaBold,
    fontSize: fontSize.xl,
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
