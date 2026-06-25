import { StyleSheet } from 'react-native';
import { palette } from '@/theme/colors';
import { fontFamily } from '@/theme/typography';

export const ICON_ON_TILE = palette.white;
export const TEXT_TERTIARY_COLOR = palette.text.tertiary;

export const categoryCardStyles = StyleSheet.create({
  categoryCard: {
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
  'categoryCard--pressed': {
    opacity: 0.85,
  },
  categoryCard__right: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    justifyContent: 'flex-end',
  },
  categoryCard__texts: {
    flex: 1,
    gap: 4,
    alignItems: 'flex-end',
  },
  categoryCard__name: {
    fontFamily: fontFamily.alexandria,
    fontSize: 14,
    lineHeight: 20,
    color: palette.brand[500],
    textAlign: 'right',
  },
  categoryCard__desc: {
    fontFamily: fontFamily.alexandriaLight,
    fontSize: 12,
    lineHeight: 18,
    color: palette.text.tertiary,
    textAlign: 'right',
  },
  categoryCard__iconTile: {
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryCard__iconImage: {
    width: 32,
    height: 32,
  },
});

export const FALLBACK_COLORS = ['#9a38f0', '#1ea525', '#f79009', '#f04438', '#3894f0'] as const;

export function colorForId(id: number): string {
  const i = ((id % FALLBACK_COLORS.length) + FALLBACK_COLORS.length) % FALLBACK_COLORS.length;
  return FALLBACK_COLORS[i];
}
