import { StyleSheet } from 'react-native';
import type { Theme } from '@/theme/colors';
import { spacing, space, radius } from '@/theme/spacing';
import { fontFamily, lineHeight } from '@/theme/typography';

export const createStyles = (theme: Theme) =>
  StyleSheet.create({
    diseaseCard: {
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
      paddingBottom: spacing.md,
      gap: space.sm,
      overflow: 'hidden',
      minHeight: 120,
    },
    'diseaseCard--pressed': { opacity: 0.85 },
    diseaseCard__iconBubble: {
      backgroundColor: theme.brandSubtle,
      borderRadius: radius.sm + radius.xs,
      padding: spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    diseaseCard__iconImage: {
      width: 48,
      height: 48,
    },
    diseaseCard__name: {
      fontFamily: fontFamily.alexandriaMedium,
      fontSize: 13,
      lineHeight: lineHeight.xs,
      minHeight: 36,
      color: theme.primary,
      textAlign: 'center',
    },
  });
