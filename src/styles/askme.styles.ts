import { StyleSheet } from 'react-native';
import { palette } from '@/theme/colors';
import { fontFamily } from '@/theme/typography';

// Figma 18081:2324 — secondaryGreen[25] at 50% + lightGreen[25] at 50% blended over white.
// Pre-blending is required because LinearGradient cannot layer two gradients.
export const ASKME_GRADIENT_COLORS: [string, string] = [
  '#fcfefb', // rgba(249,253,248, 0.5) on white → secondaryGreen[25] blended
  '#f7fcea', // rgba(239,249,213, 0.5) on white → lightGreen[25] blended
];

// Message drop-shadow — Figma 0px 1px 1px rgba(0,0,0,0.05), component-specific (CLAUDE.md rule 4)
const MSG_SHADOW = {
  shadowColor: palette.black,
  shadowOpacity: 0.05,
  shadowOffset: { width: 0, height: 1 },
  shadowRadius: 1,
  elevation: 1,
} as const;

export const askMeStyles = StyleSheet.create({
  // ── Layout ────────────────────────────────────────────────────────────────
  container: { flex: 1 },
  flex: { flex: 1 },

  // ── Header — Figma 18081:2327 ─────────────────────────────────────────────
  // Glass effect: rgba(255,255,255,0.5) over gradient + Shadows/xl bottom border
  header: {
    backgroundColor: palette.bg.overlay,
    borderBottomWidth: 1,
    borderBottomColor: palette.border.tertiary,
    shadowColor: palette.shadow,
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 16 },
    shadowRadius: 16,
  },
  headerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerSide: { width: 20 },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
    color: palette.text.secondary,
    fontFamily: fontFamily.alexandria,
  },

  // ── Message list — Figma 18081:2328 ───────────────────────────────────────
  list: {
    paddingTop: 20,
    paddingBottom: 20,
    gap: 16,
  },

  // Date separator badge — Figma 18081:2329
  dateBadge: {
    alignSelf: 'center',
    backgroundColor: palette.white,
    borderRadius: 37,
    paddingHorizontal: 16,
    paddingVertical: 4,
    ...MSG_SHADOW,
  },
  dateBadgeText: {
    fontSize: 12,
    lineHeight: 18,
    color: palette.text.primary,
    fontFamily: fontFamily.alexandriaLight,
    textAlign: 'center',
  },

  // ── AI message row — Figma 18081:2331 ────────────────────────────────────
  aiRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    gap: 12,
  },
  // Figma 18081:2332 — mint circle with leaf icon
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 999,
    backgroundColor: palette.mint[100],
    borderWidth: 1,
    borderColor: palette.mint[200],
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  // Figma 18081:2337 — white bubble, rounded-12, gap-4 inside
  aiBubble: {
    flex: 1,
    backgroundColor: palette.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 4,
    ...MSG_SHADOW,
  },
  aiBubbleText: {
    fontSize: 12,
    lineHeight: 18,
    color: palette.text.primary,
    fontFamily: fontFamily.alexandriaLight,
    writingDirection: 'rtl',
    textAlign: 'right',
  },
  aiTimestamp: {
    fontSize: 10,
    lineHeight: 16,
    color: palette.text.tertiary,
    fontFamily: fontFamily.alexandria,
    textAlign: 'right',
  },

  // ── User message row — Figma 18081:2340 ─────────────────────────────────
  userRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    gap: 12,
  },
  // Figma 18081:2341 — brand bubble, rounded-12, gap-4 inside
  userBubble: {
    flex: 1,
    backgroundColor: palette.brand[500],
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 4,
    ...MSG_SHADOW,
  },
  userBubbleText: {
    fontSize: 12,
    lineHeight: 18,
    color: palette.text.onBrand,
    fontFamily: fontFamily.alexandriaLight,
    writingDirection: 'rtl',
    textAlign: 'right',
  },
  userTimestamp: {
    fontSize: 10,
    lineHeight: 16,
    color: palette.text.secondaryOnBrand,
    fontFamily: fontFamily.alexandria,
    textAlign: 'right',
  },
  // Figma 18081:2344 — brand-500 circle user avatar
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 999,
    backgroundColor: palette.brand[500],
    borderWidth: 1,
    borderColor: palette.brand[100],
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  // ── Thinking indicator ────────────────────────────────────────────────────
  thinking: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  thinkingText: {
    fontSize: 12,
    lineHeight: 18,
    color: palette.text.tertiary,
    fontFamily: fontFamily.alexandriaLight,
  },

  // ── Input area — Figma 18081:2392 ─────────────────────────────────────────
  inputArea: {
    backgroundColor: palette.white,
    borderTopWidth: 1,
    borderTopColor: palette.border.secondary,
    paddingTop: 20,
    gap: 20,
  },

  // Suggestion chips — Figma 18081:2393, horizontal scroll row
  chipsContent: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
    paddingRight: 4,
  },
  chip: {
    backgroundColor: palette.brand[25],
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexShrink: 0,
  },
  chipText: {
    fontSize: 12,
    lineHeight: 18,
    color: palette.brand[500],
    fontFamily: fontFamily.alexandria,
    textAlign: 'center',
  },

  // Input row — Figma 18081:2402
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
  },
  // Send button — Figma 18081:2403, brand-500 circle 48px
  sendBtn: {
    width: 48,
    height: 48,
    borderRadius: 999,
    backgroundColor: palette.brand[500],
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  sendBtnDisabled: { opacity: 0.5 },
  // Input field — Figma 18081:2406, pill-shape, 48px, border-primary
  inputField: {
    flex: 1,
    height: 48,
    backgroundColor: palette.white,
    borderWidth: 1,
    borderColor: palette.border.primary,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 16,
    lineHeight: 24,
    color: palette.text.primary,
    fontFamily: fontFamily.alexandriaLight,
    textAlignVertical: 'center',
  },

  // ── Navigation action buttons — tappable chips inside AI bubble ───────────
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: palette.border.tertiary,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.brand[25],
    borderWidth: 1,
    borderColor: palette.brand[50],
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 4,
  },
  actionBtnText: {
    fontSize: 11,
    lineHeight: 16,
    color: palette.brand[500],
    fontFamily: fontFamily.alexandria,
  },
});
