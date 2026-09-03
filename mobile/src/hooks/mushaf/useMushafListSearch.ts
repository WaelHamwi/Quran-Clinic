import { useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useVerseSearch } from '@/hooks/mushaf/useVerseSearch';
import type { Verse } from '@/types/verse';

/** Drives the Mushaf list's word/verse search bar — the surah-name bar is a
 *  separate, independent filter owned by useMushafScreen. Reuses the exact same
 *  verse-ref + full-text search logic as the in-reader search (useVerseSearch)
 *  instead of duplicating it. */
export function useMushafListSearch() {
  const router = useRouter();

  // The Madani reader highlights the whole matched verse (resolved to its print
  // page via ?highlight=); it has no word-level highlight, so the matched term
  // isn't forwarded.
  const goToVerse = useCallback(
    (surahId: number, verseNumber: number) => {
      router.push(`/mushaf/${surahId}?highlight=${verseNumber}` as never);
    },
    [router]
  );

  const {
    searchQuery: verseQuery,
    setSearchQuery: setVerseQuery,
    searchResults: verseResults,
    setSearchResults: setVerseResults,
    isSearching: isSearchingVerses,
    isQueryTooShort: isVerseQueryTooShort,
    isLoadingMore: isLoadingMoreVerses,
    loadMore: loadMoreVerses,
    handleSearch: runVerseSearch,
  } = useVerseSearch({ onVerseRef: goToVerse });

  const handleVerseQueryChange = useCallback(
    (text: string) => {
      setVerseQuery(text);
      setVerseResults(null);
    },
    [setVerseQuery, setVerseResults]
  );

  const handleVerseSubmit = useCallback(
    () => runVerseSearch(verseQuery),
    [runVerseSearch, verseQuery]
  );

  const handleResultPress = useCallback(
    (verse: Verse) => goToVerse(verse.surah_id, verse.verse_number),
    [goToVerse]
  );

  return {
    verseQuery,
    handleVerseQueryChange,
    handleVerseSubmit,
    isVerseSearchActive: verseQuery.trim().length > 0,
    isSearchingVerses,
    isVerseQueryTooShort,
    isLoadingMoreVerses,
    loadMoreVerses,
    verseResults,
    handleResultPress,
  };
}
