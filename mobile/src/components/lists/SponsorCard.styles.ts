import { StyleSheet } from 'react-native';
import { palette, type Theme } from '@/theme/colors';
import { fontFamily, fontSize, lineHeight } from '@/theme/typography';
import { spacing, radius } from '@/theme/spacing';

/** Figma sponsor "Section Card" — node 18272:3445. RTL row: arrow / text / logo. */
export const createStyles = (theme: Theme) =>
  StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: radius.md,
      overflow: 'hidden',
    },
    cardRtl: { paddingLeft: 10 },
    cardLtr: { flexDirection: 'row-reverse', paddingRight: 10 },

    pressed: { opacity: 0.85 },

    arrowWrap: {
      width: 25.456,
      height: 25.456,
      alignItems: 'center',
      justifyContent: 'center',
    },
    arrowRtl: { transform: [{ rotate: '-45deg' }] },
    arrowLtr: { transform: [{ rotate: '45deg' }] },

    group: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    groupLtr: { flexDirection: 'row-reverse' },

    texts: { gap: 2 },
    textsRtl: { alignItems: 'flex-end' },
    textsLtr: { alignItems: 'flex-start' },

    name: {
      fontFamily: fontFamily.alexandria,
      fontSize: fontSize.sm,
      lineHeight: lineHeight.sm,
      color: theme.primary,
    },
    tier: {
      fontFamily: fontFamily.alexandriaLight,
      fontSize: fontSize.xs,
      lineHeight: lineHeight.xs,
      color: theme.textMuted,
    },

    logoBox: {
      width: 60,
      height: 68,
      // Sponsor logos render best on a light surface, so this box stays light
      // in both themes (palette ref, not a theme surface).
      backgroundColor: palette.gray[50],
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    logoImg: { width: '63.33%', height: '78.12%' },
  });
