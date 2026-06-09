import { StyleSheet } from 'react-native';
import { palette } from '@/theme/colors';
import { fontFamily } from '@/theme/typography';
import { radius, space, spacing } from '@/theme/spacing';

// Warm yellow at 30% opacity — matches the KaraokeText segment highlight
const DESC_HIGHLIGHT = 'rgba(255,214,0,0.30)';

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
  titleText: {
    fontFamily: fontFamily.alexandriaSemiBold,
    fontSize: 18,
    lineHeight: 28,
    color: palette.text.primary,
    textAlign: 'center',
  },
  descHighlight: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  'descHighlight--active': {
    backgroundColor: DESC_HIGHLIGHT,
  },
  descText: {
    fontFamily: fontFamily.alexandria,
    fontSize: 16,
    lineHeight: 24,
    color: palette.text.secondary,
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

  /* ── First-wird advisory alert — Figma node 18024:1107 ────── */
  alert: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: palette.system.warning[25],
    borderWidth: 1,
    borderColor: palette.border.secondary,
    borderRadius: radius.sm,
    paddingHorizontal: space.md,
    paddingVertical: space.lg,
    gap: space.sm,
    marginHorizontal: 20,
  },
  alertContent: {
    flex: 1,
    gap: space.xs,
  },
  alertTitle: {
    fontFamily: fontFamily.alexandria,
    fontSize: 14,
    lineHeight: 20,
    color: palette.system.warning[900],
  },
  alertBody: {
    fontFamily: fontFamily.alexandriaLight,
    fontSize: 10,
    lineHeight: 16,
    color: palette.system.warning[800],
  },
});
