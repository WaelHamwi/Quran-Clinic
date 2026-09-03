import { StyleSheet } from 'react-native';
import { palette, type Theme } from '@/theme/colors';
import { fontFamily, fontSize, lineHeight } from '@/theme/typography';
import { radius, spacing } from '@/theme/spacing';

export const createStyles = (theme: Theme) =>
  StyleSheet.create({
    scroll: { flex: 1 },
    content: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.xl,
      paddingBottom: spacing.xxxl,
      gap: 20,
      alignItems: 'center',
    },

    /* ── Brand logo (same 3-SVG layout as login, scaled to 83×137) ── */
    logoBlock: {
      width: 83,
      height: 137,
      marginBottom: spacing.sm,
    },
    logoTop: {
      position: 'absolute',
      top: 0,
      right: '2.63%',
      bottom: '41.54%',
      left: '4.45%',
    },
    logoMid: {
      position: 'absolute',
      top: '66.85%',
      right: '0.84%',
      bottom: '21.42%',
      left: '0.46%',
    },
    logoBottom: {
      position: 'absolute',
      top: '83.47%',
      right: '0.46%',
      bottom: '0.09%',
      left: '1.37%',
    },

    /* ── Content card ──────────────────────────────────────────── */
    card: {
      width: '100%',
      backgroundColor: theme.card,
      borderRadius: radius.md,
      paddingVertical: 30,
      paddingHorizontal: 20,
      gap: spacing.lg,
      shadowColor: palette.shadow,
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: 0.08,
      shadowRadius: 16,
      elevation: 4,
    },

    /* ── Divider ─────────────────────────────────────────────────── */
    divider: {
      height: 1,
      backgroundColor: theme.cardBorder,
      width: '100%',
    },

    /* ── Section ─────────────────────────────────────────────────── */
    section: {
      gap: spacing.sm,
      width: '100%',
    },
    sectionTitle: {
      fontFamily: fontFamily.alexandriaMedium,
      fontSize: fontSize.md,
      lineHeight: lineHeight.md,
      color: theme.success,
      textAlign: 'left',
    },
    sectionTitleRtl: { textAlign: 'right' },
    sectionBody: {
      fontFamily: fontFamily.alexandriaLight,
      fontSize: fontSize.sm,
      lineHeight: lineHeight.sm,
      color: theme.textSecondary,
      textAlign: 'left',
    },
    sectionBodyRtl: { textAlign: 'right' },

    /* ── Bullet list item ────────────────────────────────────────── */
    bulletRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.sm,
    },
    bulletRowLtr: { flexDirection: 'row-reverse' },
    bullet: {
      fontFamily: fontFamily.alexandriaLight,
      fontSize: fontSize.sm,
      lineHeight: lineHeight.sm,
      color: theme.textSecondary,
      marginTop: 1,
    },
    bulletText: {
      flex: 1,
      fontFamily: fontFamily.alexandriaLight,
      fontSize: fontSize.sm,
      lineHeight: lineHeight.sm,
      color: theme.textSecondary,
      textAlign: 'right',
    },
    bulletTextLtr: { textAlign: 'left' },
  });
