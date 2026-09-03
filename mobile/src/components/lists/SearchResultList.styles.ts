import { StyleSheet } from 'react-native';
import type { Theme } from '@/theme/colors';
import { fontFamily, fontSize, lineHeight } from '@/theme/typography';
import { radius, spacing } from '@/theme/spacing';

export const createStyles = (theme: Theme) =>
  StyleSheet.create({
    content: { padding: spacing.lg, gap: spacing.sm },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      backgroundColor: theme.card,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: theme.cardBorder,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
    },
    'row--rtl': { flexDirection: 'row-reverse' },
    'row--pressed': { opacity: 0.85 },
    iconBubble: {
      width: 44,
      height: 44,
      borderRadius: radius.sm,
      backgroundColor: theme.brandSubtle,
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconImage: { width: 28, height: 28 },
    texts: { flex: 1, gap: 2 },
    name: {
      fontFamily: fontFamily.alexandriaMedium,
      fontSize: fontSize.sm,
      lineHeight: lineHeight.sm,
      color: theme.text,
    },
    'name--rtl': { textAlign: 'right' },
    kind: {
      fontFamily: fontFamily.alexandriaLight,
      fontSize: fontSize.xs,
      lineHeight: lineHeight.xs,
      color: theme.textMuted,
    },
    'kind--rtl': { textAlign: 'right' },
  });
