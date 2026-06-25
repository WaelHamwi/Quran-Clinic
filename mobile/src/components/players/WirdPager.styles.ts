import { StyleSheet } from 'react-native';
import { palette } from '@/theme/colors';
import { fontFamily } from '@/theme/typography';
import { radius } from '@/theme/spacing';

export const PAGER_ICON_COLOR = palette.text.secondary;
export const PAGER_ICON_MUTED = palette.border.primary;

export const wirdPagerStyles = StyleSheet.create({
  // Figma node 18900:2907 — gap 14, paddingH 10
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 10,
  },
  'row--rtl': {
    flexDirection: 'row-reverse',
  },
  arrowBtn: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: palette.white,
    borderWidth: 1,
    borderColor: palette.border.secondary,
    borderRadius: radius.pill,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  pillText: {
    fontFamily: fontFamily.alexandria,
    fontSize: 12,
    lineHeight: 18,
    color: palette.text.secondary,
    textAlign: 'center',
  },
});
