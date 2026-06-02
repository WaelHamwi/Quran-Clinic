import { StyleSheet } from 'react-native';
import { palette } from '@/theme/colors';
import { fontFamily } from '@/theme/typography';

export const BANNER_CLOSE_COLOR = palette.white;
export const BANNER_ICON_COLOR = palette.white;

export const moreScreenStyles = StyleSheet.create({
  moreScreen__content: { padding: 16, gap: 16, paddingBottom: 96 },

  moreScreen__banner: {
    backgroundColor: palette.secondaryGreen[600],
    borderRadius: 16,
    overflow: 'hidden',
  },
  moreScreen__bannerHeader: {
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  moreScreen__bannerCloseBtn: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreScreen__bannerRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  moreScreen__bannerIconWrap: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreScreen__bannerTexts: {
    flex: 1,
    gap: 8,
    alignItems: 'flex-end',
  },
  moreScreen__bannerTitle: {
    fontFamily: fontFamily.alexandriaSemiBold,
    fontSize: 16,
    lineHeight: 24,
    color: palette.white,
    textAlign: 'right',
  },
  moreScreen__bannerRowRtl: { flexDirection: 'row-reverse' },
  moreScreen__bannerHeaderRtl: { flexDirection: 'row-reverse' },
  moreScreen__bannerSub: {
    fontFamily: fontFamily.alexandriaLight,
    fontSize: 12,
    lineHeight: 18,
    color: palette.white,
    textAlign: 'right',
  },
  moreScreen__bannerCta: {
    backgroundColor: palette.white,
    borderRadius: 40,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  moreScreen__bannerCtaText: {
    fontFamily: fontFamily.alexandriaMedium,
    fontSize: 12,
    lineHeight: 18,
    color: palette.secondaryGreen[600],
    textAlign: 'center',
  },

  moreScreen__sectionTitle: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fontFamily.alexandriaMedium,
    color: palette.text.primary,
    textAlign: 'right',
  },

  moreScreen__group: {
    backgroundColor: palette.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.border.secondary,
    paddingHorizontal: 12,
  },

  moreScreen__separator: {
    height: 1,
    backgroundColor: palette.border.secondary,
  },

  moreScreen__footer: {
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
  },
  moreScreen__appName: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fontFamily.alexandriaMedium,
    color: palette.text.primary,
    textAlign: 'center',
  },
  moreScreen__versionText: {
    fontSize: 10,
    lineHeight: 16,
    fontFamily: fontFamily.alexandriaLight,
    color: palette.text.tertiary,
    textAlign: 'center',
  },
});
