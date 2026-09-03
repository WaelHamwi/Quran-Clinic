import { StyleSheet } from 'react-native';
import { palette, type Theme } from '@/theme/colors';
import { spacing, radius } from '@/theme/spacing';
import { fontSize, fontFamily, lineHeight } from '@/theme/typography';

export const createStyles = (theme: Theme) =>
  StyleSheet.create({
    categoryCard: {
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
    'categoryCard--pressed': {
      opacity: 0.85,
    },
    categoryCard__right: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      justifyContent: 'flex-end',
    },
    categoryCard__texts: {
      flex: 1,
      gap: spacing.xs,
      alignItems: 'flex-end',
    },
    categoryCard__name: {
      fontFamily: fontFamily.alexandria,
      fontSize: fontSize.sm,
      lineHeight: lineHeight.sm,
      color: theme.primary,
      textAlign: 'right',
    },
    categoryCard__desc: {
      fontFamily: fontFamily.alexandriaLight,
      fontSize: fontSize.xs,
      lineHeight: lineHeight.xs,
      color: theme.textMuted,
      textAlign: 'right',
    },
    categoryCard__iconTile: {
      padding: spacing.md,
      borderRadius: radius.sm + radius.xs, // 12 — between sm(8) and md(16), matches Figma tile
      alignItems: 'center',
      justifyContent: 'center',
    },
    // Uploaded icons render bare (no tile) at the fallback tile's footprint: 32 + md padding both sides.
    categoryCard__iconImage: {
      width: 56,
      height: 56,
    },
  });

export const FALLBACK_COLORS = palette.tileFallback;

export function colorForId(id: number): string {
  const i = ((id % FALLBACK_COLORS.length) + FALLBACK_COLORS.length) % FALLBACK_COLORS.length;
  return FALLBACK_COLORS[i];
}
