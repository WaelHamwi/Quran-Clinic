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
