import { StyleSheet } from 'react-native';
import { palette } from '@/theme/colors';
import { fontFamily } from '@/theme/typography';
import { radius, spacing } from '@/theme/spacing';

export const reportBugScreenStyles = StyleSheet.create({
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: 20,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxxl,
    gap: 24,
  },

  /* ── Type selector ────────────────────────────────────────── */
  typeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  typeCard: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: palette.border.primary,
    alignItems: 'center',
    gap: 8,
    backgroundColor: palette.white,
  },
  'typeCard--active': {
    borderColor: palette.brand[500],
    backgroundColor: palette.brand[25],
  },
  typeLabel: {
    fontFamily: fontFamily.alexandriaSemiBold,
    fontSize: 13,
    lineHeight: 20,
    color: palette.text.tertiary,
    textAlign: 'center',
  },
  'typeLabel--active': {
    color: palette.brand[500],
  },

  /* ── Description field ────────────────────────────────────── */
  fieldWrap: { gap: 6 },
  fieldLabel: {
    fontFamily: fontFamily.alexandriaSemiBold,
    fontSize: 13,
    lineHeight: 20,
    color: palette.text.secondary,
    textAlign: 'left',
  },
  fieldLabelRtl: { textAlign: 'right' },
  textArea: {
    minHeight: 140,
    borderWidth: 1,
    borderColor: palette.border.primary,
    borderRadius: radius.md,
    padding: 14,
    fontFamily: fontFamily.alexandria,
    fontSize: 14,
    lineHeight: 22,
    color: palette.text.primary,
    backgroundColor: palette.white,
    textAlignVertical: 'top',
  },

  /* ── Submit button ────────────────────────────────────────── */
  submitBtn: {
    height: 52,
    borderRadius: radius.pill,
    backgroundColor: palette.brand[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnText: {
    fontFamily: fontFamily.alexandriaSemiBold,
    fontSize: 16,
    lineHeight: 24,
    color: palette.text.onBrand,
  },

  /* ── Success state ────────────────────────────────────────── */
  successWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 32,
  },
  successIcon: {
    width: 72,
    height: 72,
    borderRadius: radius.pill,
    backgroundColor: palette.brand[25],
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTitle: {
    fontFamily: fontFamily.alexandriaSemiBold,
    fontSize: 20,
    lineHeight: 30,
    color: palette.text.primary,
    textAlign: 'center',
  },
  successMessage: {
    fontFamily: fontFamily.alexandria,
    fontSize: 14,
    lineHeight: 22,
    color: palette.text.tertiary,
    textAlign: 'center',
  },
  successBtn: {
    marginTop: 8,
    height: 48,
    paddingHorizontal: 32,
    borderRadius: radius.pill,
    backgroundColor: palette.brand[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  successBtnText: {
    fontFamily: fontFamily.alexandriaSemiBold,
    fontSize: 15,
    lineHeight: 22,
    color: palette.text.onBrand,
  },
});
