import { StyleSheet } from 'react-native';
import type { Theme } from '@/theme/colors';
import { palette } from '@/theme/colors';
import { fontFamily } from '@/theme/typography';

// Component-specific opacity tints — not global design-system tokens (CLAUDE.md rule 4)
const OVERLAY_85 = 'rgba(255,255,255,0.85)'; // cached badge text on brand bg
const SHEET_BACKDROP = 'rgba(0,0,0,0.45)'; // bookmark modal backdrop tint
const ERROR_TINT_15 = 'rgba(240,68,56,0.15)'; // player error chip bg over the parchment page (palette.system.error[500] @ 15%)

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

    // Reading surface frame (below the header). marginTop reserves headroom
    // above it for the surah-name medallion overlay so it doesn't overlap
    // the header toolbar above it.
    readerFrame: {
      flex: 1,
      margin: 2,
      marginTop: 18,
    },
    // Direct content area inside the reading frame — was previously the
    // inner slot of the (now removed) ornamental border artwork; kept as its
    // own style so the reader/verse text keeps the same background and
    // breathing room from the frame edges.
    readerFrameContent: {
      flex: 1,
      paddingVertical: 2,
      paddingLeft: 6,
      paddingRight: 1,
      backgroundColor: palette.bg.mushaf,
    },
    // Surah-name medallion overlay — a sibling of the reading frame, NOT
    // inside the ScrollView, so it isn't clipped by the ScrollView's own
    // bounds. Sits slightly above the band-centered position (13 − 23 = -10)
    // so more of it rises above the frame.
    surahMedallionOverlay: {
      position: 'absolute',
      top: -12,
      left: 0,
      right: 0,
      alignItems: 'center',
      zIndex: 10,
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
    // The toolbar ScrollView's content container — grows to fill the viewport
    // when the buttons fit, so centered layouts (landscape) still center.
    navRowGrow: {
      flexGrow: 1,
    },
    toolbarRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
    },
    // Landscape: nav + toolbar merge into the single navRow (more width, less height)
    headerCompact: {
      paddingVertical: 6,
      gap: 4,
    },
    navRowLandscape: {
      gap: 6,
    },
    // Landscape: center the controls with a modest gap — full-width
    // space-between stretched the gaps too wide, clustering felt worse.
    navRowSpread: {
      justifyContent: 'center',
      gap: 14,
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
      borderColor: palette.mushaf.divider,
      backgroundColor: palette.mushaf.bannerFill,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: palette.shadow,
      shadowOpacity: 0.08,
      shadowOffset: { width: 0, height: 1 },
      shadowRadius: 2,
      elevation: 1,
    },
    langToggleActive: {
      backgroundColor: palette.mushaf.titleBorderGold,
      borderColor: palette.mushaf.titleBorderGold,
      shadowColor: palette.mushaf.titleBorderGold,
      shadowOpacity: 0.3,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 6,
      elevation: 3,
    },
    langToggleText: {
      color: palette.mushaf.verseNumber,
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
      backgroundColor: palette.mushaf.bannerFill,
      borderWidth: 1,
      borderColor: palette.mushaf.divider,
    },
    // Segmented reading-direction control — vertical scroll ↕ vs horizontal pages ↔
    modeSegment: {
      flexDirection: 'row',
      alignItems: 'center',
      height: 36,
      borderRadius: 999,
      backgroundColor: palette.mushaf.bannerFill,
      borderWidth: 1,
      borderColor: palette.mushaf.divider,
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
      backgroundColor: palette.mushaf.titleBorderGold,
    },
    pageContent: {
      paddingTop: 8,
      paddingBottom: 180,
      // Clears the vertical scrollbar drawn at the scroll view's right edge
      // (paired with readerFrameContent's reduced paddingRight).
      paddingRight: 5,
    },

    // Flip toggle — same footprint as modeToggle/fontSizeToggle
    flipToggle: {
      width: 36,
      height: 36,
      borderRadius: 999,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: palette.mushaf.bannerFill,
      borderWidth: 1,
      borderColor: palette.mushaf.divider,
    },
    flipToggleActive: {
      backgroundColor: palette.mushaf.titleBorderGold,
      borderColor: palette.mushaf.titleBorderGold,
    },
    fontSizeToggle: {
      width: 36,
      height: 36,
      borderRadius: 999,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: palette.mushaf.bannerFill,
      borderWidth: 1,
      borderColor: palette.mushaf.divider,
    },
    fontSizeToggleActive: {
      backgroundColor: palette.mushaf.titleBorderGold,
      borderColor: palette.mushaf.titleBorderGold,
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
      borderColor: palette.mushaf.divider,
    },
    fontSizeChip: {
      minWidth: 34,
      alignItems: 'center',
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 999,
    },
    fontSizeChipActive: {
      backgroundColor: palette.mushaf.titleBorderGold,
    },
    fontSizeChipText: {
      color: palette.mushaf.verseNumber,
      fontSize: 10,
      fontFamily: fontFamily.alexandriaBold,
      letterSpacing: 0.4,
    },
    fontSizeChipTextActive: {
      color: palette.text.onBrand,
    },

    // Auto-scroll toggle + its inline speed picker — same footprint and chip
    // shape as the font-size control directly above.
    autoScrollToggle: {
      width: 36,
      height: 36,
      borderRadius: 999,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: palette.mushaf.bannerFill,
      borderWidth: 1,
      borderColor: palette.mushaf.divider,
    },
    autoScrollToggleActive: {
      backgroundColor: palette.mushaf.titleBorderGold,
      borderColor: palette.mushaf.titleBorderGold,
    },
    autoScrollRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'center',
      gap: 6,
      marginTop: 8,
      paddingHorizontal: 6,
      paddingVertical: 5,
      borderRadius: 999,
      backgroundColor: palette.white,
      borderWidth: 1,
      borderColor: palette.mushaf.divider,
    },
    autoScrollRowLabel: {
      color: palette.mushaf.verseNumber,
      fontSize: 10,
      fontFamily: fontFamily.alexandriaBold,
      paddingHorizontal: 6,
    },
    autoScrollChip: {
      minWidth: 30,
      alignItems: 'center',
      paddingHorizontal: 9,
      paddingVertical: 5,
      borderRadius: 999,
    },
    autoScrollChipActive: {
      backgroundColor: palette.mushaf.titleBorderGold,
    },
    autoScrollChipText: {
      color: palette.mushaf.verseNumber,
      fontSize: 11,
      fontFamily: fontFamily.alexandriaBold,
      letterSpacing: 0.4,
    },
    autoScrollChipTextActive: {
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
      backgroundColor: palette.mushaf.divider,
    },
    pageBreakBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: palette.mushaf.divider,
      backgroundColor: palette.bg.mushaf,
    },
    pageBreakText: {
      fontSize: 11,
      color: palette.mushaf.verseNumber,
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
      color: palette.mushaf.verseNumber,
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
      backgroundColor: palette.mushaf.titleBorderGold,
      borderColor: palette.mushaf.titleBorderGold,
      shadowColor: palette.mushaf.titleBorderGold,
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
      color: palette.mushaf.borderDark,
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
      borderColor: palette.mushaf.divider,
      backgroundColor: palette.mushaf.bannerFill,
    },
    bookmarkCurrentBtnActive: {
      backgroundColor: palette.mushaf.titleBorderGold,
      borderColor: palette.mushaf.titleBorderGold,
    },
    bookmarkCurrentBtnText: {
      fontSize: 12,
      color: palette.mushaf.verseNumber,
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

    // ── Player settings sheet — reuses the bookmark sheet chrome above ─────────
    settingsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 14,
      gap: 12,
    },
    settingsRowLabel: {
      fontSize: 13,
      fontFamily: fontFamily.alexandriaMedium,
      color: palette.mushaf.borderDark,
    },
    settingsRowValue: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: 6,
    },
    settingsRowValueText: {
      flexShrink: 1,
      fontSize: 14,
      fontFamily: fontFamily.alexandriaBold,
      color: palette.mushaf.verseNumber,
      textAlign: 'right',
    },
    settingsSectionLabel: {
      fontSize: 12,
      fontFamily: fontFamily.alexandriaMedium,
      color: palette.mushaf.borderDark,
      marginTop: 4,
      marginBottom: 10,
    },
    settingsSpeedRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      marginBottom: 6,
    },
    settingsSpeedChip: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 999,
      backgroundColor: palette.mushaf.bannerFill,
      borderWidth: 1,
      borderColor: palette.mushaf.divider,
    },
    settingsSpeedChipActive: {
      backgroundColor: palette.mushaf.titleBorderGold,
      borderColor: palette.mushaf.titleBorderGold,
    },
    settingsSpeedChipText: {
      fontSize: 13,
      fontFamily: fontFamily.alexandriaBold,
      color: palette.mushaf.verseNumber,
    },
    settingsSpeedChipTextActive: {
      color: palette.text.onBrand,
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

    // ── Surah header (ListHeaderComponent) — meta caption + basmalah only;
    // the medallion itself is rendered separately as a fixed overlay outside
    // the ScrollView (see surahMedallionOverlay). Extra paddingTop clears the
    // space the medallion visually occupies so it doesn't cover this text. ──
    surahHeader: {
      alignItems: 'center',
      paddingTop: 36,
      paddingBottom: 20,
      paddingHorizontal: 20,
      gap: 18,
    },
    // Caption below the surah title.
    surahHeaderMeta: {
      fontSize: 12,
      lineHeight: 18,
      color: palette.text.tertiary,
      fontFamily: fontFamily.alexandriaLight,
      textAlign: 'center',
      marginTop: 8,
    },
    // ﷽ rendered as a single calligraphic ligature via Amiri font
    basmalah: {
      fontSize: 22,
      lineHeight: 40,
      color: palette.mushaf.ink,
      fontFamily: fontFamily.arabicBold,
      textAlign: 'center',
      paddingHorizontal: 2,
    },
    // Pulsing highlight when the reciter is reciting the basmalah (before verse 1 timestamp)
    basmalahActive: {
      color: palette.mushaf.accent,
    },

    // ── Verse list — continuous mushaf page layout ───────────────────────────
    verseList: {
      paddingTop: 4,
      paddingBottom: 180,
      // Clears the vertical scrollbar drawn at the scroll view's right edge
      // (paired with readerFrameContent's reduced paddingRight).
      paddingRight: 5,
    },
    // ── Inline Mushaf mode (showEnglish = false) ─────────────────────────────
    // All verses flow as a single RTL paragraph — no block breaks between ayat.
    verseBlock: {
      paddingHorizontal: 3,
      paddingTop: 8,
    },
    // ── Block mode (showEnglish = true) — one View per verse ─────────────────
    // borderRightWidth always present to prevent layout shifts on active toggle.
    verseRow: {
      paddingVertical: 4,
      paddingHorizontal: 3,
      borderRightWidth: 3,
      borderRightColor: 'transparent',
    },
    verseRowActive: {
      backgroundColor: palette.bg.mushaf,
      borderRightColor: palette.mushaf.accent,
    },
    // Amiri Quranic text — large, generous line-height for harakat (diacritics)
    verseArabic: {
      fontSize: 24,
      lineHeight: 44,
      textAlign: 'right',
      writingDirection: 'rtl',
      color: theme.verseArabicColor,
      fontFamily: fontFamily.arabic,
    },
    // Block mode active: bold + color
    verseArabicActive: { color: palette.mushaf.accent, fontFamily: fontFamily.arabicBold },
    // Inline mode active: background highlight + color, no font-family change (would reflow entire paragraph)
    verseArabicActiveInline: {
      color: palette.mushaf.accent,
      backgroundColor: palette.bg.mushaf,
    },
    // Inline end-of-ayah marker ﴿n﴾ embedded within the Arabic text flow —
    // medallion gold, matching the ornamental border and the toolbar icons.
    verseEndMarker: {
      fontSize: 14,
      fontFamily: fontFamily.arabic,
      color: palette.mushaf.titleBorderGold,
    },
    verseEndMarkerActive: {
      color: palette.mushaf.verseNumber,
    },
    verseEnglish: {
      fontSize: 14,
      lineHeight: 22,
      color: palette.text.secondary,
      fontFamily: fontFamily.alexandria,
      marginTop: 8,
    },
    verseEnglishActive: {
      color: palette.mushaf.verseNumber,
      fontFamily: fontFamily.alexandriaMedium,
    },
    verseEnglishMissing: {
      fontSize: 12,
      color: palette.text.tertiary,
      fontFamily: fontFamily.alexandria,
      marginTop: 4,
      fontStyle: 'italic',
    },

    // ── Player — single play FAB in the bottom-right corner ────────────────────
    // Sits directly under the bookmark FAB (which is offset by playerHeight).
    // Progress + time live in the header's seek row; reciter, speed and offline
    // save live in PlayerSettingsModal (opened from the header's settings button).
    playerMini: {
      position: 'absolute',
      bottom: 0,
      right: 16,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      // elevation 4: renders above contentWrapper (elevation 0) on Android;
      // transparent bg → no shadow is drawn, only z-order changes.
      elevation: 4,
    },

    // Playback progress + times, pinned under the header toolbar.
    headerSeekRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingHorizontal: 16,
      paddingTop: 8,
    },
    // Smaller than the 36dp toolbar bubbles so the seek row stays slim.
    seekSettingsBtn: {
      width: 28,
      height: 28,
      borderRadius: 999,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: palette.mushaf.bannerFill,
      borderWidth: 1,
      borderColor: palette.mushaf.divider,
    },
    headerSeekTime: {
      fontSize: 10,
      lineHeight: 14,
      fontFamily: fontFamily.alexandria,
      color: palette.mushaf.verseNumber,
      fontVariant: ['tabular-nums'],
    },

    // Seek colours match the ornamental frame/medallion golds — the track
    // sits in the header, not the old dark player bar.
    seekTrack: {
      height: 4,
      backgroundColor: palette.mushaf.divider,
      borderRadius: 2,
      marginVertical: 4,
      position: 'relative',
      justifyContent: 'center',
    },
    seekFill: {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      backgroundColor: palette.mushaf.titleBorderGold,
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
      borderColor: palette.mushaf.titleBorderGold,
      shadowColor: palette.black,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      shadowRadius: 2,
      elevation: 3,
    },

    playButton: {
      width: 52,
      height: 52,
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
    },
    playButtonText: { fontSize: 20, color: palette.mushaf.titleBorderGold },

    playerErrorCompact: {
      padding: 8,
      borderRadius: 999,
      backgroundColor: ERROR_TINT_15,
    },

    cachedBadge: {
      backgroundColor: palette.mushaf.titleBorderGold,
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
      backgroundColor: palette.mushaf.titleBorderGold,
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
      color: palette.mushaf.titleBorderGold,
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
    // Inline Mushaf mode counterpart of verseSearchHighlight — background only,
    // no font change (would reflow the whole paragraph, same as active-inline)
    verseSearchHighlightInline: {
      backgroundColor: palette.secondaryGreen[25],
    },
    // The matched search word inside the highlighted verse — pale-gold wash +
    // marker brown, matching the Mushaf ornament palette
    verseWordHighlight: {
      backgroundColor: palette.mushaf.bannerFill,
      color: palette.mushaf.verseNumber,
    },
    // Matched word inside a search-result row (white sheet bg)
    searchResultMatch: {
      backgroundColor: palette.mushaf.bannerFill,
      color: palette.mushaf.verseNumber,
    },
  });
}
