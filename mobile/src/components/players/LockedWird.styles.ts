import { StyleSheet } from 'react-native';
import type { Theme } from '@/theme/colors';
import { spacing, radius } from '@/theme/spacing';
import { fontFamily, fontSize, lineHeight } from '@/theme/typography';

// Figma node 18972:3492 — section card paywall.
export const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: 50,
      paddingHorizontal: 30,
      paddingBottom: 30,
      justifyContent: 'space-between',
      gap: 40,
    },
    top: {
      alignItems: 'center',
      gap: 22,
    },
    iconCircle: {
      width: 102,
      height: 102,
      borderRadius: radius.pill,
      backgroundColor: theme.brandSubtle,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      fontFamily: fontFamily.alexandriaSemiBold,
      fontSize: fontSize.xxl,
      lineHeight: 32,
      color: theme.primary,
      textAlign: 'center',
    },
    body: {
      fontFamily: fontFamily.alexandriaLight,
      fontSize: fontSize.md,
      lineHeight: lineHeight.md,
      color: theme.textMuted,
      textAlign: 'center',
    },
    actions: {
      gap: spacing.md,
    },
    primaryBtn: {
      backgroundColor: theme.primary,
      borderRadius: radius.md,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
      alignItems: 'center',
    },
    primaryLabel: {
      fontFamily: fontFamily.alexandria,
      fontSize: fontSize.sm,
      lineHeight: lineHeight.sm,
      color: theme.textOnBrand,
      textAlign: 'center',
    },
    secondaryBtn: {
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: radius.md,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
      alignItems: 'center',
    },
    secondaryLabel: {
      fontFamily: fontFamily.alexandria,
      fontSize: fontSize.sm,
      lineHeight: lineHeight.sm,
      color: theme.textSecondary,
      textAlign: 'center',
    },
  });
