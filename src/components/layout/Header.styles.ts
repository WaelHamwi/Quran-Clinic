import { StyleSheet } from 'react-native';
import { palette } from '@/theme/colors';
import type { Theme } from '@/theme/colors';
import { fontFamily, fontSize, fontWeight } from '@/theme/typography';

export const ICON_FOREGROUND = palette.text.secondary;
// Unread/active-reminders dot on the header bell (Figma node 17941:2197).
export const BELL_DOT_COLOR = palette.system.error[500];

export function createHeaderStyles(theme: Theme) {
  return StyleSheet.create({
    'header--homepage': {
      // Bar owns the status-bar inset itself (paddingTop applied inline in Header.tsx)
      // so the patterned background bleeds up behind it and header + body read as one
      // piece. Figma "Shadows/xl" as a real CSS box-shadow is the only separator — it
      // renders a soft blurred drop shadow on BOTH iOS and Android (New Architecture).
      // Android `elevation` is intentionally NOT used: it won't cast a shadow under a
      // translucent background.
      backgroundColor: palette.bg.overlay,
      borderBottomWidth: 1,
      borderBottomColor: palette.border.tertiary,
      boxShadow: '0px 12px 16px -4px rgba(49,57,64,0.12)',
    },
    header__row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      gap: 8,
    },
    header__icon: {
      width: 20,
      height: 20,
    },
    header__bell: {
      width: 20,
      height: 20,
      position: 'relative',
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
      gap: 4,
    },
    header__greeting: {
      fontFamily: fontFamily.alexandria,
      fontSize: 14,
      lineHeight: 20,
      color: palette.text.secondary,
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
      paddingHorizontal: 16,
      paddingVertical: 12,
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
      lineHeight: 28,
      fontWeight: fontWeight.semibold,
      color: palette.text.primary,
      fontFamily: fontFamily.alexandriaSemiBold,
      textAlign: 'center',
    },
    header__subtitle: {
      fontSize: fontSize.xs,
      color: palette.text.secondary,
      marginTop: 2,
      fontFamily: fontFamily.alexandria,
    },
  });
}
