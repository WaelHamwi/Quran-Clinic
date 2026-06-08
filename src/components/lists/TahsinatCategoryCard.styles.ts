import { StyleSheet } from 'react-native';
import { palette } from '@/theme/colors';
import { fontFamily } from '@/theme/typography';

export const ARROW_COLOR = palette.text.tertiary;
export const ICON_ON_TILE = palette.white;
export const TILE_COLOR = palette.brand[500];

export const tahsinatCategoryCardStyles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: palette.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: palette.border.secondary,
    padding: 12,
    gap: 12,
    overflow: 'hidden',
  },
  'card--pressed': { opacity: 0.85 },
  right: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    justifyContent: 'flex-end',
  },
  texts: {
    flex: 1,
    gap: 4,
    alignItems: 'flex-end',
  },
  title: {
    fontFamily: fontFamily.alexandria,
    fontSize: 14,
    lineHeight: 20,
    color: palette.brand[500],
    textAlign: 'right',
  },
  iconTile: {
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconImage: {
    width: 32,
    height: 32,
  },
});
