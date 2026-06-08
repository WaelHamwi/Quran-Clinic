import { StyleSheet } from 'react-native';
import type { Theme } from '@/theme/colors';
import { palette } from '@/theme/colors';
import { fontFamily } from '@/theme/typography';

// Component-specific opacity tints — not global design-system tokens (CLAUDE.md rule 4)
const OVERLAY_12 = 'rgba(255,255,255,0.12)'; // player skip-btn tint
const OVERLAY_15 = 'rgba(255,255,255,0.15)'; // seek track empty
const OVERLAY_25 = 'rgba(255,255,255,0.25)'; // seek track filled bg
const OVERLAY_60 = 'rgba(255,255,255,0.60)'; // time text on dark player
const OVERLAY_85 = 'rgba(255,255,255,0.85)'; // cached badge text on brand bg

// Figma 18085:1755 — solid sage-green mushaf background.
// Both stops identical → LinearGradient renders as a flat solid colour.
export const READER_GRADIENT_COLORS: [string, string] = [
  palette.secondaryGreen[50], // #e4efd9
  palette.secondaryGreen[50],
];

export function createReaderStyles(theme: Theme) {
  return StyleSheet.create({
    // ── Outer container (LinearGradient) ────────────────────────────────────────
    container: { flex: 1 },

    // Figma 18085:1756 — rgba(255,255,255,0.5) over #e4efd9 green → cream-white mushaf paper.
    // iOS shadow matches Figma Shadows/xl. No elevation here — player sibling must render on top of
    // this view on Android (elevation would flip the z-order and hide the player).
    contentWrapper: {
      flex: 1,
      backgroundColor: palette.bg.overlay,
      shadowColor: palette.shadow,
      shadowOpacity: 0.08,
      shadowOffset: { width: 0, height: 16 },
      shadowRadius: 16,
    },

    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
    loadingText: {
      color: palette.text.tertiary,
      fontSize: 14,
      lineHeight: 20,
      fontFamily: fontFamily.alexandria,
    },
    errorText: {
      color: palette.system.error[500],
      fontSize: 16,
      lineHeight: 24,
      fontFamily: fontFamily.alexandria,
      textAlign: 'center',
      paddingHorizontal: 32,
    },
    retryBtn: {
      backgroundColor: palette.brand[500],
      paddingHorizontal: 24,
      paddingVertical: 10,
      borderRadius: 8,
    },
    retryBtnText: {
      color: palette.text.onBrand,
      fontSize: 14,
      fontFamily: fontFamily.alexandriaMedium,
    },

    // ── Header — Figma 18085:1437 nav bar ───────────────────────────────────────
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: palette.bg.overlay, // rgba(255,255,255,0.5) — glass on glass
      borderBottomWidth: 1,
      borderBottomColor: palette.border.tertiary,
      paddingHorizontal: 16,
      paddingVertical: 12,
      gap: 8,
    },
    headerRtl: { flexDirection: 'row-reverse' },
    navBtn: {
      width: 36,
      height: 36,
      borderRadius: 999,
      justifyContent: 'center',
      alignItems: 'center',
    },
    navBtnDisabled: { opacity: 0.3 },
    headerCenter: { flex: 1, alignItems: 'center' },
    headerTitle: {
      color: palette.text.secondary, // #414651 — Figma text-secondary-700
      fontSize: 16,
      lineHeight: 24,
      fontFamily: fontFamily.alexandria,
      textAlign: 'center',
    },
    headerSub: {
      color: palette.text.tertiary,
      fontSize: 12,
      lineHeight: 18,
      fontFamily: fontFamily.alexandriaLight,
      marginTop: 1,
    },
    langToggle: {
      borderWidth: 1,
      borderColor: palette.border.primary,
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 5,
      backgroundColor: palette.white,
    },
    langToggleActive: { backgroundColor: palette.brand[500], borderColor: palette.brand[500] },
    langToggleText: {
      color: palette.text.tertiary,
      fontFamily: fontFamily.alexandriaBold,
      fontSize: 12,
    },
    langToggleTextActive: { color: palette.text.onBrand },

    // ── Surah header (ListHeaderComponent) — Figma 18085:1755 mushaf header ────
    surahHeader: {
      alignItems: 'center',
      paddingTop: 24,
      paddingBottom: 8,
      paddingHorizontal: 20,
      gap: 12,
    },
    surahHeaderBanner: {
      width: '100%',
      alignItems: 'center',
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderWidth: 1,
      borderColor: palette.brand[100],
      backgroundColor: palette.brand[25],
    },
    surahHeaderName: {
      fontSize: 26,
      lineHeight: 50,
      color: palette.brand[500],
      fontFamily: fontFamily.arabic,
      textAlign: 'center',
    },
    surahHeaderMeta: {
      fontSize: 12,
      lineHeight: 18,
      color: palette.text.tertiary,
      fontFamily: fontFamily.alexandriaLight,
      textAlign: 'center',
      marginTop: 2,
    },
    basmalah: {
      fontSize: 20,
      lineHeight: 44,
      color: palette.text.primary,
      fontFamily: fontFamily.arabic,
      textAlign: 'center',
    },

    // ── Verse list — Figma 18085:1730 mushaf page (white paper) ────────────────
    verseList: {
      paddingTop: 4,
      paddingBottom: 180,
    },
    // Figma mushaf: verses flow like a book — no visible gap between rows
    verseRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      paddingVertical: 2,
      paddingHorizontal: 16,
      gap: 8,
    },
    verseRowActive: {
      backgroundColor: palette.brand[25],
      borderLeftWidth: 3,
      borderLeftColor: palette.brand[500],
    },
    // Figma āyah marker: small circle with visible sage-green fill + darker ring
    verseNumberCircle: {
      width: 22,
      height: 22,
      borderRadius: 999,
      backgroundColor: palette.secondaryGreen[100],
      borderWidth: 1,
      borderColor: palette.secondaryGreen[300],
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 4,
      flexShrink: 0,
    },
    verseNumberCircleActive: {
      backgroundColor: palette.brand[500],
      borderColor: palette.brand[500],
    },
    verseNumber: {
      fontSize: 9,
      lineHeight: 12,
      color: palette.secondaryGreen[600],
      fontFamily: fontFamily.alexandriaBold,
      textAlign: 'center',
    },
    verseNumberActive: { color: palette.text.onBrand },
    verseTexts: { flex: 1 },
    // Figma 18085:1755 — Amiri Quranic text on cream mushaf paper
    verseArabic: {
      fontSize: 22,
      lineHeight: 36,
      textAlign: 'right',
      writingDirection: 'rtl',
      color: theme.verseArabicColor, // palette.text.primary (#181d27) in light
      fontFamily: fontFamily.arabic,
    },
    verseArabicActive: { color: palette.brand[700], fontFamily: fontFamily.arabicBold },
    verseEnglish: {
      fontSize: 14,
      lineHeight: 22,
      color: palette.text.secondary,
      fontFamily: fontFamily.alexandria,
      marginTop: 8,
    },
    verseEnglishActive: {
      color: palette.brand[600],
      fontFamily: fontFamily.alexandriaMedium,
    },
    verseEnglishMissing: {
      fontSize: 12,
      color: palette.text.tertiary,
      fontFamily: fontFamily.alexandria,
      marginTop: 4,
      fontStyle: 'italic',
    },

    // ── Player — Figma brand-700 bottom sheet ───────────────────────────────────
    player: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: palette.brand[700],
      paddingHorizontal: 16,
      paddingTop: 10,
      paddingBottom: 24,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      // elevation 4: renders the player above contentWrapper (elevation 0) on Android
      elevation: 4,
    },
    playerTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 10,
    },
    playerReciterBlock: { flex: 1, marginRight: 10 },
    playerReciterLabel: {
      color: palette.brand[200],
      fontSize: 10,
      lineHeight: 16,
      letterSpacing: 1.4,
      fontFamily: fontFamily.alexandriaMedium,
      marginBottom: 3,
    },
    playerReciter: {
      color: palette.brand[100],
      fontSize: 16,
      lineHeight: 24,
      fontFamily: fontFamily.alexandriaBold,
    },

    seekTrack: {
      height: 4,
      backgroundColor: OVERLAY_25,
      borderRadius: 2,
      marginVertical: 4,
      position: 'relative',
      justifyContent: 'center',
    },
    seekTrackEmpty: {
      height: 4,
      backgroundColor: OVERLAY_15,
      borderRadius: 2,
      marginVertical: 4,
    },
    seekFill: {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      backgroundColor: palette.brand[200],
      borderRadius: 2,
    },
    seekThumb: {
      position: 'absolute',
      width: 16,
      height: 16,
      borderRadius: 999,
      backgroundColor: palette.text.onBrand,
      top: -6,
      marginLeft: -8,
      borderWidth: 2,
      borderColor: palette.brand[500],
      shadowColor: palette.black,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      shadowRadius: 2,
      elevation: 3,
    },

    timeRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 4,
      marginBottom: 6,
    },
    timeText: {
      color: OVERLAY_60,
      fontSize: 10,
      lineHeight: 16,
      fontFamily: fontFamily.alexandria,
    },

    controls: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 24,
    },

    speedRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      marginTop: 10,
    },
    speedChip: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 99,
      backgroundColor: OVERLAY_12,
    },
    speedChipActive: {
      backgroundColor: palette.text.onBrand,
    },
    speedChipText: {
      color: OVERLAY_60,
      fontSize: 11,
      lineHeight: 16,
      fontFamily: fontFamily.alexandriaMedium,
    },
    speedChipTextActive: {
      color: palette.brand[700],
    },
    skipBtn: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      backgroundColor: OVERLAY_12,
    },
    skipBtnText: {
      color: palette.text.onBrand,
      fontSize: 12,
      lineHeight: 18,
      fontFamily: fontFamily.alexandriaSemiBold,
    },
    playButton: {
      width: 52,
      height: 52,
      borderRadius: 999,
      backgroundColor: palette.text.onBrand,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: palette.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 4,
    },
    playButtonText: { fontSize: 20, color: palette.brand[500] },

    cachedBadge: {
      backgroundColor: palette.brand[500],
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 4,
    },
    cachedText: {
      color: OVERLAY_85,
      fontSize: 12,
      fontFamily: fontFamily.alexandriaMedium,
    },
    downloadButton: {
      backgroundColor: palette.brand[500],
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
    },
    downloadText: {
      color: palette.text.onBrand,
      fontSize: 12,
      fontFamily: fontFamily.alexandriaSemiBold,
    },

    noReciterBanner: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: palette.white,
      paddingVertical: 14,
      alignItems: 'center',
      borderTopWidth: 1,
      borderTopColor: palette.border.secondary,
      elevation: 4, // above contentWrapper on Android
    },
    noReciterRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    noReciterText: {
      color: palette.brand[500],
      fontSize: 14,
      fontFamily: fontFamily.alexandriaMedium,
    },
  });
}
