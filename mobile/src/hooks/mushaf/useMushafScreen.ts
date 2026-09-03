import { useCallback, useEffect, useMemo, useState } from 'react';
import { InteractionManager } from 'react-native';
import { useRouter } from 'expo-router';
import { useMushafContext } from '@/context/MushafContext';
import { useReciters } from '@/hooks/mushaf/useReciters';
import { useSurahs } from '@/hooks/mushaf/useSurahs';
import { warmAllReaderFonts, warmReaderFonts } from '@/hooks/mushaf/useQcfFonts';
import { warmQcf4Pages } from '@/services/mushaf/qcf4Pages';
import { surahPageRange } from '@/utils/qcf4Verse';

export function useMushafScreen() {
  const router = useRouter();
  const { selectedReciterId, setSelectedReciterId } = useMushafContext();

  const [showReciterPicker, setShowReciterPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [reciterSearch, setReciterSearch] = useState('');

  // The reader renders from a bundled ~6 MB page file (parsed once, lazily) and
  // gates each page on its QCF4 font family loading. Warming both here — after
  // the list's own interactions settle — moves that cost off the "tap a surah →
  // see text" path. warmAllReaderFonts then progressively registers every page
  // font in the background so navigating to *any* surah opens instantly, at the
  // cost of keeping all families resident (see its doc comment).
  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      warmQcf4Pages();
      warmAllReaderFonts();
    });
    return () => task.cancel();
  }, []);

  // Lets the screen start a specific page's font load at tap time (continue-
  // reading card, bookmark/read rows) so it overlaps the route transition.
  const warmReaderForPage = useCallback((page: number) => warmReaderFonts(page), []);

  const {
    data: surahsData,
    isLoading: surahsLoading,
    error: surahsError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch: refetchSurahs,
    isRefetching: isSurahsRefetching,
  } = useSurahs();

  const { data: recitersData, refetch: refetchReciters } = useReciters();

  const reciters = useMemo(() => recitersData?.data ?? [], [recitersData]);
  const surahs = useMemo(
    () => surahsData?.pages.flatMap((page) => page.data) ?? [],
    [surahsData]
  );
  const selectedReciter = useMemo(
    () => reciters.find((r) => r.id === selectedReciterId),
    [reciters, selectedReciterId]
  );

  const closeReciterPicker = useCallback(() => {
    setShowReciterPicker(false);
    setReciterSearch('');
  }, []);

  const handleReciterSelect = useCallback(
    (id: number | null) => {
      setSelectedReciterId(id);
      closeReciterPicker();
    },
    [setSelectedReciterId, closeReciterPicker]
  );

  const filteredReciters = useMemo(() => {
    const q = reciterSearch.trim().toLowerCase();
    if (!q) return reciters;
    return reciters.filter(
      (r) => (r.name.en ?? '').toLowerCase().includes(q) || r.name.ar.includes(q)
    );
  }, [reciters, reciterSearch]);

  const filteredSurahs = useMemo(() => {
    let result = surahs;

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (s) =>
          (s.name.en ?? '').toLowerCase().includes(q) ||
          s.transliteration.toLowerCase().includes(q) ||
          s.name.ar.includes(q) ||
          String(s.id) === q
      );
    }

    return result;
  }, [surahs, searchQuery]);

  const isSearching = searchQuery.trim().length > 0;

  const handleRefresh = useCallback(() => {
    refetchSurahs();
    refetchReciters();
  }, [refetchSurahs, refetchReciters]);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleSurahPress = useCallback(
    (id: number) => {
      warmReaderFonts(surahPageRange(id).firstPage);
      router.push(`/mushaf/${id}` as never);
    },
    [router]
  );

  return {
    showReciterPicker,
    setShowReciterPicker,
    searchQuery,
    setSearchQuery,
    reciterSearch,
    setReciterSearch,
    surahs,
    reciters,
    filteredSurahs,
    filteredReciters,
    selectedReciterId,
    selectedReciter,
    surahsLoading,
    surahsError,
    isFetchingNextPage,
    isSurahsRefetching,
    isSearching,
    handleRefresh,
    closeReciterPicker,
    handleReciterSelect,
    handleEndReached,
    handleSurahPress,
    warmReaderForPage,
    fetchNextPage,
  };
}
