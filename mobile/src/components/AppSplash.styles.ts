import { StyleSheet } from 'react-native';
import { palette, type Theme } from '@/theme/colors';
import { spacing, radius } from '@/theme/spacing';
import { fontFamily, fontSize, lineHeight } from '@/theme/typography';

export const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.background,
    },

    // ── Language picker button ────────────────────────────────────────────────
    langPicker: {
      position: 'absolute',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 70,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      shadowColor: palette.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
      zIndex: 5,
    },
    langPickerPressed: { opacity: 0.75 },
    langText: {
      fontFamily: fontFamily.alexandriaMedium,
      fontSize: fontSize.sm,
      lineHeight: lineHeight.sm,
      color: theme.text,
    },

    // ── Dropdown backdrop — full-screen, closes menu on tap ──────────────────
    langMenuBackdrop: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 10,
    },

    // ── Dropdown card ─────────────────────────────────────────────────────────
    langMenu: {
      position: 'absolute',
      backgroundColor: theme.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.cardBorder,
      minWidth: 148,
      zIndex: 20,
      shadowColor: palette.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 12,
      elevation: 8,
      overflow: 'hidden',
    },
    langOption: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingVertical: 13,
    },
    langOptionActive: {
      backgroundColor: theme.brandSubtle,
    },
    langOptionText: {
      fontFamily: fontFamily.alexandriaMedium,
      fontSize: fontSize.sm,
      lineHeight: lineHeight.sm,
      color: theme.textSecondary,
    },
    langOptionTextActive: {
      color: theme.primary,
    },
    langOptionDivider: {
      height: 1,
      backgroundColor: theme.divider,
      marginHorizontal: spacing.md,
    },

    // ── Center content — logo block + subtitle ────────────────────────────────
    content: {
      alignItems: 'center',
    },

    // 240×320 logo container with 3 absolutely-positioned SVGs inside
    logoBlock: {
      width: 240,
      height: 320,
      marginBottom: -10,
    },
    logoTopWrap: {
      position: 'absolute',
      top: 51,
      left: 61,
      right: 60,
      bottom: 142,
    },
    logoMidWrap: {
      position: 'absolute',
      top: 197,
      left: 56,
      right: 57,
      bottom: 98,
    },
    logoBottomWrap: {
      position: 'absolute',
      top: 233,
      left: 57,
      right: 57,
      bottom: 51,
    },

    title: {
      fontFamily: fontFamily.alexandriaMedium,
      fontSize: fontSize.lg,
      lineHeight: lineHeight.lg,
      color: theme.primary,
      textAlign: 'center',
    },

    // ── CTA button — absolute bottom ─────────────────────────────────────────
    cta: {
      position: 'absolute',
      bottom: 40,
      width: 330,
      height: 40,
      borderRadius: radius.pill,
      backgroundColor: theme.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    ctaPressed: { opacity: 0.85 },
    ctaText: {
      fontFamily: fontFamily.alexandria,
      fontSize: fontSize.sm,
      lineHeight: lineHeight.sm,
      color: theme.textOnBrand,
      textAlign: 'center',
    },
  });
