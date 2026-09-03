import { StyleSheet } from 'react-native';
import type { Theme } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { fontFamily, fontSize, fontWeight, lineHeight } from '@/theme/typography';

export const createStyles = (theme: Theme) =>
  StyleSheet.create({
    'header--homepage': {
      // Bar owns the status-bar inset itself (paddingTop applied inline in Header.tsx)
      // so the patterned background bleeds up behind it and header + body read as one
      // piece. Figma "Shadows/xl" as a real CSS box-shadow is the only separator — it
      // renders a soft blurred drop shadow on BOTH iOS and Android (New Architecture).
      // Android `elevation` is intentionally NOT used: it won't cast a shadow under a
      // translucent background.
      backgroundColor: theme.overlayBg,
      borderBottomWidth: 1,
      borderBottomColor: theme.divider,
      boxShadow: '0px 12px 16px -4px rgba(49,57,64,0.12)',
    },
    header__row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      gap: spacing.sm,
    },
    header__icon: {
      width: 20,
      height: 20,
    },
    header__bell: {
      width: 20,
      height: 20,
      position: 'relative',
      // Extra breathing room between the search and bell icons on top of the row gap.
      marginStart: spacing.sm,
    },
    // Dot anchored to the bell's top-right, sized 25% of the 20px icon (Figma insets).
    header__bellDot: {
      position: 'absolute',
      top: 1.5,
      right: 3,
      width: 5,
      height: 5,
    },
    header__greetingGroup: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: spacing.xs,
    },
    header__greeting: {
      fontFamily: fontFamily.alexandria,
      fontSize: fontSize.sm,
      lineHeight: lineHeight.sm,
      color: theme.textSecondary,
      textAlign: 'right',
    },
    header__userIcon: {
      width: 20,
      height: 20,
    },
    header__userIconInner: {
      position: 'absolute',
      top: '16.67%' as unknown as number,
      left: '16.67%' as unknown as number,
      right: '16.67%' as unknown as number,
      bottom: '16.67%' as unknown as number,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      backgroundColor: theme.background,
    },
    'header--rtl': {
      flexDirection: 'row-reverse',
    },
    header__side: {
      minWidth: 32,
      justifyContent: 'center',
    },
    'header__side--right': {
      alignItems: 'flex-end',
    },
    header__titleWrap: {
      flex: 1,
      alignItems: 'center',
    },
    header__title: {
      fontSize: fontSize.lg,
      lineHeight: lineHeight.lg,
      fontWeight: fontWeight.semibold,
      color: theme.text,
      fontFamily: fontFamily.alexandriaSemiBold,
      textAlign: 'center',
    },
    header__subtitle: {
      fontSize: fontSize.xs,
      color: theme.textSecondary,
      marginTop: 2,
      fontFamily: fontFamily.alexandria,
    },
  });
