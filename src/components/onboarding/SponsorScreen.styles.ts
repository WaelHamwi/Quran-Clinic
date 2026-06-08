import { StyleSheet } from 'react-native';
import { palette } from '@/theme/colors';
import { fontFamily } from '@/theme/typography';

/** Figma sponsor splash (node 18511:2993) — light, centered logo + name. */
export const sponsorScreenStyles = StyleSheet.create({
  flex: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: palette.white,
  },
  safe: { flex: 1 },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 100,
    gap: 30,
  },
  label: {
    fontFamily: fontFamily.alexandria,
    fontSize: 16,
    lineHeight: 24,
    color: palette.text.primary,
    textAlign: 'center',
  },
  logoWrap: {
    width: 228,
    height: 228,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImg: { width: '100%', height: '100%' },
  nameAr: {
    fontFamily: fontFamily.madani,
    fontSize: 20,
    lineHeight: 30,
    color: palette.text.primary,
    textAlign: 'center',
  },
});
