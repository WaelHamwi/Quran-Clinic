import { StyleSheet } from 'react-native';
import { palette, type Theme } from '@/theme/colors';
import { spacing, radius } from '@/theme/spacing';
import { fontFamily, fontSize, lineHeight } from '@/theme/typography';

export const createStyles = (theme: Theme) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: theme.background },
    safe: { flex: 1, alignItems: 'center' },

    illoBlock: { width: 309, height: 294, marginTop: 20, position: 'relative' },
    bgVector: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: 309,
      height: 294,
    },
    illoImageWrap: { position: 'absolute', width: 203, height: 242, left: 53.32, top: 52 },
    illoImage: { width: '100%', height: '100%' },

    bottom: {
      width: '100%',
      marginTop: 50,
      paddingHorizontal: 30,
      gap: 34,
      alignItems: 'center',
    },

    dots: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.sm },
    dot: {
      height: 8,
      borderRadius: 4,
      overflow: 'hidden',
      backgroundColor: theme.brandSubtleBorder,
    },
    // Anchored right: dots progress right-to-left (RTL order), so the fill grows the same way.
    // palette ref is intentional — the active-dot green is a fixed brand accent in both modes.
    dotFill: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      right: 0,
      borderRadius: 4,
      backgroundColor: palette.secondaryGreen[300],
    },

    textBlock: { width: '100%', alignItems: 'center' },
    titleText: {
      fontFamily: fontFamily.alexandriaMedium,
      fontSize: fontSize.lg,
      lineHeight: lineHeight.lg,
      color: theme.primary,
      textAlign: 'center',
    },
    verseBlock: { width: '100%', alignItems: 'center', gap: spacing.xs },
    refText: {
      fontFamily: fontFamily.alexandriaLight,
      fontSize: fontSize.sm,
      lineHeight: lineHeight.sm,
      color: theme.textMuted,
      textAlign: 'center',
    },
    bodyText: {
      fontFamily: fontFamily.alexandriaLight,
      fontSize: fontSize.sm,
      lineHeight: 22,
      color: theme.text,
      textAlign: 'center',
      marginTop: spacing.sm,
    },
    checklist: { width: '100%', gap: spacing.md, alignItems: 'stretch' },
    checkRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: spacing.sm,
    },
    tick: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
    privacyBlock: { width: '100%', gap: 10, alignItems: 'center' },

    cta: {
      width: 330,
      height: 40,
      borderRadius: radius.pill,
      backgroundColor: theme.primary,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      alignItems: 'center',
      justifyContent: 'center',
    },
    ctaText: {
      fontFamily: fontFamily.alexandria,
      fontSize: fontSize.sm,
      lineHeight: lineHeight.sm,
      color: theme.textOnBrand,
      textAlign: 'center',
    },
    pressed: { opacity: 0.85 },
  });
