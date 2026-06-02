import { StyleSheet } from 'react-native';
import { palette } from '@/theme/colors';
import { fontFamily } from '@/theme/typography';

export const homeScreenStyles = StyleSheet.create({
  homeScreen__headerWrap: { gap: 16, paddingTop: 20 },
  homeScreen__gridHeader: { gap: 16 },
  homeScreen__pillsBleed: { marginHorizontal: -16 },
  homeScreen__devSection: { marginTop: 12, gap: 6 },
  homeScreen__devLabel: {
    fontFamily: fontFamily.alexandriaBold,
    fontSize: 10,
    lineHeight: 16,
    color: palette.system.error[500],
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  homeScreen__devClearBtn: {
    backgroundColor: '#1c0a0a',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#7f1d1d',
  },
  'homeScreen__devClearBtn--disabled': { opacity: 0.5 },
  homeScreen__devClearBtnText: {
    color: '#fca5a5',
    fontFamily: fontFamily.alexandriaBold,
    fontSize: 12,
    lineHeight: 18,
  },
});
