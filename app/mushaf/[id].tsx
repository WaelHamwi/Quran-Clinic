import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  PanResponder,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { API_URL } from '@/services/api';
import { audioService } from '@/services/audioService';
import { offlineStorage } from '@/services/offlineStorage';
import { quranService } from '@/services/quranService';
import { useMushafContext } from '@/context/MushafContext';
import { ReciterPickerModal } from '@/components/mushaf/ReciterPickerModal';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { useAudio, PLAYBACK_SPEEDS, type PlaybackSpeed } from '@/hooks/useAudio';
import { useReciterAvailability } from '@/hooks/useReciterAvailability';
import { useSurah } from '@/hooks/useSurah';
import { useVerseTiming } from '@/hooks/useVerseTiming';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { palette } from '@/theme/colors';
import { createReaderStyles, READER_GRADIENT_COLORS } from '@/styles/reader.styles';
import {
  VERSES_PER_PAGE,
  chunkVersesIntoPages,
  getPageIndexForVerseIndex,
  getTotalPagesForSurah,
} from '@/utils/mushafPages';
import {
  addPageBookmark,
  getAllPageBookmarks,
  removePageBookmark,
  type PageBookmark,
} from '@/services/bookmarks';
import type { Verse } from '@/types/verse';
import type { Recitation } from '@/types/recitation';

const TOTAL_SURAHS = 114;
type DisplayMode = 'continuous' | 'pages';
type FontScale = 'sm' | 'md' | 'lg' | 'xl';
const FONT_SCALES: FontScale[] = ['sm', 'md', 'lg', 'xl'];
const ARABIC_FONT_SIZES: Record<FontScale, number> = { sm: 18, md: 22, lg: 26, xl: 32 };
const ARABIC_LINE_HEIGHTS: Record<FontScale, number> = { sm: 34, md: 42, lg: 50, xl: 60 };
const ENGLISH_FONT_SIZES: Record<FontScale, number> = { sm: 12, md: 14, lg: 16, xl: 18 };
const FONT_SCALE_LABELS: Record<FontScale, string> = { sm: 'S', md: 'M', lg: 'L', xl: 'XL' };

// Verse-reference pattern: "2:255", "2.255", "٢:٢٥٥" (after digit normalization)
const VERSE_REF_RE = /^(\d+)\s*[:：.]\s*(\d+)$/;
function normalizeArabicDigits(s: string): string {
  // Arabic-Indic digits U+0660–U+0669 → Western 0–9
  return s.replace(/[٠-٩]/g, (c) => String(c.codePointAt(0)! - 0x0660));
}

const SPEED_LABELS: Record<PlaybackSpeed, string> = {
  0.5:  '0.5×',
  0.75: '0.75×',
  1:    '1×',
  1.5:  '1.5×',
  2:    '2×',
};

const EASTERN_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'] as const;
function toEastern(n: number): string {
  return String(n).split('').map(d => EASTERN_DIGITS[+d]).join('');
}

function fmt(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, '0')}`;
}

// Resolve the streamable URI for a recitation.
// CDN/remote recitations expose an absolute `audio_url` we can stream directly —
// this also sidesteps the local API base, which is unreachable from a device
// when the backend isn't on the LAN (the recitation data itself may have arrived
// from production via the per-request fallback while API_URL still points local).
// Only backend-stored files (relative path) need the API proxy endpoint.
function resolveRecitationUri(recitation: Recitation): string {
  const url = recitation.audio_url ?? '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${API_URL}/recitations/${recitation.id}/audio`;
}

// ─── SurahHeader ─────────────────────────────────────────────────────────────
const SurahHeader = React.memo(function SurahHeader({
  surah,
  language,
  t,
  isBasmalahActive,
}: {
  surah: { id: number; name: { ar: string; en?: string | null }; transliteration: string; total_verses: number; type: string };
  language: 'ar' | 'en';
  t: { reader: { verses: string }; mushaf: { meccan: string; medinan: string } };
  isBasmalahActive: boolean;
}) {
  const { theme } = useTheme();
  const styles = useMemo(() => createReaderStyles(theme), [theme]);
  // Basmalah precedes every surah except Al-Fatiha (verse 1 IS the basmalah) and At-Tawbah (no basmalah)
  const showBasmalah = surah.id !== 1 && surah.id !== 9;

  return (
    <View style={styles.surahHeader}>
      {/* Double-frame calligraphic banner — outer ring + inner ring */}
      <View style={styles.surahHeaderBannerOuter}>
        <View style={styles.surahHeaderBanner}>
          <Text style={styles.surahHeaderName}>﴿ {surah.name.ar} ﴾</Text>
          <Text style={styles.surahHeaderMeta}>
            {surah.transliteration} · {toEastern(surah.total_verses)} {t.reader.verses} · {surah.type === 'meccan' ? t.mushaf.meccan : t.mushaf.medinan}
          </Text>
        </View>
      </View>
      {/* ﷽ — single Unicode ligature; Amiri renders it as full calligraphic bismillah.
          Highlighted while the reciter is reciting the basmalah (before verse 1 timing). */}
      {showBasmalah && (
        <Text style={[styles.basmalah, isBasmalahActive && styles.basmalahActive]}>﷽</Text>
      )}
    </View>
  );
});

// ─── SeekBar ──────────────────────────────────────────────────────────────────
const SeekBar = React.memo(function SeekBar({
  positionMillis,
  durationMillis,
  onSeek,
}: {
  positionMillis: number;
  durationMillis: number;
  onSeek: (ms: number) => void;
}) {
  const { theme } = useTheme();
  const styles = useMemo(() => createReaderStyles(theme), [theme]);

  const viewRef = useRef<View>(null);
  // Stores absolute screen position via measure() — more accurate than onLayout x during drag
  const trackRef = useRef({ pageX: 0, width: 1 });
  const durationRef = useRef(durationMillis);
  durationRef.current = durationMillis;
  const onSeekRef = useRef(onSeek);
  onSeekRef.current = onSeek;

  const [dragProgress, setDragProgress] = useState<number | null>(null);

  const pctFromPageX = (pageX: number) => {
    const { pageX: tx, width } = trackRef.current;
    return Math.max(0, Math.min(1, (pageX - tx) / width));
  };

  const panHandlers = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        setDragProgress(pctFromPageX(e.nativeEvent.pageX));
      },
      onPanResponderMove: (e) => {
        // pageX is absolute — stays correct as finger slides past the track edges
        setDragProgress(pctFromPageX(e.nativeEvent.pageX));
      },
      onPanResponderRelease: (e) => {
        const pct = pctFromPageX(e.nativeEvent.pageX);
        onSeekRef.current(pct * durationRef.current);
        setDragProgress(null);
      },
      onPanResponderTerminate: () => {
        setDragProgress(null);
      },
    })
  ).current;

  const progress =
    dragProgress !== null
      ? dragProgress
      : durationMillis > 0
      ? positionMillis / durationMillis
      : 0;

  const fillPct = `${(progress * 100).toFixed(2)}%`;

  return (
    <View
      ref={viewRef}
      style={styles.seekTrack}
      onLayout={() => {
        // measure() gives absolute pageX; onLayout only gives parent-relative position
        viewRef.current?.measure((_x, _y, width, _h, pageX) => {
          trackRef.current = { pageX, width: width || 1 };
        });
      }}
      {...panHandlers.panHandlers}
    >
      <View style={[styles.seekFill, { width: fillPct as any }]} />
      <View style={[styles.seekThumb, { left: fillPct as any }]} />
    </View>
  );
});

// ─── VerseRow ─────────────────────────────────────────────────────────────────
const VerseRow = React.memo(function VerseRow({
  item,
  showEnglish,
  isActive,
  fontScale,
  isSearchHighlight,
}: {
  item: Verse;
  showEnglish: boolean;
  isActive: boolean;
  fontScale: FontScale;
  isSearchHighlight: boolean;
}) {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const styles = useMemo(() => createReaderStyles(theme), [theme]);

  const hasEn = Boolean(item.text.en);
  const arFontOverride = fontScale !== 'md'
    ? { fontSize: ARABIC_FONT_SIZES[fontScale], lineHeight: ARABIC_LINE_HEIGHTS[fontScale] }
    : undefined;
  const enFontOverride = fontScale !== 'md'
    ? { fontSize: ENGLISH_FONT_SIZES[fontScale], lineHeight: Math.round(ENGLISH_FONT_SIZES[fontScale] * 1.6) }
    : undefined;
  return (
    <View style={[styles.verseRow, isActive && styles.verseRowActive, isSearchHighlight && styles.verseSearchHighlight]}>
      {/* Arabic verse text with inline end-of-ayah marker ﴿n﴾ */}
      <Text style={[styles.verseArabic, isActive && styles.verseArabicActive, arFontOverride]}>
        {item.text.ar}
        <Text style={[styles.verseEndMarker, isActive && styles.verseEndMarkerActive]}>
          {' ﴿'}{toEastern(item.verse_number)}{'﴾'}
        </Text>
      </Text>
      {showEnglish && hasEn && (
        <Text style={[styles.verseEnglish, isActive && styles.verseEnglishActive, enFontOverride]}>
          {item.text.en}
        </Text>
      )}
      {showEnglish && !hasEn && (
        <Text style={styles.verseEnglishMissing}>{t.reader.translationMissing}</Text>
      )}
    </View>
  );
});

// ─── PageBreakMarker ─────────────────────────────────────────────────────────
const PageBreakMarker = React.memo(function PageBreakMarker({
  pageNumber,
  totalPages,
}: {
  pageNumber: number;
  totalPages: number;
}) {
  const { theme } = useTheme();
  const styles = useMemo(() => createReaderStyles(theme), [theme]);
  return (
    <View style={styles.pageBreak}>
      <View style={styles.pageBreakLine} />
      <View style={styles.pageBreakBadge}>
        <Text style={styles.pageBreakText}>
          {toEastern(pageNumber)} / {toEastern(totalPages)}
        </Text>
      </View>
      <View style={styles.pageBreakLine} />
    </View>
  );
});

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function MushafReaderScreen() {
  const { id, highlight } = useLocalSearchParams() as { id: string; highlight?: string };
  const surahId = Number(id);
  const highlightVerseNumber = highlight ? Number(highlight) : null;
  const router = useRouter();

  const { selectedReciterId, setSelectedReciterId, isContextReady } = useMushafContext();
  const { data: surah, isLoading, error, refetch: refetchSurah, isRefetching: isSurahRefetching } = useSurah(surahId);
  const audio = useAudio();
  const { theme } = useTheme();
  const { t, language, isArabic } = useLanguage();
  const { bottom: bottomInset, top: topInset } = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  const styles = useMemo(() => createReaderStyles(theme), [theme]);

  const [recitations, setRecitations] = useState<Recitation[]>([]);
  const [isLoadingRecitations, setIsLoadingRecitations] = useState(true);
  const [isRefreshingRecitations, setIsRefreshingRecitations] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isCached, setIsCached] = useState(false);
  const [showEnglish, setShowEnglish] = useState(false);
  const [activeVerseIndex, setActiveVerseIndex] = useState(-1);
  const [showReciterPicker, setShowReciterPicker] = useState(false);
  const [reciterSearch, setReciterSearch] = useState('');
  const [displayMode, setDisplayMode] = useState<DisplayMode>('continuous');
  const [bookmarks, setBookmarks] = useState<PageBookmark[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [bookmarkModalOpen, setBookmarkModalOpen] = useState(false);
  const [fontScale, setFontScale] = useState<FontScale>('md');
  const [fontScaleOpen, setFontScaleOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Verse[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchHighlightIndex, setSearchHighlightIndex] = useState(-1);

  const scrollRef = useRef<ScrollView>(null);
  const contentHeightRef = useRef(0);
  const lastScrolledIndexRef = useRef(-1);
  // Capture where the verse block starts and how tall it is (set via onLayout in JSX).
  // Used by scrollToVerseRef to place the active verse in the viewport.
  const versesTopRef = useRef(0);
  const versesHeightRef = useRef(0);
  const scrollToVerseRef = useRef((_idx: number) => {});
  const pagerRef = useRef<FlatList<Verse[]>>(null);
  const lastPageRef = useRef(-1);
  const currentPageRef = useRef(0);
  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 60 }).current;
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: Array<{ index: number | null }> }) => {
      const first = viewableItems[0];
      if (first && typeof first.index === 'number') {
        currentPageRef.current = first.index;
        setCurrentPageIndex(first.index);
      }
    }
  ).current;

  const currentRecitation = recitations.find((r) => r.reciter_id === selectedReciterId);

  // Detects reciters whose audio actually 404s for this surah so they can be
  // hidden from the picker (issue: don't show reciters not available here).
  const { unavailableReciterIds, markUnavailable } = useReciterAvailability(recitations);

  const reciters = useMemo(
    () =>
      recitations.flatMap((r) =>
        r.reciter && !unavailableReciterIds.has(r.reciter_id) ? [r.reciter] : []
      ),
    [recitations, unavailableReciterIds]
  );

  const filteredReciters = useMemo(() => {
    const q = reciterSearch.trim().toLowerCase();
    if (!q) return reciters;
    return reciters.filter(
      (r) => r.name.ar.toLowerCase().includes(q) || (r.name.en ?? '').toLowerCase().includes(q)
    );
  }, [reciters, reciterSearch]);

  const handleReciterSelect = useCallback(
    (id: number | null) => {
      setSelectedReciterId(id);
      setShowReciterPicker(false);
      setReciterSearch('');
      audio.unload();
    },
    [setSelectedReciterId, audio]
  );

  // Precise per-verse timestamps from Quran.com v4 (same recitation ID the seeder uses)
  const { data: verseTiming } = useVerseTiming(surahId, currentRecitation?.reciter?.name?.en ?? undefined);

  // Text-length proportional fractions — fallback while verseTiming is loading
  const verseStartFractions = useMemo(() => {
    if (!surah) return [] as number[];
    const lengths = surah.verses.map((v) => Math.max(v.text.ar.replace(/\s/g, '').length, 8));
    const total = lengths.reduce((a, b) => a + b, 0);
    let cum = 0;
    return lengths.map((len) => { const s = cum / total; cum += len; return s; });
  }, [surah]);

  // Cumulative char offset before each verse — drives character-proportional scroll.
  // Far more accurate than verse-count ratio because verses vary widely in length.
  const verseCumChars = useMemo(() => {
    if (!surah) return [] as number[];
    let cum = 0;
    return surah.verses.map((v) => { const s = cum; cum += v.text.ar.length; return s; });
  }, [surah]);

  const totalChars = useMemo(
    () => (surah ? Math.max(1, surah.verses.reduce((s, v) => s + v.text.ar.length, 0)) : 1),
    [surah]
  );

  const pages = useMemo<Verse[][]>(() => {
    if (!surah) return [];
    return chunkVersesIntoPages(surah.verses);
  }, [surah]);

  const totalPages = useMemo(
    () => (surah ? getTotalPagesForSurah(surah.verses.length) : 0),
    [surah]
  );

  // Always-fresh lookup function in a ref — handleSeek/handleSkip read this without
  // needing verseTiming in their own deps (avoids SeekBar re-renders on timing load).
  const getIdxAtMsRef = useRef<(ms: number) => number>(() => -1);
  getIdxAtMsRef.current = (posMs: number): number => {
    if (verseTiming && verseTiming.length > 0) {
      for (let i = verseTiming.length - 1; i >= 0; i--) {
        if (posMs >= verseTiming[i].timestampFrom) return i;
      }
      return 0;
    }
    if (verseStartFractions.length === 0 || audio.durationMillis === 0) return -1;
    const progress = posMs / audio.durationMillis;
    for (let i = verseStartFractions.length - 1; i >= 0; i--) {
      if (progress >= verseStartFractions[i]) return i;
    }
    return 0;
  };

  // Always-fresh scroll helper — reads verseCumChars/totalChars at call time so
  // handleSeek and handleSkip don't need those values in their useCallback deps.
  scrollToVerseRef.current = (idx: number) => {
    if (idx < 0) return;
    const blockH = versesHeightRef.current;
    const blockTop = versesTopRef.current;
    const targetY = blockH > 0
      ? blockTop + (verseCumChars[idx] ?? 0) / totalChars * blockH - 150
      : idx * 90;
    scrollRef.current?.scrollTo({ y: Math.max(0, targetY), animated: true });
  };

  useEffect(() => {
    getAllPageBookmarks().then(setBookmarks).catch(() => {});
  }, []);

  // Auto-scroll and highlight the verse requested via the ?highlight= URL param
  useEffect(() => {
    if (!surah || !highlightVerseNumber) return;
    const idx = surah.verses.findIndex((v) => v.verse_number === highlightVerseNumber);
    if (idx < 0) return;
    setSearchHighlightIndex(idx);
    const timer = setTimeout(() => scrollToVerseRef.current(idx), 700);
    return () => clearTimeout(timer);
  }, [surah?.id, highlightVerseNumber]);

  useEffect(() => {
    setCurrentPageIndex(0);
    currentPageRef.current = 0;
  }, [surahId]);

  useEffect(() => {
    setIsLoadingRecitations(true);
    quranService
      .getSurahRecitations(surahId)
      .then((res) => {
        const list = res.data ?? [];
        setRecitations(list);
        offlineStorage.saveRecitations(list).catch(() => {});
      })
      .catch(async () => {
        const cached = await offlineStorage.getRecitationsBySurah(surahId);
        setRecitations(cached);
      })
      .finally(() => setIsLoadingRecitations(false));
  }, [surahId]);

  useEffect(() => {
    if (!currentRecitation || !selectedReciterId) return;
    audioService.isAudioCached(surahId, selectedReciterId).then(setIsCached);
  }, [currentRecitation, surahId, selectedReciterId]);

  useEffect(() => {
    return () => {
      audio.unload();
    };
  }, []);

  useEffect(() => {
    if (!surah || audio.durationMillis === 0) { setActiveVerseIndex(-1); return; }
    const idx = getIdxAtMsRef.current(audio.positionMillis);
    if (idx < 0) return;
    // Update highlight — React bails out if idx hasn't changed, so no extra re-render
    setActiveVerseIndex(idx);
    // Scroll is a side-effect and must live outside the setState callback
    if (audio.isPlaying && idx !== lastScrolledIndexRef.current) {
      lastScrolledIndexRef.current = idx;
      scrollToVerseRef.current(idx);
    }
  }, [audio.positionMillis, audio.durationMillis, audio.isPlaying, surah]);

  useEffect(() => {
    if (!audio.isPlaying) {
      lastScrolledIndexRef.current = -1;
      lastPageRef.current = -1;
    }
  }, [audio.isPlaying]);

  useEffect(() => {
    if (displayMode !== 'pages' || activeVerseIndex < 0 || !audio.isPlaying) return;
    const page = getPageIndexForVerseIndex(activeVerseIndex);
    if (page === lastPageRef.current) return;
    lastPageRef.current = page;
    pagerRef.current?.scrollToIndex({ index: page, animated: true });
  }, [activeVerseIndex, displayMode, audio.isPlaying]);

  // When the selected reciter's audio fails to load (e.g. CDN 404), hide that
  // reciter from the picker so the user can pick one that actually works.
  useEffect(() => {
    if (audio.hasError && selectedReciterId) {
      markUnavailable(selectedReciterId, currentRecitation?.audio_url);
    }
  }, [audio.hasError, selectedReciterId, currentRecitation?.audio_url, markUnavailable]);

  const handlePlay = useCallback(async () => {
    if (!currentRecitation || !selectedReciterId) return;
    // No playable audio for this reciter+surah — guide the user to pick another
    // instead of retrying a URL that will only fail again.
    if (audio.hasError || unavailableReciterIds.has(selectedReciterId)) {
      setShowReciterPicker(true);
      return;
    }
    if (audio.isPlaying) {
      await audio.pause();
      return;
    }
    // Only load if no source has been set — prevents restarting from 0 on every resume
    if (!audio.hasSource) {
      const cached = await audioService.isAudioCached(surahId, selectedReciterId);
      const uri = cached
        ? audioService.getLocalPath(surahId, selectedReciterId)
        : resolveRecitationUri(currentRecitation);
      await audio.loadAudio(uri);
    }
    await audio.play();
  }, [currentRecitation, selectedReciterId, surahId, audio, unavailableReciterIds]);

  const handleDownload = useCallback(async () => {
    if (!currentRecitation || !selectedReciterId) return;
    setIsDownloading(true);
    try {
      await audioService.downloadAudio(
        resolveRecitationUri(currentRecitation),
        surahId,
        selectedReciterId,
        setDownloadProgress
      );
      setIsCached(true);
    } finally {
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  }, [currentRecitation, selectedReciterId, surahId]);

  const handleSeek = useCallback(
    (ms: number) => {
      const clipped = Math.max(0, ms);
      audio.seekTo(clipped);
      // Snap highlight immediately — don't wait for positionMillis to async-update
      const idx = getIdxAtMsRef.current(clipped);
      if (idx >= 0) {
        setActiveVerseIndex(idx);
        lastScrolledIndexRef.current = idx;
        scrollToVerseRef.current(idx);
      }
    },
    [audio]
  );

  const handleSkip = useCallback(
    (deltaSecs: number) => {
      const newMs = Math.max(0, audio.positionMillis + deltaSecs * 1000);
      audio.seekTo(newMs);
      const idx = getIdxAtMsRef.current(newMs);
      if (idx >= 0) {
        setActiveVerseIndex(idx);
        lastScrolledIndexRef.current = idx;
        scrollToVerseRef.current(idx);
      }
    },
    [audio]
  );

  const handleSetRate = useCallback((spd: PlaybackSpeed) => {
    audio.setRate(spd);
  }, [audio]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshingRecitations(true);
    try {
      await refetchSurah();
      const res = await quranService.getSurahRecitations(surahId);
      const list = res.data ?? [];
      setRecitations(list);
      offlineStorage.saveRecitations(list).catch(() => {});
    } catch {
      // keep existing data on failure
    } finally {
      setIsRefreshingRecitations(false);
    }
  }, [refetchSurah, surahId]);

  const goToPrev = useCallback(() => {
    if (surahId > 1) router.replace(`/mushaf/${surahId - 1}` as any);
  }, [surahId, router]);

  const goToNext = useCallback(() => {
    if (surahId < TOTAL_SURAHS) router.replace(`/mushaf/${surahId + 1}` as any);
  }, [surahId, router]);

  const isCurrentBookmarked = useMemo(
    () => bookmarks.some((b) => b.surahId === surahId && b.pageIndex === currentPageIndex),
    [bookmarks, surahId, currentPageIndex]
  );

  // The in-reader sheet only lists pages bookmarked within THIS surah.
  // (The global list of every bookmarked page lives in the Mushaf tab's "My Reads".)
  const surahBookmarks = useMemo(
    () => bookmarks.filter((b) => b.surahId === surahId),
    [bookmarks, surahId]
  );

  const handleToggleBookmark = useCallback(async () => {
    const next = isCurrentBookmarked
      ? await removePageBookmark(surahId, currentPageIndex)
      : await addPageBookmark(surahId, currentPageIndex);
    setBookmarks(next);
  }, [isCurrentBookmarked, surahId, currentPageIndex]);

  const handleGoToBookmark = useCallback((b: PageBookmark) => {
    setBookmarkModalOpen(false);
    if (b.surahId !== surahId) {
      router.replace(`/mushaf/${b.surahId}` as any);
      return;
    }
    currentPageRef.current = b.pageIndex;
    setCurrentPageIndex(b.pageIndex);
    if (displayMode === 'pages') {
      pagerRef.current?.scrollToIndex({ index: b.pageIndex, animated: true });
    } else {
      const pageH = versesHeightRef.current > 0 && pages.length > 0
        ? versesHeightRef.current / pages.length
        : 0;
      const y = versesTopRef.current + pageH * b.pageIndex - 16;
      scrollRef.current?.scrollTo({ y: Math.max(0, y), animated: true });
    }
  }, [surahId, displayMode, pages.length, router]);

  const handleSearch = useCallback(
    async (rawQuery: string) => {
      const q = normalizeArabicDigits(rawQuery.trim());
      if (!q) return;
      const match = q.match(VERSE_REF_RE);
      if (match) {
        const sid = Number(match[1]);
        const vnum = Number(match[2]);
        if (sid >= 1 && sid <= 114 && vnum >= 1) {
          setSearchOpen(false);
          setSearchQuery('');
          setSearchResults(null);
          if (sid === surahId && surah) {
            const idx = surah.verses.findIndex((v) => v.verse_number === vnum);
            if (idx >= 0) {
              setSearchHighlightIndex(idx);
              scrollToVerseRef.current(idx);
            }
          } else {
            router.replace(`/mushaf/${sid}?highlight=${vnum}` as any);
          }
          return;
        }
      }
      if (q.length < 2) return;
      setIsSearching(true);
      try {
        const res = await quranService.searchVerses(rawQuery.trim());
        setSearchResults(res.data ?? []);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    },
    [surahId, surah, router]
  );

  const handleSearchResultPress = useCallback(
    (result: Verse) => {
      setSearchOpen(false);
      setSearchQuery('');
      setSearchResults(null);
      if (result.surah_id === surahId && surah) {
        const idx = surah.verses.findIndex((v) => v.id === result.id);
        if (idx >= 0) {
          setSearchHighlightIndex(idx);
          scrollToVerseRef.current(idx);
        }
      } else {
        router.replace(`/mushaf/${result.surah_id}?highlight=${result.verse_number}` as any);
      }
    },
    [surahId, surah, router]
  );

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={styles.loadingText}>{t.reader.loading}</Text>
      </View>
    );
  }

  if (error || !surah) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{t.reader.error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => refetchSurah()}>
          <Text style={styles.retryBtnText}>{t.reader.retry}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const hasAudio = audio.durationMillis > 0;

  // The selected reciter has no playable audio for this surah — either the load
  // already failed, or the availability probe confirmed a 4xx ahead of time.
  const selectedReciterUnavailable =
    selectedReciterId != null && unavailableReciterIds.has(selectedReciterId);
  const showAudioError = audio.hasError || selectedReciterUnavailable;

  // True while the reciter is saying the basmalah before verse 1.
  // Two cases:
  //   • Timing loaded: active while positionMillis < verseTiming[0].timestampFrom (exact phase)
  //   • Timing loading: active for the first 3 s so the ﷽ lights up immediately on play
  const timingLoaded = verseTiming != null && verseTiming.length > 0;
  const firstVerseMs = timingLoaded ? verseTiming![0].timestampFrom : 0;
  const isBasmalahPhase = surah.id !== 1 && surah.id !== 9; // Fatiha v1 IS basmalah; Tawbah has none
  const isBasmalahActive =
    audio.isPlaying &&
    isBasmalahPhase &&
    (timingLoaded
      ? firstVerseMs > 0 && audio.positionMillis < firstVerseMs   // exact window
      : audio.positionMillis < 3000);                             // fallback: assume ≤3 s bismillah

  return (
    <LinearGradient
      colors={READER_GRADIENT_COLORS}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.container}
    >

      {/* ── Figma 18085:1435 — white glass card over gradient ─────────────── */}
      <View style={styles.contentWrapper}>

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <View style={styles.header}>
          {/* Tier 1 — surah navigation (prev · title · next) */}
          <View style={[styles.navRow, isArabic && styles.rowRtl]}>
            <TouchableOpacity
              style={[styles.navBtn, surahId <= 1 && styles.navBtnDisabled]}
              onPress={goToPrev}
              disabled={surahId <= 1}
            >
              <Ionicons
                name={isArabic ? 'chevron-forward' : 'chevron-back'}
                size={22}
                color={palette.brand[500]}
              />
            </TouchableOpacity>

            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle} numberOfLines={1}>{surah.name[language]}</Text>
              <Text style={styles.headerSub} numberOfLines={1}>
                {surah.transliteration} · {surah.total_verses} {t.reader.verses}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.navBtn, surahId >= TOTAL_SURAHS && styles.navBtnDisabled]}
              onPress={goToNext}
              disabled={surahId >= TOTAL_SURAHS}
            >
              <Ionicons
                name={isArabic ? 'chevron-back' : 'chevron-forward'}
                size={22}
                color={palette.brand[500]}
              />
            </TouchableOpacity>
          </View>

          {/* Tier 2 — reading toolbar (translation · layout · font · search) */}
          <View style={[styles.toolbarRow, isArabic && styles.rowRtl]}>
            <TouchableOpacity
              style={[styles.langToggle, showEnglish && styles.langToggleActive]}
              onPress={() => setShowEnglish((v) => !v)}
            >
              <Text style={[styles.langToggleText, showEnglish && styles.langToggleTextActive]}>
                {showEnglish ? 'EN' : 'AR'}
              </Text>
            </TouchableOpacity>

            {/* Reading direction — vertical scroll ↕ vs horizontal page-turn ↔.
                Segmented control: drives the same displayMode, no logic change. */}
            <View style={styles.modeSegment}>
              <TouchableOpacity
                style={[styles.modeSegmentBtn, displayMode === 'continuous' && styles.modeSegmentBtnActive]}
                onPress={() => setDisplayMode('continuous')}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel={t.reader.readVertical}
              >
                <Ionicons
                  name="swap-vertical"
                  size={17}
                  color={displayMode === 'continuous' ? palette.text.onBrand : palette.brand[500]}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modeSegmentBtn, displayMode === 'pages' && styles.modeSegmentBtnActive]}
                onPress={() => setDisplayMode('pages')}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel={t.reader.readHorizontal}
              >
                <Ionicons
                  name="swap-horizontal"
                  size={17}
                  color={displayMode === 'pages' ? palette.text.onBrand : palette.brand[500]}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.fontSizeToggle, fontScaleOpen && styles.fontSizeToggleActive]}
              onPress={() => setFontScaleOpen((v) => !v)}
            >
              <Ionicons
                name="text-outline"
                size={17}
                color={fontScaleOpen ? palette.text.onBrand : palette.brand[500]}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modeToggle}
              onPress={() => setSearchOpen(true)}
            >
              <Ionicons name="search-outline" size={18} color={palette.brand[500]} />
            </TouchableOpacity>
          </View>

          {/* Font scale picker — inline, closes on selection */}
          {fontScaleOpen && (
            <View style={styles.fontSizeRow}>
              {FONT_SCALES.map((scale) => {
                const active = fontScale === scale;
                return (
                  <TouchableOpacity
                    key={scale}
                    style={[styles.fontSizeChip, active && styles.fontSizeChipActive]}
                    onPress={() => { setFontScale(scale); setFontScaleOpen(false); }}
                  >
                    <Text style={[styles.fontSizeChipText, active && styles.fontSizeChipTextActive]}>
                      {FONT_SCALE_LABELS[scale]}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* ── Verse list ────────────────────────────────────────────────────── */}
        {displayMode === 'continuous' ? (
        <ScrollView
          ref={scrollRef}
          style={{ flex: 1 }}
          contentContainerStyle={styles.verseList}
          onContentSizeChange={(_w, h) => { contentHeightRef.current = h; }}
          onScroll={(e) => {
            const y = e.nativeEvent.contentOffset.y;
            if (pages.length > 0 && versesHeightRef.current > 0) {
              const relativeY = Math.max(0, y - versesTopRef.current);
              const pageH = versesHeightRef.current / pages.length;
              const idx = Math.max(0, Math.min(pages.length - 1, Math.floor(relativeY / pageH)));
              if (idx !== currentPageRef.current) {
                currentPageRef.current = idx;
                setCurrentPageIndex(idx);
              }
            }
          }}
          scrollEventThrottle={120}
          refreshControl={
            <RefreshControl
              refreshing={isSurahRefetching || isRefreshingRecitations}
              onRefresh={handleRefresh}
              tintColor={theme.primary}
              colors={[theme.primary]}
              progressBackgroundColor={theme.surface}
            />
          }
        >
          <SurahHeader surah={surah} language={language} t={t} isBasmalahActive={isBasmalahActive} />

          {/* onLayout captures where verses start and how tall the block is —
              used by scrollToVerseRef for character-proportional auto-scroll */}
          <View
            onLayout={(e) => {
              versesTopRef.current = e.nativeEvent.layout.y;
              versesHeightRef.current = e.nativeEvent.layout.height;
            }}
          >
            {showEnglish ? (
              /* Block mode — page-broken every VERSES_PER_PAGE verses */
              surah.verses.map((verse, index) => (
                <React.Fragment key={verse.id}>
                  {index > 0 && index % VERSES_PER_PAGE === 0 && (
                    <PageBreakMarker
                      pageNumber={index / VERSES_PER_PAGE + 1}
                      totalPages={totalPages}
                    />
                  )}
                  <VerseRow
                    item={verse}
                    showEnglish
                    isActive={!isBasmalahActive && index === activeVerseIndex}
                    fontScale={fontScale}
                    isSearchHighlight={index === searchHighlightIndex}
                  />
                </React.Fragment>
              ))
            ) : (
              /* Inline Mushaf mode — each Mushaf page is its own paragraph block */
              <View style={styles.verseBlock}>
                {pages.map((pageVerses, pageIdx) => (
                  <React.Fragment key={`vpage-${pageIdx}`}>
                    {pageIdx > 0 && (
                      <PageBreakMarker pageNumber={pageIdx + 1} totalPages={totalPages} />
                    )}
                    <Text style={[styles.verseArabic, fontScale !== 'md' && { fontSize: ARABIC_FONT_SIZES[fontScale], lineHeight: ARABIC_LINE_HEIGHTS[fontScale] }]}>
                      {pageVerses.map((verse, i) => {
                        const verseIdx = pageIdx * VERSES_PER_PAGE + i;
                        const isActive = !isBasmalahActive && verseIdx === activeVerseIndex;
                        return (
                          <Text
                            key={verse.id}
                            style={isActive ? styles.verseArabicActiveInline : undefined}
                          >
                            {verse.text.ar}
                            <Text style={[styles.verseEndMarker, isActive && styles.verseEndMarkerActive]}>
                              {' ﴿'}{toEastern(verse.verse_number)}{'﴾ '}
                            </Text>
                          </Text>
                        );
                      })}
                    </Text>
                  </React.Fragment>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
        ) : (
          <FlatList
            ref={pagerRef}
            data={pages}
            keyExtractor={(_, i) => `page-${i}`}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            inverted={isArabic}
            initialScrollIndex={getPageIndexForVerseIndex(Math.max(0, activeVerseIndex))}
            viewabilityConfig={viewabilityConfig}
            onViewableItemsChanged={onViewableItemsChanged}
            getItemLayout={(_, index) => ({ length: windowWidth, offset: windowWidth * index, index })}
            onScrollToIndexFailed={(info) => {
              setTimeout(() => {
                pagerRef.current?.scrollToOffset({ offset: windowWidth * info.index, animated: false });
              }, 100);
            }}
            renderItem={({ item: pageVerses, index: pageIdx }) => (
              <ScrollView
                style={{ width: windowWidth }}
                contentContainerStyle={styles.pageContent}
                showsVerticalScrollIndicator={false}
              >
                {pageIdx === 0 && (
                  <SurahHeader
                    surah={surah}
                    language={language}
                    t={t}
                    isBasmalahActive={isBasmalahActive}
                  />
                )}
                {showEnglish ? (
                  pageVerses.map((verse, i) => {
                    const verseIdx = pageIdx * VERSES_PER_PAGE + i;
                    return (
                      <VerseRow
                        key={verse.id}
                        item={verse}
                        showEnglish
                        isActive={!isBasmalahActive && verseIdx === activeVerseIndex}
                        fontScale={fontScale}
                        isSearchHighlight={verseIdx === searchHighlightIndex}
                      />
                    );
                  })
                ) : (
                  <View style={styles.verseBlock}>
                    <Text style={[styles.verseArabic, fontScale !== 'md' && { fontSize: ARABIC_FONT_SIZES[fontScale], lineHeight: ARABIC_LINE_HEIGHTS[fontScale] }]}>
                      {pageVerses.map((verse, i) => {
                        const verseIdx = pageIdx * VERSES_PER_PAGE + i;
                        const isActive = !isBasmalahActive && verseIdx === activeVerseIndex;
                        return (
                          <Text key={verse.id} style={isActive ? styles.verseArabicActiveInline : undefined}>
                            {verse.text.ar}
                            <Text style={[styles.verseEndMarker, isActive && styles.verseEndMarkerActive]}>
                              {' ﴿'}{toEastern(verse.verse_number)}{'﴾ '}
                            </Text>
                          </Text>
                        );
                      })}
                    </Text>
                  </View>
                )}
                <View style={styles.pageIndicator}>
                  <Text style={styles.pageIndicatorText}>
                    ﴾ {toEastern(pageIdx + 1)} / {toEastern(totalPages)} ﴿
                  </Text>
                </View>
              </ScrollView>
            )}
          />
        )}

        {/* Bookmark FAB — tap to open the bookmark sheet */}
        <TouchableOpacity
          style={[
            styles.bookmarkFab,
            isCurrentBookmarked && styles.bookmarkFabActive,
            { bottom: currentRecitation ? 210 : 70 },
          ]}
          onPress={() => setBookmarkModalOpen(true)}
          activeOpacity={0.8}
        >
          <Ionicons
            name={isCurrentBookmarked ? 'bookmark' : 'bookmark-outline'}
            size={22}
            color={isCurrentBookmarked ? palette.text.onBrand : palette.brand[500]}
          />
        </TouchableOpacity>

      </View>

      {/* ── Player ──────────────────────────────────────────────────────────── */}
      {currentRecitation ? (
        <View style={[styles.player, { paddingBottom: Math.max(bottomInset, 24) }]}>
          <View style={styles.playerTopRow}>
            <TouchableOpacity
              style={styles.playerReciterBlock}
              onPress={() => setShowReciterPicker(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.playerReciterLabel}>
                {'🎙  ' + t.reader.reciter.toUpperCase()}
              </Text>
              <Text style={styles.playerReciter} numberOfLines={1}>
                {currentRecitation.reciter?.name?.[language] ?? '—'}
              </Text>
            </TouchableOpacity>
            {isCached ? (
              <View style={styles.cachedBadge}>
                <Text style={styles.cachedText}>{t.reader.saved}</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.downloadButton}
                onPress={handleDownload}
                disabled={isDownloading}
              >
                <Text style={styles.downloadText}>
                  {isDownloading ? `${Math.round(downloadProgress * 100)}%` : t.reader.save}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {hasAudio && (
            <SeekBar
              positionMillis={audio.positionMillis}
              durationMillis={audio.durationMillis}
              onSeek={handleSeek}
            />
          )}
          {!hasAudio && <View style={styles.seekTrackEmpty} />}

          <View style={styles.timeRow}>
            <Text style={styles.timeText}>{fmt(audio.positionMillis)}</Text>
            <Text style={styles.timeText}>{fmt(audio.durationMillis)}</Text>
          </View>

          {showAudioError && (
            <TouchableOpacity
              style={[styles.playerError, isArabic && styles.rowRtl]}
              onPress={() => setShowReciterPicker(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="alert-circle-outline" size={18} color={palette.text.onBrand} />
              <Text style={styles.playerErrorText}>{t.reader.recitationUnavailable}</Text>
              <Ionicons
                name={isArabic ? 'chevron-back' : 'chevron-forward'}
                size={16}
                color={palette.text.onBrand}
              />
            </TouchableOpacity>
          )}

          <View style={styles.controls}>
            <TouchableOpacity
              style={styles.skipBtn}
              onPress={() => handleSkip(-5)}
              disabled={!hasAudio}
            >
              <Text style={styles.skipBtnText}>−5s</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.playButton}
              onPress={handlePlay}
              disabled={audio.isLoading}
            >
              {audio.isLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.playButtonText}>{audio.isPlaying ? '⏸' : '▶'}</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.skipBtn}
              onPress={() => handleSkip(5)}
              disabled={!hasAudio}
            >
              <Text style={styles.skipBtnText}>+5s</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.speedRow}>
            {PLAYBACK_SPEEDS.map((spd) => {
              const active = audio.rate === spd;
              return (
                <TouchableOpacity
                  key={spd}
                  style={[styles.speedChip, active && styles.speedChipActive]}
                  onPress={() => handleSetRate(spd)}
                >
                  <Text style={[styles.speedChipText, active && styles.speedChipTextActive]}>
                    {SPEED_LABELS[spd]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      ) : isLoadingRecitations || !isContextReady ? null : (
        <TouchableOpacity
          style={[styles.noReciterBanner, { paddingBottom: Math.max(bottomInset, 14) }]}
          onPress={() => setShowReciterPicker(true)}
          activeOpacity={0.7}
        >
          <View style={[styles.noReciterRow, isArabic && { flexDirection: 'row-reverse' }]}>
            <Ionicons name="mic-outline" size={16} color={palette.brand[500]} />
            <Text style={styles.noReciterText}>{t.reader.selectReciterHint}</Text>
            <Ionicons name={isArabic ? 'chevron-back' : 'chevron-forward'} size={14} color={palette.brand[500]} />
          </View>
        </TouchableOpacity>
      )}
      <Modal
        visible={bookmarkModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setBookmarkModalOpen(false)}
      >
        <Pressable style={styles.bookmarkOverlay} onPress={() => setBookmarkModalOpen(false)}>
          <Pressable style={styles.bookmarkSheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.bookmarkSheetHandle} />
            <Text style={styles.bookmarkSheetTitle}>{t.reader.bookmarks}</Text>

            <View style={styles.bookmarkCurrentRow}>
              <Text style={styles.bookmarkCurrentLabel}>
                {t.reader.page} {toEastern(currentPageIndex + 1)} / {toEastern(totalPages)}
              </Text>
              <TouchableOpacity
                style={[styles.bookmarkCurrentBtn, isCurrentBookmarked && styles.bookmarkCurrentBtnActive]}
                onPress={handleToggleBookmark}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={isCurrentBookmarked ? 'bookmark' : 'bookmark-outline'}
                  size={14}
                  color={isCurrentBookmarked ? palette.text.onBrand : palette.brand[500]}
                />
                <Text style={[styles.bookmarkCurrentBtnText, isCurrentBookmarked && styles.bookmarkCurrentBtnTextActive]}>
                  {isCurrentBookmarked ? t.reader.removeBookmark : t.reader.bookmarkThisPage}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.bookmarkDivider} />

            {surahBookmarks.length === 0 ? (
              <Text style={styles.bookmarkListEmpty}>{t.reader.noBookmarks}</Text>
            ) : (
              <ScrollView style={styles.bookmarkList}>
                {surahBookmarks.map((b) => (
                  <TouchableOpacity
                    key={`${b.surahId}-${b.pageIndex}`}
                    style={[
                      styles.bookmarkListItem,
                      isArabic && { flexDirection: 'row-reverse' },
                    ]}
                    onPress={() => handleGoToBookmark(b)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="bookmark" size={14} color={palette.brand[500]} />
                    <Text style={styles.bookmarkListItemText}>
                      {t.reader.page} {toEastern(b.pageIndex + 1)} / {toEastern(totalPages)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </Pressable>
        </Pressable>
      </Modal>
      <ReciterPickerModal
        visible={showReciterPicker}
        onClose={() => { setShowReciterPicker(false); setReciterSearch(''); }}
        filteredReciters={filteredReciters}
        selectedReciterId={selectedReciterId}
        onSelect={handleReciterSelect}
        reciterSearch={reciterSearch}
        onSearchChange={setReciterSearch}
      />

      {/* ── Verse search modal — top-anchored so the keyboard never covers it ──── */}
      <Modal
        visible={searchOpen}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => { setSearchOpen(false); setSearchQuery(''); setSearchResults(null); }}
      >
        <Pressable
          style={styles.searchOverlay}
          onPress={() => { setSearchOpen(false); setSearchQuery(''); setSearchResults(null); }}
        >
          <Pressable
            style={[styles.searchSheet, { marginTop: topInset + 8 }]}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={styles.bookmarkSheetTitle}>{t.reader.searchTitle}</Text>

            <View style={styles.searchInputRow}>
              <TouchableOpacity
                style={styles.searchClearBtn}
                onPress={() => handleSearch(searchQuery)}
                hitSlop={8}
              >
                <Ionicons name="search" size={18} color={palette.brand[500]} />
              </TouchableOpacity>
              <TextInput
                style={[styles.searchInput, isArabic && { textAlign: 'right' }]}
                placeholder={t.reader.searchPlaceholder}
                placeholderTextColor={palette.text.placeholder}
                value={searchQuery}
                onChangeText={(text) => { setSearchQuery(text); setSearchResults(null); }}
                onSubmitEditing={(e) => handleSearch(e.nativeEvent.text)}
                returnKeyType="search"
                autoFocus
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  style={styles.searchClearBtn}
                  onPress={() => { setSearchQuery(''); setSearchResults(null); }}
                >
                  <Ionicons name="close-circle" size={18} color={palette.text.tertiary} />
                </TouchableOpacity>
              )}
            </View>

            <Text style={styles.searchHintText}>{t.reader.searchHint}</Text>

            {isSearching ? (
              <ActivityIndicator color={palette.brand[500]} style={{ marginTop: 24 }} />
            ) : searchResults !== null && searchResults.length > 0 ? (
              <FlatList
                data={searchResults}
                keyExtractor={(item) => String(item.id)}
                style={styles.searchResultList}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.searchResultItem}
                    onPress={() => handleSearchResultPress(item)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.searchResultArabic} numberOfLines={2}>
                      {item.text.ar}
                    </Text>
                    {Boolean(item.text.en) && (
                      <Text style={styles.searchResultEnglish} numberOfLines={1}>
                        {item.text.en}
                      </Text>
                    )}
                    <Text style={styles.searchResultMeta}>
                      {t.reader.verseRef(item.surah_id, item.verse_number)}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            ) : searchResults !== null ? (
              <Text style={styles.searchEmpty}>{t.reader.searchEmpty}</Text>
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>
    </LinearGradient>
  );
}
