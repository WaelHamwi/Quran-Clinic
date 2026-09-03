import { StyleSheet } from 'react-native';
import type { Theme } from '@/theme/colors';
import { fontFamily, fontSize, lineHeight } from '@/theme/typography';
import { spacing, radius } from '@/theme/spacing';

export const createStyles = (theme: Theme) =>
  StyleSheet.create({
    content: {
      padding: spacing.lg,
      gap: spacing.md,
      paddingBottom: 40,
      flexGrow: 1,
    },

    // ── Notification row ───────────────────────────────────────────
    item: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.md,
      backgroundColor: theme.card,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: theme.cardBorder,
      padding: spacing.md,
    },
    itemUnread: {
      borderColor: theme.brandSubtleBorder,
      backgroundColor: theme.brandSubtle,
    },
    iconBubble: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.brandSubtle,
    },
    itemTexts: {
      flex: 1,
      gap: 2,
      alignItems: 'flex-end',
    },
    itemTitle: {
      fontFamily: fontFamily.alexandriaSemiBold,
      fontSize: fontSize.sm,
      lineHeight: lineHeight.sm,
      color: theme.text,
      textAlign: 'right',
    },
    itemBody: {
      fontFamily: fontFamily.alexandria,
      fontSize: fontSize.xs,
      lineHeight: lineHeight.xs,
      color: theme.textSecondary,
      textAlign: 'right',
    },
    itemTime: {
      fontFamily: fontFamily.alexandriaLight,
      fontSize: fontSize['2xs'],
      lineHeight: lineHeight['2xs'],
      color: theme.textMuted,
      textAlign: 'right',
    },

    // ── Clear-all action ───────────────────────────────────────────
    clearBtn: {
      alignSelf: 'center',
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.lg,
    },
    clearText: {
      fontFamily: fontFamily.alexandriaMedium,
      fontSize: fontSize.sm,
      lineHeight: lineHeight.sm,
      color: theme.error,
      textAlign: 'center',
    },

    // ── Empty state ────────────────────────────────────────────────
    empty: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      paddingHorizontal: spacing.xxl,
      paddingVertical: 64,
    },
    emptyTitle: {
      fontFamily: fontFamily.alexandriaSemiBold,
      fontSize: fontSize.md,
      lineHeight: lineHeight.md,
      color: theme.textSecondary,
      textAlign: 'center',
    },
    emptyDesc: {
      fontFamily: fontFamily.alexandriaLight,
      fontSize: 13,
      lineHeight: lineHeight.sm,
      color: theme.textMuted,
      textAlign: 'center',
    },
  });
