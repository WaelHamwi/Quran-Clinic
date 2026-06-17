import { StyleSheet } from 'react-native';
import { palette } from '@/theme/colors';
import type { Theme } from '@/theme/colors';
import { fontFamily, fontSize, fontWeight } from '@/theme/typography';

export const ICON_FOREGROUND = palette.text.secondary;

export function createHeaderStyles(theme: Theme) {
  return StyleSheet.create({
    'header--homepage': {
      // No fixed height: the Screen already adds the status-bar inset, so the bar sizes
      // to its row (~44, same as the login bar). The old height:88 was the Figma figure
      // that *includes* the status bar, which double-counted the inset and left ~44px of
      // empty space above the greeting.
      backgroundColor: palette.bg.overlay,
      borderBottomWidth: 1,
      borderBottomColor: palette.border.tertiary,
      shadowColor: palette.shadow,
      shadowOpacity: 0.08,
      shadowOffset: { width: 0, height: 16 },
      shadowRadius: 16,
      elevation: 4,
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
