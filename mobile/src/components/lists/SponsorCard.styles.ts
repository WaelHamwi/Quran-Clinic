import { StyleSheet } from 'react-native';
import { palette } from '@/theme/colors';
import { fontFamily, fontSize, lineHeight } from '@/theme/typography';
import { radius } from '@/theme/spacing';

/** Figma sponsor "Section Card" — node 18272:3445.
 *  RTL baseline: open-link arrow on the far (start) edge, then the name/tier
 *  text block, then the 60×68 logo box bleeding to the (end) edge. The LTR
 *  variants mirror the row so English reads logo→text→arrow. */
export const sponsorCardStyles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: palette.bg.primary,
    borderWidth: 1,
    borderColor: palette.border.primary,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  // Arrow sits on the start edge with the only inner padding; the logo box
  // bleeds flush to the opposite edge (overflow-clip), matching Figma.
  cardRtl: { paddingLeft: 10 },
  cardLtr: { flexDirection: 'row-reverse', paddingRight: 10 },

  pressed: { opacity: 0.85 },

  arrowWrap: {
    width: 25.456,
    height: 25.456,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Up arrow rotated to point toward the trailing edge (up-left in RTL).
  arrowRtl: { transform: [{ rotate: '-45deg' }] },
  arrowLtr: { transform: [{ rotate: '45deg' }] },

  group: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  groupLtr: { flexDirection: 'row-reverse' },

  texts: { gap: 2 },
  textsRtl: { alignItems: 'flex-end' },
  textsLtr: { alignItems: 'flex-start' },

  name: {
    fontFamily: fontFamily.alexandria,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
    color: palette.brand[500],
  },
  tier: {
    fontFamily: fontFamily.alexandriaLight,
    fontSize: fontSize.xs,
    lineHeight: lineHeight.xs,
    color: palette.text.tertiary,
  },

  logoBox: {
    width: 60,
    height: 68,
    backgroundColor: palette.gray[50],
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  // Figma frame47 image fills 63.33% × 78.12% of the box, centred.
  logoImg: { width: '63.33%', height: '78.12%' },
});
