import { StyleSheet } from 'react-native';
import { palette } from '@/theme/colors';
import { fontFamily } from '@/theme/typography';

export const ON_BRAND = palette.white;

export const generalRuqyahBtnStyles = StyleSheet.create({
  generalRuqyahBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: palette.secondaryGreen[600],
    borderWidth: 1,
    borderColor: palette.border.secondary,
    padding: 14,
    overflow: 'hidden',
    borderTopLeftRadius: 100,
    borderBottomLeftRadius: 100,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
  },
  'generalRuqyahBtn--pressed': {
    opacity: 0.9,
  },
  generalRuqyahBtn__playWrap: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  generalRuqyahBtn__texts: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 8,
  },
  generalRuqyahBtn__title: {
    fontFamily: fontFamily.alexandriaSemiBold,
    fontSize: 16,
    lineHeight: 24,
    color: ON_BRAND,
  },
  generalRuqyahBtn__subtitle: {
    fontFamily: fontFamily.alexandriaLight,
    fontSize: 13,
    lineHeight: 19,
    color: ON_BRAND,
  },
});
