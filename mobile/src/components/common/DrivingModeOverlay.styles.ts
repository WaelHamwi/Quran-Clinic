import { StyleSheet } from 'react-native';
import { palette, type Theme } from '@/theme/colors';
import { spacing, space, radius } from '@/theme/spacing';
import { fontSize, lineHeight, fontFamily } from '@/theme/typography';

/** Driving Mode overlay — Figma node 18171:2212. Patterned bg + content card,
 *  two stacked pill buttons (secondary outline + brand-filled). */
export const createStyles = (theme: Theme) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: theme.background },
    safe: { flex: 1 },
    card: { flex: 1, backgroundColor: theme.card, paddingHorizontal: spacing.lg, paddingVertical: 20 },
    inner: {
      flex: 1,
      justifyContent: 'space-between',
      paddingHorizontal: 10,
      paddingBottom: 20,
    },
    topGroup: { gap: 115, alignItems: 'center' },

    titleBlock: { alignItems: 'center' },
    carBubble: { padding: 20, borderRadius: 60 },
    carIcon: { width: 80, height: 80 },
    title: {
      fontFamily: fontFamily.alexandriaSemiBold,
      fontSize: fontSize.xl,
      lineHeight: lineHeight.md,
      color: theme.text,
      textAlign: 'center',
    },

    statusBlock: { alignItems: 'center', gap: 20, paddingHorizontal: 10 },
    stopBubble: {
      // Subtle error tint bubble — kept as a palette token (no dark variant needed
      // for this rarely-seen driving overlay).
      backgroundColor: palette.system.error[50],
      padding: 20,
      borderRadius: 160,
      alignItems: 'center',
      justifyContent: 'center',
    },
    stopIcon: { width: 70, height: 70 },
    body: {
      fontFamily: fontFamily.alexandriaLight,
      fontSize: fontSize.md,
      lineHeight: lineHeight.md,
      color: theme.text,
      textAlign: 'center',
    },
    focus: {
      fontFamily: fontFamily.alexandriaMedium,
      fontSize: fontSize.md,
      lineHeight: lineHeight.md,
      color: theme.text,
      textAlign: 'center',
    },

    buttons: { gap: spacing.md },
    secondaryBtn: {
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: radius.pill,
      height: 48,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: space.sm,
    },
    primaryBtn: {
      backgroundColor: theme.primary,
      borderRadius: radius.pill,
      height: 48,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: space.sm,
    },
    pressed: { opacity: 0.85 },
    secondaryText: {
      fontFamily: fontFamily.alexandria,
      fontSize: fontSize.md,
      lineHeight: lineHeight.md,
      color: theme.textSecondary,
      textAlign: 'center',
    },
    primaryText: {
      fontFamily: fontFamily.alexandria,
      fontSize: fontSize.md,
      lineHeight: lineHeight.md,
      color: theme.textOnBrand,
      textAlign: 'center',
    },
    btnIcon: { width: 20, height: 20 },
  });
