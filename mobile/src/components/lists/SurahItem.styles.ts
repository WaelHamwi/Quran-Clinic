import { StyleSheet } from 'react-native';
import { fontFamily } from '@/theme/typography';

const BRAND_25 = '#ebfafa';
const BRAND_500 = '#135452';
const TEXT_PRIMARY = '#181d27';
const TEXT_TERTIARY = '#535862';
const WHITE = '#ffffff';
const BORDER_SECONDARY = '#e9eaeb';

export const surahItemStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: WHITE,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER_SECONDARY,
  },
  pressed: { opacity: 0.85 },

  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  arrowText: {
    fontSize: 18,
    lineHeight: 18,
    color: BRAND_500,
    fontFamily: fontFamily.alexandriaBold,
  },
  versePill: {
    backgroundColor: BRAND_25,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verseCount: {
    fontSize: 10,
    lineHeight: 16,
    color: TEXT_PRIMARY,
    fontFamily: fontFamily.alexandriaLight,
  },

  bookmarkBtn: { padding: 2 },

  rightGroup: {
    alignItems: 'flex-end',
    gap: 4,
  },
  nameAr: {
    fontSize: 16,
    lineHeight: 22,
    color: BRAND_500,
    fontFamily: fontFamily.alexandriaMedium,
    textAlign: 'right',
  },
  meta: {
    fontSize: 12,
    lineHeight: 18,
    color: TEXT_TERTIARY,
    fontFamily: fontFamily.alexandriaLight,
    textAlign: 'right',
  },
});
