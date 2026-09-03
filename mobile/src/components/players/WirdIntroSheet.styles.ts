import { StyleSheet } from 'react-native';
import { palette, type Theme } from '@/theme/colors';
import { spacing, space, radius } from '@/theme/spacing';
import { fontSize, lineHeight, fontFamily } from '@/theme/typography';

/** Ruqyah intro sheet — Figma 19164:3739. Speech-bubble illustration, entity
 *  title, advisory text + instructions link, banner, and the two type cards
 *  (summarized free / detailed subscribers). */
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
      maxHeight: '92%',
    },
    header: { padding: spacing.lg, alignItems: 'center' },
    handle: { width: 60, height: 4, borderRadius: radius.lg, backgroundColor: theme.cardBorder },

    body: { paddingHorizontal: 20, gap: 20 },
    closeBtn: {
      alignSelf: 'flex-end',
      backgroundColor: theme.fieldBg,
      padding: spacing.md,
      borderRadius: 60,
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    'closeBtn--ltr': { alignSelf: 'flex-start' },

    intro: { alignItems: 'center', gap: 20 },
    bubbleWrap: { width: 233, height: 174, alignItems: 'center' },
    // The raw asset has the tail at the top; Figma renders it -scale-y-100.
    bubbleSvg: { position: 'absolute', top: 0, left: 0, transform: [{ scaleY: -1 }] },
    bubbleText: {
      position: 'absolute',
      top: 64,
      fontFamily: fontFamily.alexandriaSemiBold,
      fontSize: fontSize.xxl,
      lineHeight: lineHeight.xl,
      color: theme.primaryMid,
      textAlign: 'center',
    },
    texts: { gap: spacing.lg, width: '100%' },
    title: {
      fontFamily: fontFamily.alexandriaSemiBold,
      fontSize: fontSize.xxl,
      lineHeight: lineHeight.xl,
      color: theme.primary,
      textAlign: 'center',
    },
    bodyText: {
      fontFamily: fontFamily.alexandriaLight,
      fontSize: fontSize.md,
      lineHeight: lineHeight.md,
      color: theme.text,
      textAlign: 'center',
    },
    link: {
      textDecorationLine: 'underline',
    },
    banner: {
      backgroundColor: theme.brandSubtle,
      borderRadius: radius.sm,
      padding: space.md,
      width: '100%',
    },
    bannerText: {
      fontFamily: fontFamily.alexandria,
      fontSize: fontSize.sm,
      lineHeight: lineHeight.sm,
      color: theme.primary,
      textAlign: 'center',
    },

    cards: { paddingTop: 10, paddingBottom: 60, paddingHorizontal: 20, gap: spacing.md },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: radius.md,
      padding: space.lg,
      width: '100%',
    },
    'card--ltr': { flexDirection: 'row-reverse' },
    'card--brand': {
      backgroundColor: theme.primary,
      borderColor: theme.cardBorder,
    },
    cardGroup: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    'cardGroup--ltr': { flexDirection: 'row-reverse' },
    cardTexts: { gap: spacing.xs, alignItems: 'flex-end' },
    'cardTexts--ltr': { alignItems: 'flex-start' },
    cardTitle: {
      fontFamily: fontFamily.alexandria,
      fontSize: fontSize.sm,
      lineHeight: lineHeight.sm,
      color: theme.primary,
      textAlign: 'center',
    },
    'cardTitle--onBrand': { color: theme.textOnBrand },
    cardSub: {
      fontFamily: fontFamily.alexandriaLight,
      fontSize: fontSize.xs,
      lineHeight: lineHeight.xs,
      color: theme.textMuted,
      textAlign: 'center',
    },
    // Figma: brand-25 sub-label on the brand card — constant across themes.
    'cardSub--onBrand': { color: palette.brand[25] },
    iconBubble: {
      backgroundColor: theme.brandSubtle,
      borderRadius: 12,
      padding: space.lg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sideIcon: { width: 24, alignItems: 'center' },
  });
