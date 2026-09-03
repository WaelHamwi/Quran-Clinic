import { useCallback, useState } from 'react';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import type { FlatList } from 'react-native';
import { useVerseSearch } from '@/hooks/mushaf/useVerseSearch';
import { getSurahPageSegments, pageForVerse, surahPageRange } from '@/utils/qcf4Verse';
import type { Verse } from '@/types/verse';

type Params = {
  currentSurahId: number;
  setCurrentPage: (p: number) => void;
  listRef: React.RefObject<FlatList<number> | null>;
  setHighlightVerseKey: (key: string | null) => void;
};

/** Verse search for the Madani reader — same search backend as the classic
 *  reader (`useVerseSearch`), but a resolved verse jumps to its QCF4 print
 *  page (resolved on demand via the surah's page segments, fetched only
 *  when a jump actually happens) and highlights the whole word span instead
 *  of scrolling to a verse row and highlighting a text substring (QCF4
 *  glyphs can't be substring-matched). */
export function useMadaniReaderSearch({
  currentSurahId,
  setCurrentPage,
  listRef,
  setHighlightVerseKey,
}: Params) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [searchOpen, setSearchOpen] = useState(false);

  const jumpToVerse = useCallback(
    async (sid: number, vnum: number) => {
      setSearchOpen(false);
      if (sid !== currentSurahId) {
        router.replace(`/mushaf/${sid}?highlight=${vnum}` as never);
        return;
      }
      try {
        const { firstPage, lastPage } = surahPageRange(sid);
        const segments = await getSurahPageSegments(queryClient, sid, firstPage, lastPage);
        const page = pageForVerse(segments, vnum);
        if (page != null) {
          setHighlightVerseKey(`${sid}:${vnum}`);
          setCurrentPage(page);
          listRef.current?.scrollToIndex({ index: page - 1, animated: true });
        }
      } catch {
        // Page resolution failed (offline, bad data) — no-op, matches the
        // classic reader's silent no-op when a verse ref can't be found.
      }
    },
    [currentSurahId, queryClient, setCurrentPage, listRef, router, setHighlightVerseKey]
  );

  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    setSearchResults,
    isSearching,
    isQueryTooShort,
    isLoadingMore,
    loadMore,
    handleSearch,
  } = useVerseSearch({ onVerseRef: jumpToVerse });

  const handleSearchResultPress = useCallback(
    (result: Verse) => {
      setSearchQuery('');
      setSearchResults(null);
      jumpToVerse(result.surah_id, result.verse_number);
    },
    [jumpToVerse, setSearchQuery, setSearchResults]
  );

  return {
    searchOpen,
    setSearchOpen,
    searchQuery,
    setSearchQuery,
    searchResults,
    setSearchResults,
    isSearching,
    isQueryTooShort,
    isLoadingMore,
    loadMore,
    handleSearch,
    handleSearchResultPress,
  };
}
