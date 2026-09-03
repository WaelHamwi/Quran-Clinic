import { StyleSheet } from 'react-native';
import { palette, type Theme } from '@/theme/colors';
import { spacing, radius } from '@/theme/spacing';
import { fontSize, lineHeight, fontFamily } from '@/theme/typography';

/** Language picker bottom sheet — Figma node 18272:3745. */
export const createStyles = (theme: Theme) =>
  StyleSheet.create({
    // Modal scrim — intentional fixed translucent black, not a theme surface.
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
    sheet: {
      backgroundColor: theme.card,
      borderTopWidth: 1,
      borderTopColor: theme.cardBorder,
      borderTopLeftRadius: radius.lg,
      borderTopRightRadius: radius.lg,
      paddingBottom: 70,
      gap: spacing.lg,
    },
    header: { padding: spacing.lg, alignItems: 'center' },
    handle: { width: 60, height: 4, borderRadius: radius.lg, backgroundColor: theme.cardBorder },
    body: { paddingHorizontal: spacing.lg, gap: spacing.lg, alignItems: 'stretch' },
    title: {
      fontFamily: fontFamily.alexandriaMedium,
      fontSize: fontSize.md,
      lineHeight: lineHeight.md,
      color: theme.text,
      textAlign: 'center',
    },
    options: { gap: spacing.lg, alignItems: 'stretch' },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 12,
      padding: spacing.md,
    },
    radio: {
      width: 24,
      height: 24,
      borderRadius: radius.pill,
      borderWidth: 2,
      borderColor: theme.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    radioActive: { borderColor: theme.primary },
    radioDot: {
      width: 12,
      height: 12,
      borderRadius: radius.pill,
      backgroundColor: theme.primary,
    },

    optRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    optText: {
      fontFamily: fontFamily.alexandriaLight,
      fontSize: fontSize.sm,
      lineHeight: lineHeight.sm,
      color: theme.text,
      textAlign: 'right',
    },
    flag: { width: 32, height: 24, overflow: 'hidden', borderRadius: radius.xs },
    flagSa: {
      width: 32,
      height: 24,
      backgroundColor: palette.flags.sa,
      alignItems: 'center',
      justifyContent: 'center',
    },
    flagSaText: { color: theme.textOnBrand, fontSize: 8, fontFamily: fontFamily.alexandriaBold },
    flagGb: {
      width: 32,
      height: 24,
      backgroundColor: palette.flags.gb,
      alignItems: 'center',
      justifyContent: 'center',
    },
    flagGbText: { color: theme.textOnBrand, fontSize: 8, fontFamily: fontFamily.alexandriaBold },
  });
