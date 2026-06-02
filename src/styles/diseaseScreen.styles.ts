import { StyleSheet } from 'react-native';
import { palette } from '@/theme/colors';
import { fontFamily } from '@/theme/typography';
import { radius, spacing } from '@/theme/spacing';

export const TAB_ICON_COLOR = palette.text.tertiary;

export const diseaseScreenStyles = StyleSheet.create({
  /* ── Outer layout ──────────────────────────────────────────── */
  content: {
    flex: 1,
    paddingTop: spacing.xl, // 24px — Figma node 18032:3099 paddingTop
    gap: 20,                // Figma gap between tabs and card
  },

  /* ── Session tabs — Figma node 18032:3101 (RTL Button Group) ─ */
  tabsWrap: {
    paddingHorizontal: 20, // Figma inner paddingH for content area
  },
  tabGroup: {
    flexDirection: 'row',
    backgroundColor: palette.white,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: palette.border.primary,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,                 // Figma gap/xs = 4
    paddingVertical: 8,     // Figma spacing/md = 8
    paddingHorizontal: 12,  // Figma spacing/lg = 12
    borderRadius: radius.pill,
  },
  'tab--active': {
    backgroundColor: palette.brand[500],
  },
  tabText: {
    fontFamily: fontFamily.alexandria,
    fontSize: 12,
    lineHeight: 18,
    color: palette.text.tertiary,
    textAlign: 'center',
  },
  'tabText--active': {
    color: palette.text.onBrand,
  },

  /* ── Section card — Figma node 18032:3107 ─────────────────── */
  sectionCard: {
    flex: 1,
    marginHorizontal: 20,
    backgroundColor: palette.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.border.secondary,
    overflow: 'hidden',
  },
  cardScroll: {
    paddingTop: 20,         // Figma node 18032:3108 paddingTop
    paddingHorizontal: 20,
    paddingBottom: spacing.xxxl,
    gap: 12,                // Figma gap between text items
  },
  descText: {
    fontFamily: fontFamily.alexandria,
    fontSize: 16,
    lineHeight: 24,
    color: palette.text.primary,
    textAlign: 'center',
  },
  feedbackWrap: {
    paddingTop: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: palette.border.secondary,
  },
  emptyText: {
    fontFamily: fontFamily.alexandriaLight,
    fontSize: 14,
    lineHeight: 22,
    color: palette.text.tertiary,
    textAlign: 'center',
    paddingVertical: spacing.xl,
  },
});
