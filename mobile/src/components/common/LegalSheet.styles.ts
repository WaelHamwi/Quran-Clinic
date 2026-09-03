import { StyleSheet } from 'react-native';
import { palette, type Theme } from '@/theme/colors';
import { spacing, radius } from '@/theme/spacing';
import { fontSize, lineHeight, fontFamily } from '@/theme/typography';

export const createStyles = (theme: Theme) =>
  StyleSheet.create({
    overlay: { flex: 1, justifyContent: 'flex-end' },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      // Modal scrim — intentional fixed translucent black, not a theme surface.
      backgroundColor: 'rgba(0,0,0,0.45)',
    },
    card: {
      maxHeight: '85%',
      backgroundColor: theme.card,
      borderTopLeftRadius: radius.lg,
      borderTopRightRadius: radius.lg,
      paddingTop: spacing.md,
      paddingBottom: 36,
      paddingHorizontal: spacing.xl,
      gap: spacing.md,
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
    title: {
      fontFamily: fontFamily.madani,
      fontSize: fontSize.xl,
      lineHeight: lineHeight.xl,
      color: theme.primary,
      textAlign: 'center',
    },
    updated: {
      fontFamily: fontFamily.alexandriaLight,
      fontSize: fontSize.xs,
      lineHeight: lineHeight.xs,
      color: theme.textMuted,
      textAlign: 'center',
    },
    scroll: { width: '100%' },
    scrollContent: { gap: spacing.lg, paddingBottom: spacing.md },
    heading: {
      fontFamily: fontFamily.alexandriaSemiBold,
      fontSize: fontSize.sm,
      lineHeight: lineHeight.sm,
      color: theme.text,
      textAlign: 'left',
    },
    body: {
      fontFamily: fontFamily.alexandriaLight,
      fontSize: fontSize.xs,
      lineHeight: lineHeight.sm,
      color: theme.textSecondary,
      textAlign: 'left',
      marginTop: spacing.xs,
    },
    rtlText: { textAlign: 'right' },
    cta: {
      width: '100%',
      height: 40,
      borderRadius: radius.pill,
      backgroundColor: theme.primary,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      alignItems: 'center',
      justifyContent: 'center',
    },
    pressed: { opacity: 0.85 },
    ctaText: {
      fontFamily: fontFamily.alexandria,
      fontSize: fontSize.sm,
      lineHeight: lineHeight.sm,
      color: theme.textOnBrand,
      textAlign: 'center',
    },
  });
