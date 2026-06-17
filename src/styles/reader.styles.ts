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
const SHEET_BACKDROP = 'rgba(0,0,0,0.45)'; // bookmark modal backdrop tint
const ERROR_TINT_15 = 'rgba(240,68,56,0.15)'; // player error banner bg over dark player (palette.system.error[500] @ 15%)

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

    // Warm parchment page over the sage-green canvas — closer to a printed Mushaf.
    // No elevation — player sibling must render on top on Android.
    contentWrapper: {
      flex: 1,
      backgroundColor: palette.bg.mushaf,
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
      backgroundColor: palette.bg.overlay, // rgba(255,255,255,0.5) — glass on glass
      borderBottomWidth: 1,
      borderBottomColor: palette.border.tertiary,
      paddingHorizontal: 16,
      paddingVertical: 10,
      gap: 10,
    },
    navRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    toolbarRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
    },
    rowRtl: { flexDirection: 'row-reverse' },
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
      minWidth: 42,
      height: 30,
      paddingHorizontal: 12,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: palette.brand[50],
      backgroundColor: palette.brand[25],
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: palette.shadow,
      shadowOpacity: 0.08,
      shadowOffset: { width: 0, height: 1 },
      shadowRadius: 2,
      elevation: 1,
    },
    langToggleActive: {
      backgroundColor: palette.brand[500],
      borderColor: palette.brand[500],
      shadowColor: palette.brand[500],
      shadowOpacity: 0.3,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 6,
      elevation: 3,
    },
    langToggleText: {
      color: palette.brand[600],
      fontFamily: fontFamily.alexandriaBold,
      fontSize: 11,
      lineHeight: 14,
      letterSpacing: 0.8,
    },
    langToggleTextActive: { color: palette.text.onBrand },
    modeToggle: {
      width: 36,
      height: 36,
      borderRadius: 999,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: palette.brand[25],
      borderWidth: 1,
      borderColor: palette.brand[50],
    },
    // Segmented reading-direction control — vertical scroll ↕ vs horizontal pages ↔
    modeSegment: {
      flexDirection: 'row',
      alignItems: 'center',
      height: 36,
      borderRadius: 999,
      backgroundColor: palette.brand[25],
      borderWidth: 1,
      borderColor: palette.brand[50],
      padding: 2,
    },
    modeSegmentBtn: {
      width: 34,
      height: 30,
      borderRadius: 999,
      justifyContent: 'center',
      alignItems: 'center',
    },
    modeSegmentBtnActive: {
      backgroundColor: palette.brand[500],
    },
    pageContent: {
      paddingTop: 8,
      paddingBottom: 180,
    },

    fontSizeToggle: {
      width: 36,
      height: 36,
      borderRadius: 999,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: palette.brand[25],
      borderWidth: 1,
      borderColor: palette.brand[50],
    },
    fontSizeToggleActive: {
      backgroundColor: palette.brand[500],
      borderColor: palette.brand[500],
    },
    fontSizeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'center',
      gap: 6,
      paddingHorizontal: 6,
      paddingVertical: 5,
      borderRadius: 999,
      backgroundColor: palette.white,
      borderWidth: 1,
      borderColor: palette.brand[50],
    },
    fontSizeChip: {
      minWidth: 34,
      alignItems: 'center',
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 999,
    },
    fontSizeChipActive: {
      backgroundColor: palette.brand[500],
    },
    fontSizeChipText: {
      color: palette.brand[600],
      fontSize: 10,
      fontFamily: fontFamily.alexandriaBold,
      letterSpacing: 0.4,
    },
    fontSizeChipTextActive: {
      color: palette.text.onBrand,
    },

    pageBreak: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 14,
      gap: 8,
    },
    pageBreakLine: {
      flex: 1,
      height: 1,
      backgroundColor: palette.brand[50],
    },
    pageBreakBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: palette.brand[50],
      backgroundColor: palette.brand[25],
    },
    pageBreakText: {
      fontSize: 11,
      color: palette.brand[600],
      fontFamily: fontFamily.alexandriaBold,
      letterSpacing: 0.4,
    },
    pageIndicator: {
      alignItems: 'center',
      paddingTop: 16,
      paddingBottom: 24,
    },
    pageIndicatorText: {
      fontSize: 12,
      color: palette.brand[600],
      fontFamily: fontFamily.alexandriaBold,
      letterSpacing: 0.6,
    },

    bookmarkFab: {
      position: 'absolute',
      right: 16,
      width: 48,
      height: 48,
      borderRadius: 999,
      backgroundColor: palette.white,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: palette.border.secondary,
      shadowColor: palette.shadow,
      shadowOpacity: 0.18,
      shadowOffset: { width: 0, height: 4 },
      shadowRadius: 8,
      elevation: 5,
      zIndex: 6,
    },
    bookmarkFabActive: {
      backgroundColor: palette.brand[500],
      borderColor: palette.brand[500],
      shadowColor: palette.brand[500],
      shadowOpacity: 0.4,
    },

    bookmarkOverlay: {
      flex: 1,
      backgroundColor: SHEET_BACKDROP,
      justifyContent: 'flex-end',
    },
    bookmarkSheet: {
      backgroundColor: palette.white,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingTop: 10,
      paddingHorizontal: 18,
      paddingBottom: 24,
      maxHeight: '75%',
    },
    bookmarkSheetHandle: {
      alignSelf: 'center',
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: palette.border.primary,
      marginBottom: 14,
    },
    bookmarkSheetTitle: {
      fontSize: 16,
      lineHeight: 22,
      fontFamily: fontFamily.alexandriaBold,
      color: palette.text.primary,
      textAlign: 'center',
      marginBottom: 14,
    },
    bookmarkCurrentRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      paddingVertical: 4,
    },
    bookmarkCurrentLabel: {
      flex: 1,
      fontSize: 13,
      fontFamily: fontFamily.alexandriaMedium,
      color: palette.text.secondary,
    },
    bookmarkCurrentBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: palette.brand[50],
      backgroundColor: palette.brand[25],
    },
    bookmarkCurrentBtnActive: {
      backgroundColor: palette.brand[500],
      borderColor: palette.brand[500],
    },
    bookmarkCurrentBtnText: {
      fontSize: 12,
      color: palette.brand[600],
      fontFamily: fontFamily.alexandriaBold,
    },
    bookmarkCurrentBtnTextActive: {
      color: palette.text.onBrand,
    },
    bookmarkDivider: {
      height: 1,
      backgroundColor: palette.border.tertiary,
      marginVertical: 14,
    },
    bookmarkListEmpty: {
      fontSize: 13,
      fontFamily: fontFamily.alexandria,
      color: palette.text.tertiary,
      textAlign: 'center',
      paddingVertical: 24,
    },
    bookmarkList: {
      maxHeight: 360,
    },
    bookmarkListItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingVertical: 12,
      paddingHorizontal: 8,
      borderBottomWidth: 1,
      borderBottomColor: palette.border.tertiary,
    },
    bookmarkListItemText: {
      fontSize: 13,
      color: palette.text.primary,
      fontFamily: fontFamily.alexandriaMedium,
    },

    // ── Surah header (ListHeaderComponent) — double-frame calligraphic banner ───
    surahHeader: {
      alignItems: 'center',
      paddingTop: 28,
      paddingBottom: 20,
      paddingHorizontal: 20,
      gap: 18,
    },
    // Outer decorative frame — thicker border, more radius
    surahHeaderBannerOuter: {
      width: '100%',
      padding: 5,
      borderWidth: 1.5,
      borderColor: palette.brand[200],
      borderRadius: 8,
      backgroundColor: palette.brand[25],
    },
    // Inner frame — slightly darker border, tighter radius
    surahHeaderBanner: {
      width: '100%',
      alignItems: 'center',
      paddingVertical: 18,
      paddingHorizontal: 16,
      borderWidth: 1,
      borderColor: palette.brand[400],
      borderRadius: 5,
      backgroundColor: palette.brand[25],
    },
    surahHeaderName: {
      fontSize: 30,
      lineHeight: 56,
      color: palette.brand[700],
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
    // ﷽ rendered as a single calligraphic ligature via Amiri font
    basmalah: {
      fontSize: 26,
      lineHeight: 46,
      color: palette.text.primary,
      fontFamily: fontFamily.arabicBold,
      textAlign: 'center',
    },
    // Pulsing highlight when the reciter is reciting the basmalah (before verse 1 timestamp)
    basmalahActive: {
      color: palette.brand[700],
    },

    // ── Verse list — continuous mushaf page layout ───────────────────────────
    verseList: {
      paddingTop: 4,
      paddingBottom: 180,
    },
    // ── Inline Mushaf mode (showEnglish = false) ─────────────────────────────
    // All verses flow as a single RTL paragraph — no block breaks between ayat.
    verseBlock: {
      paddingHorizontal: 20,
      paddingTop: 8,
    },
    // ── Block mode (showEnglish = true) — one View per verse ─────────────────
    // borderRightWidth always present to prevent layout shifts on active toggle.
    verseRow: {
      paddingVertical: 4,
      paddingHorizontal: 20,
      borderRightWidth: 3,
      borderRightColor: 'transparent',
    },
    verseRowActive: {
      backgroundColor: palette.brand[25],
      borderRightColor: palette.brand[400],
    },
    // Amiri Quranic text — large, generous line-height for harakat (diacritics)
    verseArabic: {
      fontSize: 22,
      lineHeight: 42,
      textAlign: 'right',
      writingDirection: 'rtl',
      color: theme.verseArabicColor,
      fontFamily: fontFamily.arabic,
    },
    // Block mode active: bold + color
    verseArabicActive: { color: palette.brand[700], fontFamily: fontFamily.arabicBold },
    // Inline mode active: background highlight + color, no font-family change (would reflow entire paragraph)
    verseArabicActiveInline: {
      color: palette.brand[700],
      backgroundColor: palette.brand[25],
    },
    // Inline end-of-ayah marker ﴿n﴾ embedded within the Arabic text flow
    verseEndMarker: {
      fontSize: 16,
      fontFamily: fontFamily.arabic,
      color: palette.secondaryGreen[600],
    },
    verseEndMarkerActive: {
      color: palette.brand[500],
    },
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

    // ── Player error banner — shown when a recitation fails to load ──────────────
    playerError: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: ERROR_TINT_15, // translucent red over the dark player
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
      marginVertical: 6,
    },
    playerErrorText: {
      flex: 1,
      color: palette.text.onBrand,
      fontSize: 12,
      lineHeight: 18,
      fontFamily: fontFamily.alexandriaMedium,
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

    // ── Verse search ──────────────────────────────────────────────────────────────
    // Top-anchored overlay: the sheet sits at the top of the screen so the
    // keyboard (which rises from the bottom) never covers the input or results.
    searchOverlay: {
      flex: 1,
      backgroundColor: SHEET_BACKDROP,
      justifyContent: 'flex-start',
    },
    searchSheet: {
      backgroundColor: palette.white,
      borderRadius: 20,
      marginHorizontal: 12,
      paddingTop: 16,
      paddingHorizontal: 18,
      paddingBottom: 18,
      maxHeight: '72%',
      shadowColor: palette.shadow,
      shadowOpacity: 0.2,
      shadowOffset: { width: 0, height: 6 },
      shadowRadius: 14,
      elevation: 8,
    },
    searchInputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: palette.border.primary,
      borderRadius: 12,
      paddingHorizontal: 12,
      marginBottom: 6,
      gap: 6,
    },
    searchInput: {
      flex: 1,
      paddingVertical: 10,
      fontSize: 15,
      fontFamily: fontFamily.alexandria,
      color: palette.text.primary,
    },
    searchClearBtn: {
      padding: 4,
    },
    searchHintText: {
      color: palette.text.tertiary,
      fontSize: 12,
      fontFamily: fontFamily.alexandriaLight,
      marginBottom: 12,
    },
    searchResultList: {
      maxHeight: 340,
    },
    searchResultItem: {
      paddingVertical: 12,
      paddingHorizontal: 4,
      borderBottomWidth: 1,
      borderBottomColor: palette.border.tertiary,
    },
    searchResultArabic: {
      fontSize: 18,
      lineHeight: 32,
      textAlign: 'right',
      writingDirection: 'rtl',
      color: palette.text.primary,
      fontFamily: fontFamily.arabic,
    },
    searchResultEnglish: {
      fontSize: 12,
      lineHeight: 18,
      color: palette.text.secondary,
      fontFamily: fontFamily.alexandria,
      marginTop: 3,
    },
    searchResultMeta: {
      fontSize: 11,
      color: palette.text.tertiary,
      fontFamily: fontFamily.alexandriaLight,
      marginTop: 4,
    },
    searchEmpty: {
      color: palette.text.tertiary,
      fontSize: 14,
      fontFamily: fontFamily.alexandria,
      textAlign: 'center',
      marginTop: 32,
    },
    // Search result highlight — distinct from audio-active (brand[25]/brand[400])
    verseSearchHighlight: {
      backgroundColor: palette.secondaryGreen[25],
      borderRightColor: palette.secondaryGreen[600],
    },
  });
}
