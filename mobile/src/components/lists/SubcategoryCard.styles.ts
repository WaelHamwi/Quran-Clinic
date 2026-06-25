import { StyleSheet } from 'react-native';
import { palette } from '@/theme/colors';
import { fontFamily } from '@/theme/typography';

export const ICON_BRAND_COLOR = palette.brand[500];

export const subcategoryCardStyles = StyleSheet.create({
  subcategoryCard: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-end',
    backgroundColor: palette.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: palette.border.secondary,
    paddingTop: 16,
    paddingHorizontal: 8,
    paddingBottom: 8,
    gap: 4,
    overflow: 'hidden',
  },
  'subcategoryCard--pressed': { opacity: 0.85 },
  subcategoryCard__iconBubble: {
    backgroundColor: palette.brand[25],
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subcategoryCard__iconImage: {
    width: 48,
    height: 48,
  },
  subcategoryCard__name: {
    fontFamily: fontFamily.alexandria,
    fontSize: 14,
    lineHeight: 20,
    minHeight: 36,
    color: palette.brand[500],
    textAlign: 'center',
  },
});
