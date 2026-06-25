import { StyleSheet } from 'react-native';
import { palette } from '@/theme/colors';
import { fontFamily } from '@/theme/typography';

export const PILL_ACTIVE_TINT = palette.white;
export const PILL_INACTIVE_TINT = palette.brand[500];

export const homeSectionPillsStyles = StyleSheet.create({
  homeSectionPills__scroll: { width: '100%' },
  'homeSectionPills__row--ar': {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
  },
  'homeSectionPills__row--en': {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
  },
  homeSectionPills__pill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  'homeSectionPills__pill--rtl': {
    flexDirection: 'row-reverse',
  },
  'homeSectionPills__pill--inactive': {
    backgroundColor: palette.white,
    borderColor: palette.border.secondary,
  },
  'homeSectionPills__pill--active': {
    backgroundColor: palette.brand[500],
    borderColor: palette.border.secondary,
  },
  'homeSectionPills__pill--pressed': { opacity: 0.85 },
  homeSectionPills__label: {
    fontFamily: fontFamily.alexandria,
    fontSize: 12,
    lineHeight: 18,
  },
});
