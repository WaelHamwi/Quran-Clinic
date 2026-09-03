import { StyleSheet } from 'react-native';
import type { Theme } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { fontFamily, fontSize, lineHeight } from '@/theme/typography';

export const createStyles = (theme: Theme) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: theme.background },
    flex: { flex: 1 },

    body: {
      flex: 1,
      paddingTop: 80,
      paddingHorizontal: spacing.xl,
      paddingBottom: spacing.xxl,
      alignItems: 'center',
    },

    heading: {
      fontFamily: fontFamily.alexandria,
      fontSize: fontSize.xl,
      lineHeight: lineHeight.xl,
      color: theme.text,
      textAlign: 'center',
      marginBottom: spacing.md,
    },

    emailHint: {
      fontFamily: fontFamily.alexandriaLight,
      fontSize: fontSize.sm,
      lineHeight: 22,
      color: theme.textSecondary,
      textAlign: 'center',
      marginBottom: 36,
    },

    emailBold: {
      fontFamily: fontFamily.alexandriaMedium,
      color: theme.text,
    },

    boxRow: {
      flexDirection: 'row',
      gap: 10,
      marginBottom: spacing.lg,
    },

    box: {
      width: 46,
      height: 56,
      borderRadius: 10,
      borderWidth: 1.5,
      borderColor: theme.border,
      textAlign: 'center',
      fontSize: 22,
      fontFamily: fontFamily.alexandria,
      color: theme.text,
      backgroundColor: theme.card,
    },

    boxFilled: {
      borderColor: theme.primary,
      backgroundColor: theme.brandSubtle,
    },

    boxError: {
      borderColor: theme.error,
      // Subtle error fill — component-local tint (no exact theme/palette token).
      backgroundColor: '#fff5f5',
    },

    errorText: {
      fontFamily: fontFamily.alexandriaLight,
      fontSize: 13,
      color: theme.error,
      textAlign: 'center',
      marginBottom: spacing.sm,
    },

    spinner: {
      marginVertical: spacing.md,
    },

    resendBtn: {
      marginTop: spacing.xl,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.lg,
    },

    resendDisabled: {
      opacity: 0.45,
    },

    resendText: {
      fontFamily: fontFamily.alexandriaMedium,
      fontSize: fontSize.sm,
      color: theme.primaryMid,
      textDecorationLine: 'underline',
      textAlign: 'center',
    },
  });
