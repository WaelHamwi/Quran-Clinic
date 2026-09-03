import { StyleSheet } from 'react-native';
import type { Theme } from '@/theme/colors';
import { fontFamily, fontSize, lineHeight } from '@/theme/typography';
import { spacing, radius } from '@/theme/spacing';

export const createStyles = (theme: Theme) =>
  StyleSheet.create({
    content: { padding: spacing.lg, gap: spacing.md, flexGrow: 1 },
    header: { gap: spacing.lg, marginBottom: spacing.xs },

    // --- Device-storage summary card ---
    card: {
      backgroundColor: theme.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.cardBorder,
      padding: spacing.lg,
      gap: spacing.md,
    },
    cardHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    cardHeaderRowRtl: { flexDirection: 'row-reverse' },
    cardIconWrap: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: theme.brandSubtle,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cardTitle: {
      flex: 1,
      fontFamily: fontFamily.alexandriaSemiBold,
      fontSize: fontSize.md,
      lineHeight: lineHeight.md,
      color: theme.text,
    },
    cardTitleRtl: { textAlign: 'right' },
    cardUsedValue: {
      fontFamily: fontFamily.alexandriaSemiBold,
      fontSize: fontSize.sm,
      lineHeight: lineHeight.sm,
      color: theme.primary,
    },

    // Stacked progress bar
    bar: {
      height: 10,
      borderRadius: radius.pill,
      backgroundColor: theme.cardBorder,
      overflow: 'hidden',
      flexDirection: 'row',
    },
    barRtl: { flexDirection: 'row-reverse' },
    barApp: {
      height: '100%',
      backgroundColor: theme.primary,
    },
    barOther: {
      height: '100%',
      backgroundColor: theme.iconMuted,
    },

    // Legend
    legendRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.md,
    },
    legendRowRtl: { flexDirection: 'row-reverse' },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    legendItemRtl: { flexDirection: 'row-reverse' },
    legendDot: { width: 10, height: 10, borderRadius: 5 },
    legendLabel: {
      fontFamily: fontFamily.alexandriaLight,
      fontSize: fontSize.xs,
      lineHeight: lineHeight.xs,
      color: theme.textMuted,
    },
    legendValue: {
      fontFamily: fontFamily.alexandriaMedium,
      fontSize: fontSize.xs,
      lineHeight: lineHeight.xs,
      color: theme.text,
    },

    // --- List header (count + clear all) ---
    listHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.md,
    },
    listHeaderRowRtl: { flexDirection: 'row-reverse' },
    countText: {
      fontFamily: fontFamily.alexandriaMedium,
      fontSize: fontSize.sm,
      lineHeight: lineHeight.sm,
      color: theme.text,
    },
    clearAllBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.sm,
      borderRadius: radius.pill,
    },
    clearAllBtnRtl: { flexDirection: 'row-reverse' },
    clearAllText: {
      fontFamily: fontFamily.alexandriaMedium,
      fontSize: fontSize.xs,
      lineHeight: lineHeight.xs,
      color: theme.error,
    },
    pressed: { opacity: 0.6 },

    // --- Download row ---
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      backgroundColor: theme.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.cardBorder,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
    },
    rowRtl: { flexDirection: 'row-reverse' },
    rowIconWrap: {
      width: 40,
      height: 40,
      borderRadius: 10,
      backgroundColor: theme.brandSubtle,
      alignItems: 'center',
      justifyContent: 'center',
    },
    rowTexts: { flex: 1, gap: 2 },
    rowTitle: {
      fontFamily: fontFamily.alexandriaMedium,
      fontSize: fontSize.sm,
      lineHeight: lineHeight.sm,
      color: theme.text,
    },
    rowMeta: {
      fontFamily: fontFamily.alexandriaLight,
      fontSize: fontSize.xs,
      lineHeight: lineHeight.xs,
      color: theme.textMuted,
    },
    rowTextsRtl: { alignItems: 'flex-end' },
    textRtl: { textAlign: 'right' },
    separator: { height: spacing.sm },

    // --- In-progress download row ---
    // Full-width under the row's texts, so the bar reads as this download's
    // own progress rather than part of the device-storage summary above.
    rowProgressTrack: {
      height: 4,
      borderRadius: radius.pill,
      backgroundColor: theme.cardBorder,
      overflow: 'hidden',
      marginTop: spacing.xs,
      alignSelf: 'stretch',
    },
    // Arabic reads right to left, so the bar has to fill from that edge too.
    rowProgressTrackRtl: { alignItems: 'flex-end' },
    rowProgressFill: { height: '100%', backgroundColor: theme.primary },
    rowMetaAccent: { color: theme.primary },
  });
