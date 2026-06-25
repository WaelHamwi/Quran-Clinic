import { StyleSheet } from 'react-native';
import { palette } from '@/theme/colors';
import { fontFamily } from '@/theme/typography';

export const ON_BRAND = palette.white;

// Figma node 18284:3424 "RTL Button" — full-width brand pill, centred play
// icon + label, used as the Favorites "Play all" CTA.
export const playAllFavoritesBtnStyles = StyleSheet.create({
  playAllBtn: {
    // flexDirection is set inline from `isArabic` so the icon stays leading.
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    width: '100%',
    backgroundColor: palette.brand[500],
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 16,
  },
  'playAllBtn--pressed': { opacity: 0.9 },
  playAllBtn__label: {
    fontFamily: fontFamily.alexandria,
    fontSize: 14,
    lineHeight: 20,
    color: ON_BRAND,
    textAlign: 'center',
  },
});
