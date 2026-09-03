import { StyleSheet } from 'react-native';
import type { Theme } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { fontFamily, fontSize, lineHeight } from '@/theme/typography';

/** Figma "Status & Nav bar" — node 18481-2823. */
export const createStyles = (theme: Theme) =>
  StyleSheet.create({
    // Figma "Shadows/xl" as a real CSS box-shadow — renders a soft blurred drop
    // shadow on BOTH iOS and Android (New Architecture). The header blends into the
    // patterned body as one piece; this shadow is the only thing distinguishing it.
    // (Android `elevation` is intentionally NOT used — it won't cast a shadow under a
    // translucent background.)
    bar: {
      backgroundColor: theme.overlayBg,
      borderBottomWidth: 1,
      borderBottomColor: theme.divider,
      boxShadow: '0px 12px 16px -4px rgba(49,57,64,0.12)',
    },
    // Fixed 44 px — the standard iOS nav bar height, adapts to any device's
    // status-bar height because paddingTop is injected inline from insets.top.
    row: {
      height: 44,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
      gap: spacing.sm,
    },
    slot: { width: 20, height: 20 },
    center: { flex: 1, alignItems: 'center' },
    title: {
      fontFamily: fontFamily.alexandria,
      fontSize: fontSize.md,
      lineHeight: lineHeight.md,
      color: theme.textSecondary,
      textAlign: 'center',
    },
    // Figma "Layer_1" — 93.412 × 12.929 bicoloured brand mark.
    brandLogo: { width: 93.412, height: 12.929, position: 'relative' },
    // Left half (green): inset 0 / 52.27% / 0 / 0
    brandLeft: {
      position: 'absolute',
      top: 0,
      right: '52.27%',
      bottom: 0,
      left: 0,
    },
    // Right half (teal): inset 6.6% / 0 / 22.07% / 52.01%
    brandRight: {
      position: 'absolute',
      top: '6.6%',
      right: 0,
      bottom: '22.07%',
      left: '52.01%',
    },
    // English fallback — two-tone text matching the SVG brand mark
    brandLogoEn: {
      flexDirection: 'row',
      alignItems: 'baseline',
    },
    brandLogoEnLeft: {
      fontFamily: fontFamily.alexandriaSemiBold,
      fontSize: 13,
      lineHeight: 16,
      color: theme.success,
      letterSpacing: 0.2,
    },
    brandLogoEnRight: {
      fontFamily: fontFamily.alexandriaSemiBold,
      fontSize: 13,
      lineHeight: 16,
      color: theme.primary,
      letterSpacing: 0.2,
    },
  });
