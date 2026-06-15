import { StyleSheet } from 'react-native';
import type { Theme } from '@/theme/colors';
import { fontFamily } from '@/theme/typography';

const BRAND_25 = '#ebfafa';
const BRAND_500 = '#135452';
const TEXT_PRIMARY = '#181d27';
const TEXT_SECONDARY = '#414651';
const TEXT_TERTIARY = '#535862';
const TEXT_ON_BRAND = '#ffffff';
const TEXT_PLACEHOLDER = '#717680';
const BORDER_PRIMARY = '#d5d7da';
const BORDER_TERTIARY = '#f5f5f5';
const ERROR_500 = '#f04438';
const SHADOW = '#313940';
const WHITE = '#ffffff';
const BG_OVERLAY = 'rgba(255,255,255,0.5)';

export function createMushafStyles(_theme: Theme) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: WHITE },
    body: { flex: 1 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: {
      marginTop: 12,
      color: TEXT_TERTIARY,
      fontFamily: fontFamily.alexandria,
      fontSize: 14,
      lineHeight: 20,
    },
    errorText: {
      color: ERROR_500,
      fontSize: 16,
      lineHeight: 24,
      fontFamily: fontFamily.alexandria,
    },

    // ── Header — Figma node 18060:979 glass nav bar ───────────────────────────
    header: {
      backgroundColor: BG_OVERLAY,
      borderBottomWidth: 1,
      borderBottomColor: BORDER_TERTIARY,
      shadowColor: SHADOW,
      shadowOpacity: 0.08,
      shadowOffset: { width: 0, height: 16 },
      shadowRadius: 16,
      elevation: 6,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    headerRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    greetingText: {
      fontSize: 14,
      lineHeight: 20,
      color: TEXT_SECONDARY,
      fontFamily: fontFamily.alexandria,
    },
    avatarCircle: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: BRAND_25,
      borderWidth: 1,
      borderColor: BRAND_500,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: {
      fontSize: 12,
      color: BRAND_500,
      fontFamily: fontFamily.alexandriaBold,
      lineHeight: 14,
    },

    // ── Tab switcher — Figma pill group ──────────────────────────────────────
    tabRow: {
      paddingHorizontal: 16,
      paddingBottom: 12,
    },
    tabOuter: {
      flexDirection: 'row',
      backgroundColor: WHITE,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: BORDER_PRIMARY,
    },
    tab: {
      flex: 1,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 999,
      alignItems: 'center',
      justifyContent: 'center',
    },
    tabActive: {
      backgroundColor: BRAND_500,
    },
    tabText: {
      fontSize: 12,
      lineHeight: 18,
      color: TEXT_TERTIARY,
      fontFamily: fontFamily.alexandria,
      textAlign: 'center',
    },
    tabTextActive: {
      color: TEXT_ON_BRAND,
    },

    // ── Filter row — "السور" | "طريقة العرض" ─────────────────────────────────
    filterRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 4,
      marginBottom: 8,
    },
    filterLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    filterRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    filterLabel: {
      fontSize: 14,
      lineHeight: 20,
      color: TEXT_TERTIARY,
      fontFamily: fontFamily.alexandriaMedium,
    },
    filterLabelActive: {
      color: BRAND_500,
      fontFamily: fontFamily.alexandriaSemiBold,
    },

    // ── Reciter chip ──────────────────────────────────────────────────────────
    reciterChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginHorizontal: 16,
      marginBottom: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
      backgroundColor: WHITE,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: BORDER_PRIMARY,
    },
    reciterChipActive: {
      borderColor: BRAND_500,
      backgroundColor: BRAND_25,
    },
    reciterIcon: { fontSize: 14, lineHeight: 18 },
    reciterLabelWrap: { flex: 1 },
    reciterHint: {
      fontSize: 10,
      lineHeight: 14,
      color: TEXT_TERTIARY,
      fontFamily: fontFamily.alexandriaMedium,
      letterSpacing: 0.5,
      textTransform: 'uppercase',
    },
    reciterLabel: {
      fontSize: 13,
      lineHeight: 18,
      fontFamily: fontFamily.alexandriaSemiBold,
      color: TEXT_PRIMARY,
    },
    reciterLabelPlaceholder: {
      fontSize: 13,
      lineHeight: 18,
      fontFamily: fontFamily.alexandria,
      color: TEXT_PLACEHOLDER,
    },
    reciterChevron: { fontSize: 16, color: TEXT_TERTIARY, lineHeight: 20 },

    // ── Search bar ───────────────────────────────────────────────────────────
    searchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: 16,
      marginBottom: 8,
      paddingHorizontal: 14,
      height: 40,
      backgroundColor: WHITE,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: BORDER_PRIMARY,
      gap: 6,
    },
    searchInput: {
      flex: 1,
      fontSize: 14,
      fontFamily: fontFamily.alexandriaLight,
      color: TEXT_PRIMARY,
      padding: 0,
    },

    // ── My Readings empty state ──────────────────────────────────────────────
    myReadingsWrap: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
      paddingHorizontal: 32,
    },
    myReadingsEmptyText: {
      fontSize: 16,
      lineHeight: 24,
      fontFamily: fontFamily.alexandriaSemiBold,
      color: TEXT_PRIMARY,
      textAlign: 'center',
    },
    myReadingsHint: {
      fontSize: 13,
      lineHeight: 20,
      fontFamily: fontFamily.alexandria,
      color: TEXT_TERTIARY,
      textAlign: 'center',
    },

    // ── My Reads — bookmarked-page rows (all surahs) ───────────────────────────
    readRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderRadius: 12,
      backgroundColor: WHITE,
      borderWidth: 1,
      borderColor: BORDER_TERTIARY,
    },
    readRowTexts: { flex: 1, gap: 2 },
    readRowTitle: {
      fontSize: 15,
      fontFamily: fontFamily.alexandriaSemiBold,
      color: TEXT_PRIMARY,
    },
    readRowMeta: {
      fontSize: 12,
      fontFamily: fontFamily.alexandriaLight,
      color: TEXT_TERTIARY,
    },

    // ── Surah list ───────────────────────────────────────────────────────────
    list: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 100, gap: 4 },
    emptyText: {
      color: TEXT_TERTIARY,
      fontSize: 14,
      fontFamily: fontFamily.alexandria,
      marginTop: 40,
      textAlign: 'center',
    },
    footer: { paddingVertical: 16 },
    retryRow: { paddingVertical: 16, alignItems: 'center' },
    retryText: {
      color: ERROR_500,
      fontSize: 14,
      fontFamily: fontFamily.alexandriaMedium,
    },
  });
}
