import { StyleSheet } from 'react-native';
import type { Theme } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { fontSize, fontFamily, lineHeight } from '@/theme/typography';

/** Generic settings / navigation row — Figma More-page section row (18097:1644).
 *  Icon bubble uses the subtle brand tint; danger variant swaps to error tones. */
export const createStyles = (theme: Theme) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      paddingVertical: spacing.md,
    },
    pressed: { opacity: 0.6 },
    iconWrap: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: theme.brandSubtle,
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconWrapDanger: { backgroundColor: theme.card },
    texts: { flex: 1, gap: 2 },
    label: {
      fontSize: fontSize.sm,
      lineHeight: lineHeight.sm,
      fontFamily: fontFamily.alexandriaMedium,
      color: theme.text,
    },
    description: {
      fontSize: fontSize.xs,
      lineHeight: lineHeight.xs,
      fontFamily: fontFamily.alexandriaLight,
      color: theme.textMuted,
    },
    rowRtl: { flexDirection: 'row-reverse' },
    textRtl: { textAlign: 'right' },
  });
