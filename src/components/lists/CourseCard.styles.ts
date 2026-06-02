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
    padding: spacing.lg,
    gap: spacing.sm,
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
    fontSize: fontSize.md,
    lineHeight: lineHeight.md,
    color: palette.text.primary,
    textAlign: 'right',
  },

  badge: {
    backgroundColor: palette.brand[25],
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    flexShrink: 0,
  },

  badgeText: {
    fontFamily: fontFamily.alexandriaMedium,
    fontSize: fontSize.xs,
    lineHeight: lineHeight.xs,
    color: palette.brand[600],
  },

  instructor: {
    fontFamily: fontFamily.alexandria,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
    color: palette.text.secondary,
    textAlign: 'right',
  },

  price: {
    fontFamily: fontFamily.alexandriaMedium,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
    color: palette.brand[600],
    textAlign: 'right',
  },

  date: {
    fontFamily: fontFamily.alexandriaLight,
    fontSize: fontSize.xs,
    lineHeight: lineHeight.xs,
    color: palette.text.tertiary,
    textAlign: 'right',
  },

  detailsBtn: {
    height: 40,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: palette.brand[500],
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs,
  },

  detailsBtnText: {
    fontFamily: fontFamily.alexandriaMedium,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
    color: palette.brand[500],
  },
});
