import { StyleSheet } from 'react-native';
import type { Theme } from '@/theme/colors';
import { spacing, radius } from '@/theme/spacing';
import { fontFamily, fontSize, lineHeight } from '@/theme/typography';

// Dev-only "Clear Cache" debug button palette (never shipped to users in release
// builds — gated behind __DEV__). Intentionally a fixed dark-red debug tone, not
// part of the design system.
const DEV_BTN_BG = '#1c0a0a';
const DEV_BTN_BORDER = '#7f1d1d';
const DEV_BTN_TEXT = '#fca5a5';

export const createStyles = (theme: Theme) =>
  StyleSheet.create({
    homeScreen__headerWrap: { gap: spacing.lg, paddingTop: 20 },
    homeScreen__gridHeader: { gap: spacing.lg },
    homeScreen__pillsBleed: { marginHorizontal: -spacing.lg },
    homeScreen__devSection: { marginTop: spacing.md, gap: 6 },
    homeScreen__devLabel: {
      fontFamily: fontFamily.alexandriaBold,
      fontSize: fontSize['2xs'],
      lineHeight: lineHeight['2xs'],
      color: theme.error,
      letterSpacing: 1.4,
      textTransform: 'uppercase',
    },
    homeScreen__devClearBtn: {
      backgroundColor: DEV_BTN_BG,
      borderRadius: radius.sm,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: DEV_BTN_BORDER,
    },
    'homeScreen__devClearBtn--disabled': { opacity: 0.5 },
    homeScreen__devClearBtnText: {
      color: DEV_BTN_TEXT,
      fontFamily: fontFamily.alexandriaBold,
      fontSize: fontSize.xs,
      lineHeight: lineHeight.xs,
    },
  });
