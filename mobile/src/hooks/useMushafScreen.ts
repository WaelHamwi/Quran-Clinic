import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { useMushafContext } from '@/context/MushafContext';
import { useReciters } from '@/hooks/useReciters';
import { useSurahs } from '@/hooks/useSurahs';

export type SurahTypeFilter = 'all' | 'meccan' | 'medinan';
export type DisplayMode = 'order' | 'alpha';

export function useMushafScreen() {
  const router = useRouter();
  const { selectedReciterId, setSelectedReciterId } = useMushafContext();

  const [showReciterPicker, setShowReciterPicker] = useState(false);
  const [showSurahFilter, setShowSurahFilter] = useState(false);
  const [showDisplayMode, setShowDisplayMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [reciterSearch, setReciterSearch] = useState('');
  const [surahTypeFilter, setSurahTypeFilter] = useState<SurahTypeFilter>('all');
  const [displayMode, setDisplayMode] = useState<DisplayMode>('order');

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

  const reciters = recitersData?.data ?? [];
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

    if (surahTypeFilter !== 'all') {
      result = result.filter((s) => s.type === surahTypeFilter);
    }

    if (displayMode === 'alpha') {
      result = [...result].sort((a, b) =>
        a.transliteration.localeCompare(b.transliteration)
      );
    }

    return result;
  }, [surahs, searchQuery, surahTypeFilter, displayMode]);

  const isSearching = searchQuery.trim().length > 0;

  const handleRefresh = useCallback(() => {
    refetchSurahs();
    refetchReciters();
  }, [refetchSurahs, refetchReciters]);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleSurahPress = useCallback(
    (id: number) => router.push(`/mushaf/${id}` as any),
    [router]
  );

  return {
    showReciterPicker,
    setShowReciterPicker,
    showSurahFilter,
    setShowSurahFilter,
    showDisplayMode,
    setShowDisplayMode,
    searchQuery,
    setSearchQuery,
    reciterSearch,
    setReciterSearch,
    surahTypeFilter,
    setSurahTypeFilter,
    displayMode,
    setDisplayMode,
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
    fetchNextPage,
  };
}
