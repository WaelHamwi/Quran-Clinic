import { StyleSheet } from 'react-native';
import type { Theme } from '@/theme/colors';
import { fontFamily, fontSize, lineHeight } from '@/theme/typography';
import { spacing, radius } from '@/theme/spacing';

export const createStyles = (theme: Theme) =>
  StyleSheet.create({
    flex: {
      flex: 1,
    },
    content: {
      padding: spacing.lg,
      gap: spacing.lg,
      paddingBottom: 40,
    },
    sectionTitle: {
      fontFamily: fontFamily.alexandriaSemiBold,
      fontSize: fontSize.sm,
      lineHeight: lineHeight.sm,
      color: theme.textSecondary,
      textAlign: 'right',
    },
    group: {
      backgroundColor: theme.card,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: theme.cardBorder,
      paddingHorizontal: spacing.md,
    },
    separator: {
      height: 1,
      backgroundColor: theme.cardBorder,
    },

    // ── Smart waking card (Figma 18524:2887) ───────────────────────
    smartCard: {
      backgroundColor: theme.card,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: theme.cardBorder,
      padding: spacing.md,
      gap: 14,
    },
    smartHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.lg,
    },
    smartTexts: {
      flex: 1,
      gap: 2,
      alignItems: 'flex-end',
    },
    smartTitle: {
      fontFamily: fontFamily.alexandriaMedium,
      fontSize: fontSize.sm,
      lineHeight: lineHeight.sm,
      color: theme.textSecondary,
      textAlign: 'right',
    },
    smartSubtitle: {
      fontFamily: fontFamily.alexandriaLight,
      fontSize: fontSize['2xs'],
      lineHeight: lineHeight['2xs'],
      color: theme.textMuted,
      textAlign: 'right',
    },

    motionHint: {
      fontFamily: fontFamily.alexandriaLight,
      fontSize: fontSize['2xs'],
      lineHeight: lineHeight['2xs'],
      color: theme.textMuted,
      textAlign: 'right',
    },

    // ── Manual / Automatic mode selector ───────────────────────────
    modeRow: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    modePill: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: radius.pill,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.card,
    },
    modePillActive: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
    },
    modePillText: {
      fontFamily: fontFamily.alexandriaMedium,
      fontSize: fontSize.sm,
      lineHeight: lineHeight.sm,
      color: theme.textSecondary,
    },
    modePillTextActive: {
      color: theme.textOnBrand,
      fontFamily: fontFamily.alexandriaSemiBold,
    },

    // ── Time fields (Figma RTL Input Field/Text) ───────────────────
    timesRow: {
      flexDirection: 'row',
      gap: 14,
    },
    timeField: {
      flex: 1,
      gap: 6,
      alignItems: 'flex-end',
    },
    timeLabel: {
      fontFamily: fontFamily.alexandria,
      fontSize: fontSize.sm,
      lineHeight: lineHeight.sm,
      color: theme.textSecondary,
      textAlign: 'right',
    },
    timeInput: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: 40,
      width: '100%',
      paddingHorizontal: spacing.md,
      borderRadius: radius.pill,
      borderWidth: 1,
      borderColor: theme.cardBorder,
      backgroundColor: theme.card,
    },
    timeInputDisabled: {
      backgroundColor: theme.fieldBg,
    },
    timeInputContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    timeInputText: {
      fontFamily: fontFamily.alexandriaLight,
      fontSize: fontSize.sm,
      lineHeight: lineHeight.sm,
      color: theme.text,
    },
    timeInputEditable: {
      minWidth: 48,
      padding: 0,
      textAlign: 'center',
    },
    delayField: {
      gap: 6,
      alignItems: 'flex-end',
    },
    subDivider: {
      height: 1,
      backgroundColor: theme.cardBorder,
      marginVertical: spacing.xs,
    },
    // ── Ringtone picker ────────────────────────────────────────────
    ringtoneList: {
      gap: spacing.xs,
    },
    ringtoneRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.sm,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: theme.cardBorder,
      backgroundColor: theme.card,
    },
    ringtoneRowActive: {
      borderColor: theme.primary,
      backgroundColor: theme.brandSubtle,
    },
    ringtoneLabel: {
      flex: 1,
      fontFamily: fontFamily.alexandriaMedium,
      fontSize: fontSize.sm,
      lineHeight: lineHeight.sm,
      color: theme.textSecondary,
      textAlign: 'right',
    },
    ringtoneLabelActive: {
      color: theme.primary,
      fontFamily: fontFamily.alexandriaSemiBold,
    },
    previewBtn: {
      width: 32,
      height: 32,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.pill,
    },
    settingsBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: radius.pill,
      borderWidth: 1,
      borderColor: theme.primary,
    },
    settingsBtnText: {
      fontFamily: fontFamily.alexandriaMedium,
      fontSize: fontSize.sm,
      lineHeight: lineHeight.sm,
      color: theme.primary,
    },
    stepBtn: {
      width: 24,
      height: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },

    autoHint: {
      fontFamily: fontFamily.alexandriaLight,
      fontSize: fontSize['2xs'],
      lineHeight: lineHeight['2xs'],
      color: theme.textMuted,
      textAlign: 'right',
    },
    permissionHint: {
      fontFamily: fontFamily.alexandriaLight,
      fontSize: fontSize.xs,
      lineHeight: lineHeight.xs,
      color: theme.textMuted,
      textAlign: 'center',
    },
  });
