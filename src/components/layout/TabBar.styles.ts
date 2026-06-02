import { StyleSheet } from 'react-native';
import { palette } from '@/theme/colors';
import { fontFamily } from '@/theme/typography';

export const ICON_ACTIVE = palette.white;
export const ICON_INACTIVE = palette.text.secondaryOnBrand;

export const tabBarStyles = StyleSheet.create({
  tabBar: {
    backgroundColor: palette.brand[500],
  },
  tabBar__bar: {
    flexDirection: 'row',
    backgroundColor: palette.brand[500],
    paddingTop: 8,
    paddingHorizontal: 24,
    alignItems: 'stretch',
  },
  tabBar__tab: {
    flex: 1,
    flexDirection: 'column',
    flexShrink: 0,
    minWidth: 48,
    paddingHorizontal: 4,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  'tabBar__tab--active': {
    backgroundColor: palette.brand[700],
  },
  tabBar__icon: {
    width: 20,
    height: 20,
  },
  tabBar__label: {
    fontFamily: fontFamily.alexandria,
    fontSize: 10,
    lineHeight: 16,
    color: palette.text.secondaryOnBrand,
    textAlign: 'center',
    width: '100%',
  },
  'tabBar__label--active': {
    color: palette.white,
  },
});
