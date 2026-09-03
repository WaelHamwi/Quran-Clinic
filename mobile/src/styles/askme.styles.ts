import { StyleSheet } from 'react-native';
import { palette, type Theme } from '@/theme/colors';
import { spacing, radius } from '@/theme/spacing';
import { fontFamily, fontSize, lineHeight } from '@/theme/typography';

// Message drop-shadow — component-specific tint (CLAUDE.md rule 4).
const MSG_SHADOW = {
  shadowColor: palette.black,
  shadowOpacity: 0.05,
  shadowOffset: { width: 0, height: 1 },
  shadowRadius: 1,
  elevation: 1,
} as const;

export const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: { flex: 1 },
    flex: { flex: 1 },

    header: {
      backgroundColor: theme.overlayBg,
      borderBottomWidth: 1,
      borderBottomColor: theme.divider,
      shadowColor: palette.shadow,
      shadowOpacity: 0.08,
      shadowOffset: { width: 0, height: 16 },
      shadowRadius: 16,
    },
    headerInner: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
    },
    headerSide: { width: 20 },
    headerBtn: {
      width: 20,
      height: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitle: {
      flex: 1,
      textAlign: 'center',
      fontSize: fontSize.md,
      lineHeight: lineHeight.md,
      color: theme.textSecondary,
      fontFamily: fontFamily.alexandria,
    },

    list: {
      paddingTop: 20,
      paddingBottom: 20,
      gap: spacing.lg,
    },

    dateBadge: {
      alignSelf: 'center',
      backgroundColor: theme.card,
      borderRadius: 37,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.xs,
      ...MSG_SHADOW,
    },
    dateBadgeText: {
      fontSize: fontSize.xs,
      lineHeight: lineHeight.xs,
      color: theme.text,
      fontFamily: fontFamily.alexandriaLight,
      textAlign: 'center',
    },

    aiRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      paddingHorizontal: 20,
      gap: spacing.md,
    },
    // AI avatar — mint brand tints, decorative (palette refs).
    aiAvatar: {
      width: 32,
      height: 32,
      borderRadius: radius.pill,
      backgroundColor: palette.mint[100],
      borderWidth: 1,
      borderColor: palette.mint[200],
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    aiBubble: {
      flex: 1,
      backgroundColor: theme.card,
      borderRadius: 12,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      gap: spacing.xs,
      ...MSG_SHADOW,
    },
    aiBubbleText: {
      fontSize: fontSize.sm,
      lineHeight: lineHeight.sm,
      color: theme.text,
      fontFamily: fontFamily.alexandriaLight,
      writingDirection: 'rtl',
      textAlign: 'right',
    },
    aiTimestamp: {
      fontSize: fontSize['2xs'],
      lineHeight: lineHeight['2xs'],
      color: theme.textMuted,
      fontFamily: fontFamily.alexandria,
      textAlign: 'right',
    },

    userRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      paddingHorizontal: 20,
      gap: spacing.md,
    },
    userBubble: {
      flex: 1,
      backgroundColor: theme.primary,
      borderRadius: 12,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      gap: spacing.xs,
      ...MSG_SHADOW,
    },
    userBubbleText: {
      fontSize: fontSize.sm,
      lineHeight: lineHeight.sm,
      color: theme.textOnBrand,
      fontFamily: fontFamily.alexandriaLight,
      writingDirection: 'rtl',
      textAlign: 'right',
    },
    userTimestamp: {
      fontSize: fontSize['2xs'],
      lineHeight: lineHeight['2xs'],
      color: theme.onBrandMuted,
      fontFamily: fontFamily.alexandria,
      textAlign: 'right',
    },
    userAvatar: {
      width: 32,
      height: 32,
      borderRadius: radius.pill,
      backgroundColor: theme.primary,
      borderWidth: 1,
      borderColor: palette.brand[100],
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },

    thinking: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingHorizontal: 20,
      paddingBottom: spacing.sm,
    },
    thinkingText: {
      fontSize: fontSize.xs,
      lineHeight: lineHeight.xs,
      color: theme.textMuted,
      fontFamily: fontFamily.alexandriaLight,
    },

    inputArea: {
      backgroundColor: theme.card,
      borderTopWidth: 1,
      borderTopColor: theme.cardBorder,
      paddingTop: 20,
      gap: 20,
    },

    chipsContent: {
      flexDirection: 'row',
      gap: spacing.sm,
      paddingHorizontal: 20,
      paddingRight: spacing.xs,
    },
    chip: {
      backgroundColor: theme.brandSubtle,
      borderRadius: radius.lg,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      flexShrink: 0,
    },
    chipText: {
      fontSize: fontSize.xs,
      lineHeight: lineHeight.xs,
      color: theme.primary,
      fontFamily: fontFamily.alexandria,
      textAlign: 'center',
    },

    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingHorizontal: 20,
    },
    sendBtn: {
      width: 48,
      height: 48,
      borderRadius: radius.pill,
      backgroundColor: theme.primary,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    sendBtnDisabled: { opacity: 0.5 },
    inputField: {
      flex: 1,
      height: 48,
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: radius.pill,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      fontSize: fontSize.md,
      lineHeight: lineHeight.md,
      color: theme.text,
      fontFamily: fontFamily.alexandriaLight,
      textAlignVertical: 'center',
    },

    actionsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
      marginTop: spacing.sm,
      paddingTop: spacing.sm,
      borderTopWidth: 1,
      borderTopColor: theme.divider,
    },
    actionBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.brandSubtle,
      borderWidth: 1,
      borderColor: theme.brandSubtleBorder,
      borderRadius: radius.lg,
      paddingHorizontal: 10,
      paddingVertical: 5,
      gap: spacing.xs,
    },
    actionBtnText: {
      fontSize: 11,
      lineHeight: lineHeight['2xs'],
      color: theme.primary,
      fontFamily: fontFamily.alexandria,
    },
  });
