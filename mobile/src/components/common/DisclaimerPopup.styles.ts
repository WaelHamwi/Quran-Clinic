import { StyleSheet } from 'react-native';
import { palette, type Theme } from '@/theme/colors';
import { spacing, radius } from '@/theme/spacing';
import { fontSize, lineHeight, fontFamily } from '@/theme/typography';

/** Disclaimer popup — Figma node 17941:728 (pixel-perfect):
 *  card surface, radius-top 24, shadow-lg, gap-24; title secondaryGreen[600];
 *  CTA brand pill with onBrand text. */
export const createStyles = (theme: Theme) =>
  StyleSheet.create({
    overlay: { flex: 1, justifyContent: 'flex-end' },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      // Modal scrim — intentional fixed translucent black, not a theme surface.
      backgroundColor: 'rgba(0,0,0,0.45)',
    },
    card: {
      backgroundColor: theme.card,
      borderTopLeftRadius: radius.lg,
      borderTopRightRadius: radius.lg,
      paddingTop: spacing.md,
      paddingBottom: 36,
      paddingHorizontal: spacing.xl,
      gap: spacing.xl,
      alignItems: 'center',
      shadowColor: palette.shadow,
      shadowOpacity: 0.08,
      shadowOffset: { width: 0, height: 8 },
      shadowRadius: 16,
      elevation: 8,
    },
    handle: {
      width: 100,
      height: 4,
      borderRadius: radius.sm,
      backgroundColor: theme.cardBorder,
    },
    content: { width: '100%', gap: spacing.lg, alignItems: 'center' },
    illustration: { width: 160, height: 160, position: 'relative' },
    illoIcon: {
      position: 'absolute',
      top: '20%',
      left: '20%',
      right: '20%',
      bottom: '20%',
    },
    title: {
      fontFamily: fontFamily.madani,
      fontSize: fontSize.xl,
      lineHeight: lineHeight.xl,
      color: theme.success,
      textAlign: 'center',
    },
    body: {
      fontFamily: fontFamily.alexandriaLight,
      fontSize: fontSize.sm,
      lineHeight: lineHeight.sm,
      color: theme.text,
      textAlign: 'right',
      width: '100%',
    },
    cta: {
      width: '100%',
      height: 40,
      borderRadius: radius.pill,
      backgroundColor: theme.primary,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xs,
    },
    pressed: { opacity: 0.85 },
    ctaText: {
      fontFamily: fontFamily.alexandria,
      fontSize: fontSize.sm,
      lineHeight: lineHeight.sm,
      color: theme.textOnBrand,
      textAlign: 'center',
    },
    ctaIcon: { width: 16, height: 16, alignItems: 'center', justifyContent: 'center' },
  });
