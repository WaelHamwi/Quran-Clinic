import { StyleSheet } from 'react-native';
import { palette } from '@/theme/colors';
import { fontFamily, fontSize, lineHeight } from '@/theme/typography';
import { spacing, radius } from '@/theme/spacing';

export const editProfileStyles = StyleSheet.create({
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
    paddingBottom: 96,
  },

  fieldGroup: {
    gap: spacing.xs,
  },

  label: {
    fontFamily: fontFamily.alexandria,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
    color: palette.text.secondary,
    textAlign: 'left',
  },
  labelRtl: { textAlign: 'right' },

  inputRow: {
    height: 40,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: palette.border.primary,
    backgroundColor: palette.bg.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.xs,
  },
  inputRowRtl: { flexDirection: 'row-reverse' },

  inputRowDisabled: {
    backgroundColor: palette.bg.disabled,
  },

  inputIcon: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  input: {
    flex: 1,
    fontFamily: fontFamily.alexandriaLight,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
    color: palette.text.primary,
    padding: 0,
  },

  chevronIcon: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  genderRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  genderRowRtl: { flexDirection: 'row-reverse' },

  genderOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: palette.border.primary,
    backgroundColor: palette.bg.primary,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
  },
  genderOptionRtl: { flexDirection: 'row-reverse' },

  genderOptionSelected: {
    borderColor: palette.brand[500],
    backgroundColor: palette.brand[25],
  },

  genderLabel: {
    fontFamily: fontFamily.alexandriaLight,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
    color: palette.text.primary,
    textAlign: 'left',
  },
  genderLabelRtl: { textAlign: 'right' },

  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: palette.border.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  radioOuterSelected: {
    borderColor: palette.brand[500],
  },

  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: palette.brand[500],
  },

  divider: {
    height: 1,
    backgroundColor: palette.border.secondary,
  },

  saveButton: {
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: palette.brand[500],
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs,
  },

  saveButtonText: {
    fontFamily: fontFamily.alexandria,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
    color: palette.text.onBrand,
    textAlign: 'center',
  },
});
