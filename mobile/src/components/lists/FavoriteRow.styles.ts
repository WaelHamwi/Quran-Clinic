import { StyleSheet } from 'react-native';
import { palette, type Theme } from '@/theme/colors';
import { spacing, radius } from '@/theme/spacing';
import { fontFamily, fontSize, lineHeight } from '@/theme/typography';

/** Footprint of the icon slot: the 32 fallback glyph plus the bubble's padding on
 *  both sides. Bare uploaded icons match it so every row lines up identically. */
export const ICON_BOX = 32 + spacing.sm * 2;

// Figma node 18284:3426 "Section Card" — a single favorited disease row.
export const createStyles = (theme: Theme) =>
  StyleSheet.create({
    row: {
      // flexDirection set inline from `isArabic`.
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.cardBorder,
      borderRadius: radius.md,
      padding: spacing.md,
      width: '100%',
      overflow: 'hidden',
    },
    'row--pressed': { opacity: 0.85 },
    // Figma 18284:3427 — the row being dragged lifts onto a brand-tinted card.
    'row--active': {
      backgroundColor: theme.brandSubtle,
      shadowColor: palette.shadow,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.18,
      shadowRadius: 16,
      elevation: 8,
    },
    row__handle: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    row__content: {
      alignItems: 'center',
      gap: spacing.sm,
      flexShrink: 1,
    },
    row__inner: {
      alignItems: 'center',
      gap: spacing.md,
      flexShrink: 1,
    },
    row__texts: {
      gap: spacing.xs,
      flexShrink: 1,
    },
    row__title: {
      fontFamily: fontFamily.alexandria,
      fontSize: fontSize.sm,
      lineHeight: lineHeight.sm,
      color: theme.primary,
    },
    row__subtitle: {
      fontFamily: fontFamily.alexandriaLight,
      fontSize: fontSize.xs,
      lineHeight: lineHeight.xs,
      color: theme.textMuted,
    },
    row__iconBubble: {
      backgroundColor: theme.brandSubtle,
      borderRadius: radius.sm + radius.xs,
      padding: spacing.sm,
      alignItems: 'center',
      justifyContent: 'center',
    },
    row__iconImage: { width: ICON_BOX, height: ICON_BOX },
  });
