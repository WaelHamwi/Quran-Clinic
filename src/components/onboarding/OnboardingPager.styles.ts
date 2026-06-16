import { StyleSheet } from 'react-native';
import { palette } from '@/theme/colors';
import { fontFamily } from '@/theme/typography';

export const onboardingPagerStyles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.white },
  safe: { flex: 1, alignItems: 'center' },

  // Figma places the illustration at y=138 from the top of the screen. The in-flow top
  // bar (status inset + 44 ≈ 74) already consumes part of that, so this is the remaining
  // gap below it (138 − 74) — not the raw 50, which left the illustration sitting too high.
  illoBlock: { width: 309, height: 294, marginTop: 64, position: 'relative' },
  bgVector: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: 309,
    height: 294,
  },
  illoImageWrap: { position: 'absolute', width: 203, height: 242, left: 53.32, top: 52 },
  illoImage: { width: '100%', height: '100%' },

  bottom: {
    width: '100%',
    marginTop: 50,
    paddingHorizontal: 30,
    gap: 34,
    alignItems: 'center',
  },

  dots: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 8 },
  dotInactive: { width: 12, height: 8, borderRadius: 4, backgroundColor: palette.brand[50] },
  dotActive: { width: 24, height: 8, borderRadius: 4, backgroundColor: palette.secondaryGreen[300] },

  textBlock: { width: '100%', alignItems: 'center' },
  titleText: {
    fontFamily: fontFamily.alexandriaMedium,
    fontSize: 18,
    lineHeight: 28,
    color: palette.brand[500],
    textAlign: 'center',
  },
  verseBlock: { width: '100%', alignItems: 'center', gap: 4 },
  refText: {
    fontFamily: fontFamily.alexandriaLight,
    fontSize: 14,
    lineHeight: 20,
    color: palette.text.tertiary,
    textAlign: 'center',
  },
  bodyText: {
    fontFamily: fontFamily.alexandriaLight,
    fontSize: 14,
    lineHeight: 22,
    color: palette.text.primary,
    textAlign: 'center',
    marginTop: 8,
  },
  checklist: { width: '100%', gap: 12, alignItems: 'stretch' },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
  },
  tick: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  privacyBlock: { width: '100%', gap: 10, alignItems: 'center' },

  cta: {
    width: 330,
    height: 40,
    borderRadius: 999,
    backgroundColor: palette.brand[500],
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    fontFamily: fontFamily.alexandria,
    fontSize: 14,
    lineHeight: 20,
    color: palette.white,
    textAlign: 'center',
  },
  pressed: { opacity: 0.85 },
});
