import { StyleSheet } from 'react-native';
import { palette } from '@/theme/colors';
import { fontFamily } from '@/theme/typography';

export const otpGateStyles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.white },
  flex: { flex: 1 },

  body: {
    flex: 1,
    paddingTop: 80,
    paddingHorizontal: 24,
    paddingBottom: 32,
    alignItems: 'center',
  },

  heading: {
    fontFamily: fontFamily.alexandria,
    fontSize: 20,
    lineHeight: 30,
    color: palette.text.primary,
    textAlign: 'center',
    marginBottom: 12,
  },

  emailHint: {
    fontFamily: fontFamily.alexandriaLight,
    fontSize: 14,
    lineHeight: 22,
    color: palette.text.secondary,
    textAlign: 'center',
    marginBottom: 36,
  },

  emailBold: {
    fontFamily: fontFamily.alexandriaMedium,
    color: palette.text.primary,
  },

  boxRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },

  box: {
    width: 46,
    height: 56,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: palette.border.primary,
    textAlign: 'center',
    fontSize: 22,
    fontFamily: fontFamily.alexandria,
    color: palette.text.primary,
    backgroundColor: palette.white,
  },

  boxFilled: {
    borderColor: palette.brand[500],
    backgroundColor: palette.brand[25],
  },

  boxError: {
    borderColor: palette.system.error[500],
    backgroundColor: '#fff5f5',
  },

  errorText: {
    fontFamily: fontFamily.alexandriaLight,
    fontSize: 13,
    color: palette.system.error[500],
    textAlign: 'center',
    marginBottom: 8,
  },

  spinner: {
    marginVertical: 12,
  },

  resendBtn: {
    marginTop: 24,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },

  resendDisabled: {
    opacity: 0.45,
  },

  resendText: {
    fontFamily: fontFamily.alexandriaMedium,
    fontSize: 14,
    color: palette.brand[600],
    textDecorationLine: 'underline',
    textAlign: 'center',
  },
});
