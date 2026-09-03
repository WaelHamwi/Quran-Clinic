import { StyleSheet } from 'react-native';
import type { Theme } from '@/theme/colors';
import { spacing, radius } from '@/theme/spacing';
import { fontFamily, fontSize, lineHeight } from '@/theme/typography';

export const createStyles = (theme: Theme) =>
  StyleSheet.create({
    generalRuqyah: {
      gap: spacing.sm,
    },
    // Figma node 18170:2193 "Section Card" — padding 14, icon 48 in 2px wrap.
    generalRuqyahBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.success,
      borderWidth: 1,
      borderColor: theme.cardBorder,
      padding: 14,
      overflow: 'hidden',
      borderTopLeftRadius: 100,
      borderBottomLeftRadius: 100,
      borderTopRightRadius: radius.md,
      borderBottomRightRadius: radius.md,
    },
    'generalRuqyahBtn--pressed': {
      opacity: 0.9,
    },
    generalRuqyahBtn__playWrap: {
      padding: 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    generalRuqyahBtn__texts: {
      flex: 1,
      justifyContent: 'center',
      gap: spacing.xs,
      paddingHorizontal: spacing.sm,
    },
    generalRuqyahBtn__title: {
      fontFamily: fontFamily.alexandriaMedium,
      fontSize: fontSize.md,
      lineHeight: lineHeight.md,
      color: theme.textOnBrand,
    },
    generalRuqyahBtn__subtitle: {
      fontFamily: fontFamily.alexandriaLight,
      fontSize: fontSize.sm,
      lineHeight: lineHeight.sm,
      color: theme.textOnBrand,
    },
    generalRuqyah__controls: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xl,
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.cardBorder,
      borderRadius: radius.md,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.lg,
    },
    // RTL is hand-authored app-wide (see utils/disableAutoRTL) — mirror the
    // transport order so "previous" sits on the right in Arabic.
    'generalRuqyah__controls--rtl': {
      flexDirection: 'row-reverse',
    },
    generalRuqyah__ctlBtn: {
      width: 40,
      height: 40,
      borderRadius: radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.brandSubtle,
    },
    'generalRuqyah__ctlBtn--pressed': {
      opacity: 0.7,
    },
    'generalRuqyah__ctlBtn--disabled': {
      backgroundColor: theme.fieldBg,
    },
    'generalRuqyah__ctlBtn--active': {
      backgroundColor: theme.primary,
    },
  });
