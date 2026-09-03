import { StyleSheet } from 'react-native';
import type { Theme } from '@/theme/colors';
import { spacing, radius } from '@/theme/spacing';
import { fontFamily, fontSize, lineHeight } from '@/theme/typography';

export const createStyles = (theme: Theme) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: theme.background },
    flex: { flex: 1 },
    body: {
      flex: 1,
      paddingTop: 20,
      paddingHorizontal: spacing.xl,
      paddingBottom: spacing.xl,
      alignItems: 'center',
    },

    logoBlock: { width: 129, height: 218, marginBottom: 120 },
    logoTop: { position: 'absolute', top: 0, right: '2.63%', bottom: '41.54%', left: '4.45%' },
    logoMid: { position: 'absolute', top: '66.85%', right: '0.84%', bottom: '21.42%', left: '0.46%' },
    logoBottom: {
      position: 'absolute',
      top: '83.47%',
      right: '0.46%',
      bottom: '0.09%',
      left: '1.37%',
    },

    ctaBlock: { width: '100%', gap: spacing.xl, alignItems: 'center' },
    textBlock: { width: '100%', alignItems: 'center', gap: spacing.lg },

    welcome: {
      fontFamily: fontFamily.alexandria,
      fontSize: fontSize.md,
      lineHeight: lineHeight.md,
      color: theme.text,
      textAlign: 'center',
    },
    subtitle: {
      fontFamily: fontFamily.alexandriaLight,
      fontSize: fontSize.xs,
      lineHeight: lineHeight.xs,
      color: theme.text,
      textAlign: 'center',
    },

    buttons: { width: '100%', gap: spacing.lg, alignItems: 'stretch' },

    googleBtn: {
      backgroundColor: theme.primary,
      borderRadius: radius.pill,
      height: 40,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xs,
      minWidth: 260,
    },
    googleBtnText: {
      color: theme.textOnBrand,
      fontFamily: fontFamily.alexandria,
      fontSize: fontSize.sm,
      lineHeight: lineHeight.sm,
      textAlign: 'center',
    },
    googleIcon: { width: 16, height: 16 },

    guestBtn: {
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: radius.pill,
      height: 40,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      alignItems: 'center',
      justifyContent: 'center',
    },
    guestBtnText: {
      color: theme.textSecondary,
      fontFamily: fontFamily.alexandria,
      fontSize: fontSize.sm,
      lineHeight: lineHeight.sm,
      textAlign: 'center',
    },

    pressed: { opacity: 0.85 },

    terms: {
      fontFamily: fontFamily.alexandriaLight,
      fontSize: fontSize.xs,
      lineHeight: lineHeight.xs,
      color: theme.text,
      textAlign: 'center',
    },
    termsLink: {
      fontFamily: fontFamily.alexandriaMedium,
      color: theme.primaryMid,
      textDecorationLine: 'underline',
    },
  });
