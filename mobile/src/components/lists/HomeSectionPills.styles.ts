import { StyleSheet } from 'react-native';
import type { Theme } from '@/theme/colors';
import { spacing, radius } from '@/theme/spacing';
import { fontFamily, fontSize, lineHeight } from '@/theme/typography';

export const createStyles = (theme: Theme) =>
  StyleSheet.create({
    homeSectionPills__scroll: { width: '100%' },
    'homeSectionPills__row--ar': {
      flexDirection: 'row-reverse',
      alignItems: 'center',
      gap: spacing.md,
      paddingHorizontal: spacing.lg,
    },
    'homeSectionPills__row--en': {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      paddingHorizontal: spacing.lg,
    },
    homeSectionPills__pill: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: radius.sm,
      borderWidth: 1,
      overflow: 'hidden',
    },
    'homeSectionPills__pill--rtl': {
      flexDirection: 'row-reverse',
    },
    'homeSectionPills__pill--inactive': {
      backgroundColor: theme.card,
      borderColor: theme.cardBorder,
    },
    'homeSectionPills__pill--active': {
      backgroundColor: theme.primary,
      borderColor: theme.cardBorder,
    },
    'homeSectionPills__pill--pressed': { opacity: 0.85 },
    homeSectionPills__label: {
      fontFamily: fontFamily.alexandria,
      fontSize: fontSize.xs,
      lineHeight: lineHeight.xs,
    },
  });
