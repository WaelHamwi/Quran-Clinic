import { StyleSheet } from 'react-native';
import { palette, type Theme } from '@/theme/colors';
import { fontFamily, fontSize, lineHeight } from '@/theme/typography';
import { radius, spacing } from '@/theme/spacing';

export const createStyles = (theme: Theme) =>
  StyleSheet.create({
    scroll: { flex: 1 },
    content: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.xl,
      paddingBottom: spacing.xxxl,
      gap: spacing.lg,
    },

    intro: {
      fontFamily: fontFamily.alexandria,
      fontSize: fontSize.md,
      lineHeight: lineHeight.md,
      color: theme.textSecondary,
      textAlign: 'center',
    },

    field: { gap: 6, width: '100%' },
    fieldLabel: {
      fontFamily: fontFamily.alexandria,
      fontSize: fontSize.sm,
      lineHeight: lineHeight.sm,
      color: theme.textSecondary,
      textAlign: 'left',
    },
    fieldLabelRtl: { textAlign: 'right' },

    typeRow: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    typeCard: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: 10,
      paddingHorizontal: spacing.md,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.cardBorder,
      backgroundColor: theme.card,
    },
    'typeCard--active': {
      borderColor: theme.primary,
      backgroundColor: theme.brandSubtle,
    },
    typeLabel: {
      fontFamily: fontFamily.alexandriaLight,
      fontSize: fontSize.sm,
      lineHeight: lineHeight.sm,
      color: theme.text,
      textAlign: 'center',
    },
    'typeLabel--active': {
      fontFamily: fontFamily.alexandria,
      color: theme.primary,
    },

    imageBox: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      padding: spacing.md,
      borderRadius: 12,
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: theme.border,
      backgroundColor: theme.card,
    },
    imageBoxText: {
      fontFamily: fontFamily.alexandriaLight,
      fontSize: fontSize.sm,
      lineHeight: lineHeight.sm,
      color: theme.text,
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
      top: spacing.sm,
      right: spacing.sm,
      width: 28,
      height: 28,
      borderRadius: radius.pill,
      // Dark scrim button over the image — fixed shadow-tone palette ref.
      backgroundColor: palette.shadow,
      alignItems: 'center',
      justifyContent: 'center',
    },

    input: {
      height: 48,
      borderWidth: 1,
      borderColor: theme.cardBorder,
      borderRadius: radius.md,
      paddingHorizontal: spacing.lg,
      fontFamily: fontFamily.alexandriaLight,
      fontSize: fontSize.sm,
      lineHeight: lineHeight.sm,
      color: theme.text,
      backgroundColor: theme.card,
    },

    textArea: {
      height: 176,
      borderWidth: 1,
      borderColor: theme.cardBorder,
      borderRadius: radius.md,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      fontFamily: fontFamily.alexandriaLight,
      fontSize: fontSize.sm,
      lineHeight: 22,
      color: theme.text,
      backgroundColor: theme.card,
      textAlignVertical: 'top',
    },

    submitBtn: {
      height: 52,
      borderRadius: radius.pill,
      backgroundColor: theme.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: spacing.sm,
    },
    'submitBtn--disabled': { opacity: 0.6 },
    submitBtnText: {
      fontFamily: fontFamily.alexandria,
      fontSize: fontSize.md,
      lineHeight: lineHeight.md,
      color: theme.textOnBrand,
    },

    successWrap: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.lg,
      paddingHorizontal: spacing.xxl,
    },
    successIcon: {
      width: 72,
      height: 72,
      borderRadius: radius.pill,
      backgroundColor: theme.brandSubtle,
      alignItems: 'center',
      justifyContent: 'center',
    },
    successTitle: {
      fontFamily: fontFamily.alexandriaSemiBold,
      fontSize: fontSize.xl,
      lineHeight: lineHeight.xl,
      color: theme.text,
      textAlign: 'center',
    },
    successMessage: {
      fontFamily: fontFamily.alexandria,
      fontSize: fontSize.sm,
      lineHeight: 22,
      color: theme.textMuted,
      textAlign: 'center',
    },
    successBtn: {
      marginTop: spacing.sm,
      height: 48,
      paddingHorizontal: spacing.xxl,
      borderRadius: radius.pill,
      backgroundColor: theme.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    successBtnText: {
      fontFamily: fontFamily.alexandriaSemiBold,
      fontSize: 15,
      lineHeight: 22,
      color: theme.textOnBrand,
    },
  });
