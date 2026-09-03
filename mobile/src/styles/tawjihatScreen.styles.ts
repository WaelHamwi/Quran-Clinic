import { StyleSheet } from 'react-native';
import type { Theme } from '@/theme/colors';
import { spacing, radius } from '@/theme/spacing';
import { fontFamily, fontSize, lineHeight } from '@/theme/typography';

export const createStyles = (theme: Theme) =>
  StyleSheet.create({
    listContent: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
      paddingBottom: spacing.xl,
      gap: spacing.sm,
      flexGrow: 1,
    },
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
    },
    'card--pressed': { opacity: 0.85 },
    cardRight: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      justifyContent: 'flex-end',
    },
    cardTitle: {
      flex: 1,
      fontFamily: fontFamily.alexandria,
      fontSize: fontSize.sm,
      lineHeight: lineHeight.sm,
      color: theme.primary,
      textAlign: 'right',
    },
    iconTile: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.brandSubtle,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
