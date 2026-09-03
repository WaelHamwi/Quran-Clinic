import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { FlatList } from 'react-native';
import juzPages from '@/assets/data/qcf4-juz-pages.json';
import { QCF4_TOTAL_PAGES } from '@/constants/qcf4';
import { qcf4PageQueryOptions } from '@/services/mushaf/qcf4Pages';
import { getMadaniLastPage, saveMadaniLastPage } from '@/services/mushaf/lastRead';
import { useReaderOrientationLock } from '@/hooks/mushaf/useReaderOrientationLock';
import { useFontScale } from '@/hooks/mushaf/useFontScale';
import { useAutoScroll } from '@/hooks/mushaf/useAutoScroll';
import { useMadaniReaderAudio } from '@/hooks/mushaf/useMadaniReaderAudio';
import { useMadaniReaderBookmarks } from '@/hooks/mushaf/useMadaniReaderBookmarks';
import { useMadaniReaderSearch } from '@/hooks/mushaf/useMadaniReaderSearch';
import { useSurahPageSegments } from '@/hooks/mushaf/useSurahPageSegments';
import { getSurahPageSegments, pageForVerse, readerSurahForPage, surahPageRange } from '@/utils/qcf4Verse';
import { resolveEntryVerse } from '@/utils/verseTiming';
import { TOTAL_SURAHS, type ReaderDisplayMode } from '@/utils/mushafReader';
import type { Qcf4Page } from '@/types/qcf4';

const JUZ_FIRST_PAGES = juzPages as number[];

const SAVE_DEBOUNCE_MS = 600;

// FlatList forbids changing viewabilityConfig on the fly, so it must keep one
// identity for the reader's whole lifetime — a module constant is maximally stable.
const VIEWABILITY_CONFIG = { itemVisiblePercentThreshold: 50 };

// In-reader surah changes go through setParams (no remount) — the one-shot
// targets (?page= bookmark jump, ?highlight= verse jump) must be explicitly
// blanked or they'd re-fire on the newly opened surah.
function madaniSurahParams(surahId: number) {
  return { id: String(surahId), page: '', highlight: '' };
}

/** Verse number out of a "surah:verse" key, or -1 when it names another surah. */
function verseNumberOf(verseKey: string | null, surahId: number): number {
  if (!verseKey) return -1;
  const [keySurah, keyVerse] = verseKey.split(':');
  return Number(keySurah) === surahId ? Number(keyVerse) : -1;
}

export function juzForPage(page: number): number {
  let juz = 1;
  for (let i = 0; i < JUZ_FIRST_PAGES.length; i++) {
    if (page >= JUZ_FIRST_PAGES[i]) juz = i + 1;
    else break;
  }
  return juz;
}

export function useMadaniReader() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { id, page, highlight } = useLocalSearchParams() as { id?: string; page?: string; highlight?: string };

  const surahId = Math.min(TOTAL_SURAHS, Math.max(1, Number(id) || 1));
  const { firstPage, lastPage } = surahPageRange(surahId);
  const targetPage = page != null && page !== '' && !Number.isNaN(Number(page)) ? Number(page) : null;
  const highlightVerseNumber =
    highlight != null && highlight !== '' && !Number.isNaN(Number(highlight)) ? Number(highlight) : null;

  // null until the saved/target position is read — the pager must not mount
  // before then, since FlatList only honours initialScrollIndex on first render.
  const [initialPage, setInitialPage] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(firstPage);
  // Set by a search result or a cross-surah bookmark jump; overridden by the
  // currently-playing verse while audio is playing (see below).
  const [searchHighlightVerseKey, setSearchHighlightVerseKey] = useState<string | null>(null);

  // Restores, in priority order: an explicit ?page= (bookmark jump) → an
  // explicit ?highlight= verse number (search jump, resolved to its page via
  // this surah's own page segments) → the last page read in this surah.
  useEffect(() => {
    let cancelled = false;

    async function restore() {
      if (targetPage != null && targetPage >= firstPage && targetPage <= lastPage) {
        if (cancelled) return;
        setInitialPage(targetPage);
        setCurrentPage(targetPage);
        if (highlightVerseNumber != null) setSearchHighlightVerseKey(`${surahId}:${highlightVerseNumber}`);
        return;
      }
      if (highlightVerseNumber != null) {
        try {
          const segments = await getSurahPageSegments(queryClient, surahId, firstPage, lastPage);
          const resolvedPage = pageForVerse(segments, highlightVerseNumber) ?? firstPage;
          if (cancelled) return;
          setInitialPage(resolvedPage);
          setCurrentPage(resolvedPage);
          setSearchHighlightVerseKey(`${surahId}:${highlightVerseNumber}`);
        } catch {
          if (!cancelled) { setInitialPage(firstPage); setCurrentPage(firstPage); }
        }
        return;
      }
      try {
        const saved = await getMadaniLastPage();
        if (cancelled) return;
        const target = saved != null && saved >= firstPage && saved <= lastPage ? saved : firstPage;
        setInitialPage(target);
        setCurrentPage(target);
      } catch {
        if (!cancelled) { setInitialPage(firstPage); setCurrentPage(firstPage); }
      }
    }

    restore();
    return () => { cancelled = true; };
  }, [surahId, targetPage, highlightVerseNumber, firstPage, lastPage, queryClient]);

  // Saving stays off until the restore resolves, so the mount default can't
  // clobber the stored position before the jump back to it happens.
  useEffect(() => {
    if (initialPage == null) return;
    const timer = setTimeout(() => {
      saveMadaniLastPage(currentPage).catch(() => {});
    }, SAVE_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [currentPage, initialPage]);

  const { data: currentPageData } = useQuery<Qcf4Page>(qcf4PageQueryOptions(currentPage));

  // A print page routinely holds more than one surah, so the visible page alone
  // can't say which one the reader is on — readerSurahForPage resolves it,
  // preferring the surah the user actually opened (`surahId`) while it's on the
  // page. This drives both the header label and the reciter.
  const currentSurahId = currentPageData
    ? readerSurahForPage(currentPageData.surahs, surahId, currentPageData.page)
    : surahId;
  const currentPageSurah = currentPageData?.surahs.find((s) => s.id === currentSurahId) ?? null;
  const currentSurahNameArabic = currentPageSurah?.name_arabic ?? null;
  const currentSurahName = currentPageSurah?.name ?? null;
  const currentJuz = useMemo(() => juzForPage(currentPage), [currentPage]);

  const prefetchAround = useCallback(
    (page: number) => {
      for (const p of [page - 1, page + 1, page + 2]) {
        if (p >= 1 && p <= QCF4_TOTAL_PAGES) {
          void queryClient.prefetchQuery(qcf4PageQueryOptions(p));
        }
      }
    },
    [queryClient]
  );

  // onViewableItemsChanged identity must stay stable for FlatList, so it reads
  // the prefetcher through a ref instead of closing over it.
  const prefetchRef = useRef(prefetchAround);
  prefetchRef.current = prefetchAround;

  const viewabilityConfig = VIEWABILITY_CONFIG;
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: { index: number | null }[] }) => {
      const index = viewableItems[0]?.index;
      if (index == null) return;
      const page = index + 1;
      setCurrentPage(page);
      prefetchRef.current(page);
    }
  ).current;

  const goBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)/mushaf' as never);
  }, [router]);

  const goToPrevSurah = useCallback(() => {
    if (currentSurahId > 1) router.setParams(madaniSurahParams(currentSurahId - 1));
  }, [currentSurahId, router]);

  const goToNextSurah = useCallback(() => {
    if (currentSurahId < TOTAL_SURAHS) router.setParams(madaniSurahParams(currentSurahId + 1));
  }, [currentSurahId, router]);

  const { flipped, setFlipped } = useReaderOrientationLock();
  // 'pages' = horizontal print-page flip, matching a physical Mushaf: one
  // whole page filling the screen, fixed size, nothing to scroll.
  // 'continuous' = vertical scroll through full-width pages (default), and
  // the only resizable mode — each page is cut to the height its text needs.
  const [displayMode, setDisplayMode] = useState<ReaderDisplayMode>('continuous');
  const { fontScale, setFontScale, fontScaleOpen, setFontScaleOpen } = useFontScale();

  const pagerRef = useRef<FlatList<number>>(null);

  const audioReader = useMadaniReaderAudio(currentSurahId);

  // By the time play is pressed the reader has usually moved on from the
  // surah's opening, so the recitation enters where the reader actually is —
  // the verse just jumped to, or the first verse of the visible print page —
  // instead of the top of the track. resolveEntryVerse also decides when to
  // leave playback alone, which is what keeps a pause/resume a resume.
  const { playFrom, activeVerseKey } = audioReader;
  const handlePlayFromPage = useCallback(async () => {
    const jumped = verseNumberOf(searchHighlightVerseKey, currentSurahId);
    await playFrom(
      currentPageSurah
        ? resolveEntryVerse({
            pageVerseStart: currentPageSurah.verse_start,
            pageVerseEnd: currentPageSurah.verse_end,
            jumpedVerse: jumped > 0 ? jumped : null,
            activeVerse: verseNumberOf(activeVerseKey, currentSurahId),
          })
        : null
    );
  }, [playFrom, activeVerseKey, currentPageSurah, searchHighlightVerseKey, currentSurahId]);

  // Tapping the page pauses the reciter — and only pauses: a tap on a silent
  // Mushaf must never start audio, since reading is the primary gesture here.
  // isPlaying is read through a ref so the handler keeps one identity for the
  // reader's lifetime (it is passed down to the memoized page items).
  const isPlayingRef = useRef(audioReader.audio.isPlaying);
  useEffect(() => { isPlayingRef.current = audioReader.audio.isPlaying; }, [audioReader.audio.isPlaying]);
  const audioPause = audioReader.audio.pause;
  const handlePagePress = useCallback(() => {
    if (!isPlayingRef.current) return;
    void audioPause();
  }, [audioPause]);

  const { firstPage: curFirstPage, lastPage: curLastPage } = surahPageRange(currentSurahId);
  // Only needed to follow the page during playback — fetched on demand
  // rather than for every page turn (see useSurahPageSegments). Search
  // resolves its own jump target on demand instead of reading this table.
  const segments = useSurahPageSegments(currentSurahId, curFirstPage, curLastPage, audioReader.audio.isPlaying);

  // While playing, the currently-recited verse always wins over a stale
  // search/bookmark highlight; once paused, whatever was last jumped-to stays lit.
  const highlightVerseKey =
    audioReader.audio.isPlaying && audioReader.activeVerseKey
      ? audioReader.activeVerseKey
      : searchHighlightVerseKey;

  // Follow the audio: turn the page when the verse being recited has moved
  // onto a different print page than the one currently shown.
  /* eslint-disable react-hooks/set-state-in-effect -- intentional: derives the visible page from the externally-driven active verse */
  useEffect(() => {
    if (!audioReader.audio.isPlaying || !audioReader.activeVerseKey) return;
    const verseNumber = Number(audioReader.activeVerseKey.split(':')[1]);
    const targetPage = pageForVerse(segments, verseNumber);
    if (targetPage != null && targetPage !== currentPage) {
      setCurrentPage(targetPage);
      pagerRef.current?.scrollToIndex({ index: targetPage - 1, animated: true });
    }
  }, [audioReader.activeVerseKey, audioReader.audio.isPlaying, segments, currentPage]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Hands-free reading. 'pages' mode has no continuous scroll surface to
  // move within, so it turns pages on a timer instead; 'continuous' mode
  // scrolls the vertical pager pixel-by-pixel like the classic reader's
  // continuous mode does — via scrollToOffset (a FlatList, not a ScrollView,
  // so scrollTo isn't available; see useAutoScroll's scrollTo param).
  const autoScroll = useAutoScroll({
    mode: displayMode === 'continuous' ? 'continuous' : 'paged',
    scrollTo: (y) => pagerRef.current?.scrollToOffset({ offset: y, animated: false }),
    onAdvancePage: () => {
      const next = currentPage + 1;
      if (next > QCF4_TOTAL_PAGES) return false;
      setCurrentPage(next);
      pagerRef.current?.scrollToIndex({ index: next - 1, animated: true });
      return true;
    },
  });

  // A playing recitation already turns the page as it moves through the surah
  // (the follow effect above), so hands-free scrolling would be a second,
  // unsynchronised page driver fighting it — playback takes the wheel, and the
  // control is stopped and locked out for as long as it holds it.
  const autoScrollLocked = audioReader.audio.isPlaying;
  const stopAutoScroll = autoScroll.stop;
  useEffect(() => {
    if (autoScrollLocked) stopAutoScroll();
  }, [autoScrollLocked, stopAutoScroll]);

  const bookmarks = useMadaniReaderBookmarks({
    currentSurahId,
    currentPage,
    setCurrentPage,
    listRef: pagerRef,
  });

  const search = useMadaniReaderSearch({
    currentSurahId,
    setCurrentPage,
    listRef: pagerRef,
    setHighlightVerseKey: setSearchHighlightVerseKey,
  });

  const [playerSettingsOpen, setPlayerSettingsOpen] = useState(false);
  // Actual rendered height of the bottom player/banner overlay, measured via
  // onLayout — sizes the bookmark FAB position, mirroring the classic reader.
  const [playerHeight, setPlayerHeight] = useState(180);

  // eslint-disable-next-line react-hooks/refs -- exposing pagerRef to the consuming component is required so it can attach it to the native pager
  return {
    surahId,
    initialPage,
    currentPage,
    currentSurahId,
    currentSurahName,
    currentSurahNameArabic,
    currentJuz,
    viewabilityConfig,
    onViewableItemsChanged,
    goBack,
    goToPrevSurah,
    goToNextSurah,

    flipped,
    setFlipped,
    fontScale,
    setFontScale,
    fontScaleOpen,
    setFontScaleOpen,
    displayMode,
    setDisplayMode,
    pagerRef,
    highlightVerseKey,
    handlePagePress,

    autoScrollEnabled: autoScroll.enabled,
    autoScrollLocked,
    toggleAutoScroll: autoScroll.toggle,
    autoScrollSpeed: autoScroll.speed,
    setAutoScrollSpeed: autoScroll.setSpeed,
    onAutoScrollSync: autoScroll.onScrollSync,

    playerSettingsOpen,
    setPlayerSettingsOpen,
    playerHeight,
    setPlayerHeight,

    ...audioReader,
    handlePlay: handlePlayFromPage,

    ...bookmarks,
    ...search,
  };
}
