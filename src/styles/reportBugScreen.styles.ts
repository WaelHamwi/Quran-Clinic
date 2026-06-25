import { StyleSheet } from 'react-native';
import { palette } from '@/theme/colors';
import { fontFamily } from '@/theme/typography';
import { radius, spacing } from '@/theme/spacing';

export const reportBugScreenStyles = StyleSheet.create({
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: 16,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxxl,
    gap: 16,
  },

  /* ── Intro line ───────────────────────────────────────────── */
  intro: {
    fontFamily: fontFamily.alexandria,
    fontSize: 16,
    lineHeight: 24,
    color: palette.text.secondary,
    textAlign: 'center',
  },

  /* ── Generic field block ──────────────────────────────────── */
  field: { gap: 6, width: '100%' },
  fieldLabel: {
    fontFamily: fontFamily.alexandria,
    fontSize: 14,
    lineHeight: 20,
    color: palette.text.secondary,
    textAlign: 'left',
  },
  fieldLabelRtl: { textAlign: 'right' },

  /* ── Type selector (radio cards) ──────────────────────────── */
  typeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  typeCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.border.secondary,
    backgroundColor: palette.white,
  },
  'typeCard--active': {
    borderColor: palette.brand[500],
    backgroundColor: palette.brand[25],
  },
  typeLabel: {
    fontFamily: fontFamily.alexandriaLight,
    fontSize: 14,
    lineHeight: 20,
    color: palette.text.primary,
    textAlign: 'center',
  },
  'typeLabel--active': {
    fontFamily: fontFamily.alexandria,
    color: palette.brand[500],
  },

  /* ── Image attachment ─────────────────────────────────────── */
  imageBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: palette.border.primary,
    backgroundColor: palette.white,
  },
  imageBoxText: {
    fontFamily: fontFamily.alexandriaLight,
    fontSize: 14,
    lineHeight: 20,
    color: palette.text.primary,
  },
  imagePreviewWrap: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: 160,
  },
  imageRemoveBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    backgroundColor: palette.shadow,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* ── Single-line input (guest name) ───────────────────────── */
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: palette.border.secondary,
    borderRadius: radius.md,
    paddingHorizontal: 16,
    fontFamily: fontFamily.alexandriaLight,
    fontSize: 14,
    lineHeight: 20,
    color: palette.text.primary,
    backgroundColor: palette.white,
  },

  /* ── Details text area ────────────────────────────────────── */
  textArea: {
    height: 176,
    borderWidth: 1,
    borderColor: palette.border.secondary,
    borderRadius: radius.md,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: fontFamily.alexandriaLight,
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
    marginTop: 8,
  },
  'submitBtn--disabled': { opacity: 0.6 },
  submitBtnText: {
    fontFamily: fontFamily.alexandria,
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
