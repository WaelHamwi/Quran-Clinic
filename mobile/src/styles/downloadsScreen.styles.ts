import { StyleSheet } from 'react-native';
import { palette } from '@/theme/colors';
import { fontFamily } from '@/theme/typography';
import { spacing, radius } from '@/theme/spacing';

/** Bar segment + legend tints for the device-storage card. */
export const STORAGE_TRACK_COLOR = palette.gray[200];
export const STORAGE_APP_COLOR = palette.brand[500];
export const STORAGE_OTHER_COLOR = palette.gray[400];
export const STORAGE_FREE_COLOR = palette.secondaryGreen[600];
export const ROW_ICON_COLOR = palette.brand[500];
export const ROW_REMOVE_COLOR = palette.system.error[500];

export const downloadsScreenStyles = StyleSheet.create({
  content: { padding: spacing.lg, gap: spacing.md, flexGrow: 1 },
  header: { gap: spacing.lg, marginBottom: spacing.xs },

  // --- Device-storage summary card ---
  card: {
    backgroundColor: palette.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.border.secondary,
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
    backgroundColor: palette.brand[25],
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    flex: 1,
    fontFamily: fontFamily.alexandriaSemiBold,
    fontSize: 16,
    lineHeight: 24,
    color: palette.text.primary,
  },
  cardTitleRtl: { textAlign: 'right' },
  cardUsedValue: {
    fontFamily: fontFamily.alexandriaSemiBold,
    fontSize: 14,
    lineHeight: 20,
    color: palette.brand[500],
  },

  // Stacked progress bar
  bar: {
    height: 10,
    borderRadius: radius.pill,
    backgroundColor: STORAGE_TRACK_COLOR,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  barRtl: { flexDirection: 'row-reverse' },
  barApp: {
    height: '100%',
    backgroundColor: STORAGE_APP_COLOR,
  },
  barOther: {
    height: '100%',
    backgroundColor: STORAGE_OTHER_COLOR,
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
    fontSize: 12,
    lineHeight: 18,
    color: palette.text.tertiary,
  },
  legendValue: {
    fontFamily: fontFamily.alexandriaMedium,
    fontSize: 12,
    lineHeight: 18,
    color: palette.text.primary,
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
    fontSize: 14,
    lineHeight: 20,
    color: palette.text.primary,
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
    fontSize: 12,
    lineHeight: 18,
    color: palette.system.error[500],
  },
  pressed: { opacity: 0.6 },

  // --- Download row ---
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: palette.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.border.secondary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  rowRtl: { flexDirection: 'row-reverse' },
  rowIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: palette.brand[25],
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTexts: { flex: 1, gap: 2 },
  rowTitle: {
    fontFamily: fontFamily.alexandriaMedium,
    fontSize: 14,
    lineHeight: 20,
    color: palette.text.primary,
  },
  rowMeta: {
    fontFamily: fontFamily.alexandriaLight,
    fontSize: 12,
    lineHeight: 18,
    color: palette.text.tertiary,
  },
  rowTextsRtl: { alignItems: 'flex-end' },
  textRtl: { textAlign: 'right' },
  separator: { height: spacing.sm },
});
