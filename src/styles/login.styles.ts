import { StyleSheet } from 'react-native';
import { palette } from '@/theme/colors';
import { fontFamily } from '@/theme/typography';

export const loginStyles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.white },
  flex: { flex: 1 },

  body: {
    flex: 1,
    // See LoginGate.styles.ts — logo sits ~16 below the in-flow top bar so it lands at
    // Figma's y=90, instead of the old 90 which double-counted the bar.
    paddingTop: 16,
    paddingHorizontal: 24,
    paddingBottom: 24,
    alignItems: 'center',
  },

  logoBlock: { width: 129, height: 218, marginBottom: 120 },
  logoTop: { position: 'absolute', top: 0, right: '2.63%', bottom: '41.54%', left: '4.45%' },
  logoMid: { position: 'absolute', top: '66.85%', right: '0.84%', bottom: '21.42%', left: '0.46%' },
  logoBottom: { position: 'absolute', top: '83.47%', right: '0.46%', bottom: '0.09%', left: '1.37%' },

  ctaBlock: { width: '100%', gap: 24, alignItems: 'center' },

  textBlock: { width: '100%', alignItems: 'center', gap: 16 },
  welcome: {
    fontFamily: fontFamily.alexandria,
    fontSize: 16,
    lineHeight: 24,
    color: palette.text.primary,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: fontFamily.alexandriaLight,
    fontSize: 12,
    lineHeight: 18,
    color: palette.text.primary,
    textAlign: 'center',
  },

  buttons: { width: '100%', gap: 16, alignItems: 'stretch' },

  googleBtn: {
    backgroundColor: palette.brand[500],
    borderRadius: 999,
    height: 40,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    minWidth: 260,
  },
  googleBtnText: {
    color: palette.text.onBrand,
    fontFamily: fontFamily.alexandria,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  googleIcon: { width: 16, height: 16 },

  guestBtn: {
    backgroundColor: palette.white,
    borderWidth: 1,
    borderColor: palette.border.primary,
    borderRadius: 999,
    height: 40,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestBtnText: {
    color: palette.text.secondary,
    fontFamily: fontFamily.alexandria,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },

  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.6 },

  terms: {
    fontFamily: fontFamily.alexandriaLight,
    fontSize: 12,
    lineHeight: 18,
    color: palette.text.primary,
    textAlign: 'center',
  },
  termsLink: {
    fontFamily: fontFamily.alexandriaMedium,
    color: palette.brand[600],
    textDecorationLine: 'underline',
  },
});
