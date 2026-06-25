import { StyleSheet } from 'react-native';
import { palette } from '@/theme/colors';
import { fontFamily, fontSize, lineHeight } from '@/theme/typography';
import { spacing, radius } from '@/theme/spacing';

export const contactUsScreenStyles = StyleSheet.create({
  content: {
    padding: spacing.lg,
    paddingTop: 20,
    paddingBottom: 30,
    gap: spacing.lg,
  },

  subtitle: {
    fontFamily: fontFamily.alexandria,
    fontSize: fontSize.md,
    lineHeight: lineHeight.md,
    color: palette.text.secondary,
    textAlign: 'center',
    alignSelf: 'center',
  },

  fieldGroup: {
    width: '100%',
    gap: 6,
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
    gap: 6,
  },
  inputRowRtl: { flexDirection: 'row-reverse' },

  inputIcon: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  input: {
    flex: 1,
    fontFamily: fontFamily.alexandriaLight,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
    color: palette.text.primary,
    padding: 0,
  },

  textareaWrap: {
    width: '100%',
    height: 176,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.border.primary,
    backgroundColor: palette.bg.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },

  textarea: {
    flex: 1,
    fontFamily: fontFamily.alexandriaLight,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
    color: palette.text.primary,
    textAlignVertical: 'top',
    padding: 0,
  },

  sendButton: {
    width: '100%',
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: palette.brand[500],
    alignItems: 'center',
    justifyContent: 'center',
  },

  sendButtonText: {
    fontFamily: fontFamily.alexandria,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
    color: palette.text.onBrand,
    textAlign: 'center',
  },
});
