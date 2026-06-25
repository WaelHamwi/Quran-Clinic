import { StyleSheet } from 'react-native';
import { palette } from '@/theme/colors';
import { fontFamily, fontSize, lineHeight } from '@/theme/typography';
import { radius, spacing } from '@/theme/spacing';

export const ICON_COLOR = palette.brand[500];

export const searchResultListStyles = StyleSheet.create({
  content: { padding: spacing.lg, gap: spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: palette.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.border.secondary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  'row--rtl': { flexDirection: 'row-reverse' },
  'row--pressed': { opacity: 0.85 },
  iconBubble: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    backgroundColor: palette.brand[25],
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconImage: { width: 28, height: 28 },
  texts: { flex: 1, gap: 2 },
  name: {
    fontFamily: fontFamily.alexandriaMedium,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
    color: palette.text.primary,
  },
  'name--rtl': { textAlign: 'right' },
  kind: {
    fontFamily: fontFamily.alexandriaLight,
    fontSize: fontSize.xs,
    lineHeight: lineHeight.xs,
    color: palette.text.tertiary,
  },
  'kind--rtl': { textAlign: 'right' },
});
