import { StyleSheet } from 'react-native';
import type { Theme } from '@/theme/colors';
import { fontFamily, fontSize, lineHeight } from '@/theme/typography';
import { spacing, radius } from '@/theme/spacing';

export const createStyles = (theme: Theme) =>
  StyleSheet.create({
    content: {
      padding: spacing.lg,
      gap: spacing.lg,
      paddingBottom: 96,
    },

    avatarSection: {
      alignItems: 'center',
      gap: spacing.sm,
      paddingBottom: spacing.sm,
    },
    avatarPressable: {
      position: 'relative',
    },
    avatarEditBadge: {
      position: 'absolute',
      right: 0,
      bottom: 0,
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: theme.primary,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: theme.card,
    },
    avatarName: {
      fontFamily: fontFamily.alexandriaSemiBold,
      fontSize: fontSize.md,
      lineHeight: lineHeight.md,
      color: theme.text,
      textAlign: 'center',
    },

    fieldGroup: {
      gap: spacing.xs,
    },

    label: {
      fontFamily: fontFamily.alexandria,
      fontSize: fontSize.sm,
      lineHeight: lineHeight.sm,
      color: theme.textSecondary,
      textAlign: 'left',
    },
    labelRtl: { textAlign: 'right' },

    inputRow: {
      height: 40,
      borderRadius: radius.pill,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.card,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
      gap: spacing.xs,
    },
    inputRowRtl: { flexDirection: 'row-reverse' },

    inputRowDisabled: {
      backgroundColor: theme.fieldBg,
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
      color: theme.text,
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
      borderColor: theme.border,
      backgroundColor: theme.card,
      borderRadius: radius.sm,
      paddingHorizontal: spacing.md,
      paddingVertical: 10,
    },
    genderOptionRtl: { flexDirection: 'row-reverse' },

    genderOptionSelected: {
      borderColor: theme.primary,
      backgroundColor: theme.brandSubtle,
    },

    genderLabel: {
      fontFamily: fontFamily.alexandriaLight,
      fontSize: fontSize.sm,
      lineHeight: lineHeight.sm,
      color: theme.text,
      textAlign: 'left',
    },
    genderLabelRtl: { textAlign: 'right' },

    radioOuter: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 1.5,
      borderColor: theme.border,
      alignItems: 'center',
      justifyContent: 'center',
    },

    radioOuterSelected: {
      borderColor: theme.primary,
    },

    radioDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: theme.primary,
    },

    hint: {
      fontFamily: fontFamily.alexandriaLight,
      fontSize: fontSize.xs,
      lineHeight: lineHeight.xs,
      color: theme.textMuted,
      textAlign: 'left',
      marginTop: 2,
      paddingHorizontal: spacing.lg,
    },
    hintRtl: { textAlign: 'right' },

    divider: {
      height: 1,
      backgroundColor: theme.cardBorder,
    },

    saveButton: {
      height: 40,
      borderRadius: radius.pill,
      backgroundColor: theme.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: spacing.xs,
    },

    saveButtonText: {
      fontFamily: fontFamily.alexandria,
      fontSize: fontSize.sm,
      lineHeight: lineHeight.sm,
      color: theme.textOnBrand,
      textAlign: 'center',
    },
  });
