import { StyleSheet } from 'react-native';
import type { Theme } from '@/theme/colors';
import { fontFamily, fontSize, lineHeight } from '@/theme/typography';
import { spacing, radius } from '@/theme/spacing';

export const createStyles = (theme: Theme) =>
  StyleSheet.create({
    body: {
      flex: 1,
      paddingTop: spacing.xl,
      gap: 20,
    },
    cardWrapper: {
      flex: 1,
      paddingHorizontal: 20,
    },
    card: {
      flex: 1,
      backgroundColor: theme.card,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: theme.cardBorder,
      overflow: 'hidden',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: 40,
    },
    cardContent: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xl,
      paddingHorizontal: spacing.lg,
      paddingBottom: 20,
    },
    labelText: {
      fontFamily: fontFamily.alexandriaSemiBold,
      fontSize: fontSize.xs,
      lineHeight: lineHeight.xs,
      color: theme.primary,
      textAlign: 'center',
    },
    // Mirrors Adhkar (Figma 18079:2255) — Alexandria Regular, text-xl / display-sm.
    arabicText: {
      fontFamily: fontFamily.alexandria,
      fontSize: fontSize.xl,
      lineHeight: lineHeight.displaySm,
      color: theme.text,
      textAlign: 'center',
      writingDirection: 'rtl',
    },
    hintText: {
      fontFamily: fontFamily.alexandriaLight,
      fontSize: 13,
      lineHeight: lineHeight.sm,
      color: theme.textMuted,
      textAlign: 'center',
    },
    bottomPanel: {
      backgroundColor: theme.card,
      borderTopWidth: 1,
      borderTopColor: theme.cardBorder,
      borderTopLeftRadius: radius.lg,
      borderTopRightRadius: radius.lg,
      paddingBottom: 40,
      paddingTop: 20,
      paddingHorizontal: 20,
      gap: spacing.lg,
    },
    progressRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
    },
    progressText: {
      fontFamily: fontFamily.alexandriaLight,
      fontSize: fontSize.xs,
      lineHeight: lineHeight['2xs'],
      color: theme.textMuted,
    },
    // Next + Previous buttons sit side by side, gap 12 — mirrors Adhkar.
    navRow: {
      flexDirection: 'row',
      gap: spacing.md,
    },
    navBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      backgroundColor: theme.brandSubtle,
      borderRadius: radius.md,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
    },
    navBtnText: {
      fontFamily: fontFamily.alexandria,
      fontSize: fontSize.md,
      lineHeight: lineHeight.md,
      color: theme.primary,
    },
    navBtnDisabled: {
      opacity: 0.4,
    },
  });
