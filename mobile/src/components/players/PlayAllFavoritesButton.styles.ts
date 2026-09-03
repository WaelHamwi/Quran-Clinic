import { StyleSheet } from 'react-native';
import type { Theme } from '@/theme/colors';
import { spacing, radius } from '@/theme/spacing';
import { fontFamily, fontSize, lineHeight } from '@/theme/typography';

// Figma node 18284:3424 "RTL Button" — full-width brand pill, centred play
// icon + label, used as the Favorites "Play all" CTA.
export const createStyles = (theme: Theme) =>
  StyleSheet.create({
    playAllBtn: {
      // flexDirection is set inline from `isArabic` so the icon stays leading.
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xs,
      width: '100%',
      backgroundColor: theme.primary,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      borderRadius: radius.md,
    },
    'playAllBtn--pressed': { opacity: 0.9 },
    playAllBtn__label: {
      fontFamily: fontFamily.alexandria,
      fontSize: fontSize.sm,
      lineHeight: lineHeight.sm,
      color: theme.textOnBrand,
      textAlign: 'center',
    },
  });
