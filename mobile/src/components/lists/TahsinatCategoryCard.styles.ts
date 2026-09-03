import { StyleSheet } from 'react-native';
import type { Theme } from '@/theme/colors';
import { spacing, radius } from '@/theme/spacing';
import { fontFamily, fontSize, lineHeight } from '@/theme/typography';

export const createStyles = (theme: Theme) =>
  StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.card,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: theme.cardBorder,
      padding: spacing.md,
      gap: spacing.md,
      overflow: 'hidden',
    },
    'card--pressed': { opacity: 0.85 },
    right: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      justifyContent: 'flex-end',
    },
    texts: {
      flex: 1,
      gap: spacing.xs,
      alignItems: 'flex-end',
    },
    title: {
      fontFamily: fontFamily.alexandria,
      fontSize: fontSize.sm,
      lineHeight: lineHeight.sm,
      color: theme.primary,
      textAlign: 'right',
    },
    iconTile: {
      padding: spacing.md,
      borderRadius: radius.sm + radius.xs, // 12 — matches Figma tile
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconImage: {
      width: 32,
      height: 32,
    },
  });
