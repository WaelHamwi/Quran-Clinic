import { StyleSheet } from 'react-native';
import type { Theme } from '@/theme/colors';
import { spacing, space, radius } from '@/theme/spacing';
import { fontFamily, fontSize, lineHeight } from '@/theme/typography';

export const createStyles = (theme: Theme) =>
  StyleSheet.create({
    tabBar: {
      backgroundColor: theme.tabHeaderBg,
    },
    tabBar__bar: {
      flexDirection: 'row',
      backgroundColor: theme.tabHeaderBg,
      paddingTop: spacing.sm,
      paddingHorizontal: spacing.xl,
      alignItems: 'stretch',
    },
    tabBar__tab: {
      flex: 1,
      flexDirection: 'column',
      flexShrink: 0,
      minWidth: 48,
      paddingHorizontal: spacing.xs,
      paddingVertical: space.sm,
      borderRadius: radius.sm,
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xs,
    },
    'tabBar__tab--active': {
      backgroundColor: theme.primaryDark,
    },
    tabBar__icon: {
      width: 20,
      height: 20,
    },
    tabBar__label: {
      fontFamily: fontFamily.alexandria,
      fontSize: fontSize['2xs'],
      lineHeight: lineHeight['2xs'],
      color: theme.onBrandMuted,
      textAlign: 'center',
      width: '100%',
    },
    'tabBar__label--active': {
      color: theme.textOnBrand,
    },
  });
