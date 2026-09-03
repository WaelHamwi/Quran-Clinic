import { StyleSheet } from 'react-native';
import type { Theme } from '@/theme/colors';
import { spacing, radius } from '@/theme/spacing';
import { fontFamily, fontSize, lineHeight } from '@/theme/typography';

export const createStyles = (theme: Theme) =>
  StyleSheet.create({
    subcategoryCard: {
      flex: 1,
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-end',
      backgroundColor: theme.card,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: theme.cardBorder,
      paddingTop: spacing.lg,
      paddingHorizontal: spacing.sm,
      paddingBottom: spacing.sm,
      gap: spacing.xs,
      overflow: 'hidden',
    },
    'subcategoryCard--pressed': { opacity: 0.85 },
    subcategoryCard__iconBubble: {
      backgroundColor: theme.brandSubtle,
      borderRadius: radius.sm + radius.xs,
      padding: spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    subcategoryCard__iconImage: {
      width: 48,
      height: 48,
    },
    subcategoryCard__name: {
      fontFamily: fontFamily.alexandria,
      fontSize: fontSize.sm,
      lineHeight: lineHeight.sm,
      minHeight: 36,
      color: theme.primary,
      textAlign: 'center',
    },
  });
