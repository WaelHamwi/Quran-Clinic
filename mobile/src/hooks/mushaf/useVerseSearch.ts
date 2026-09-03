import { useCallback, useEffect, useRef, useState } from 'react';
import { quranService } from '@/services/mushaf/quranService';
import { offlineStorage } from '@/services/common/offlineStorage';
import { VERSE_REF_RE, normalizeArabicDigits } from '@/utils/mushafReader';
import type { Verse } from '@/types/verse';

type Params = {
  onVerseRef: (surahId: number, verseNumber: number) => void;
};

const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 400;
const PAGE_SIZE = 15;

/** Shared word/verse search: parses a "2:255" verse reference and otherwise
 *  runs a free-text API search (falling back to the offline cache). A resolved
 *  verse reference is handed to `onVerseRef` — consumers decide whether that
 *  means scrolling in place (in-reader) or navigating to the surah (elsewhere). */
export function useVerseSearch({ onVerseRef }: Params) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Verse[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  // Bookkeeping for `loadMore` — which query/page/source to continue from.
  // Kept out of state since a re-render should never follow it directly.
  const pagingRef = useRef({ query: '', page: 1, fromCache: false });

  const handleSearch = useCallback(
    async (rawQuery: string) => {
      const q = normalizeArabicDigits(rawQuery.trim());
      if (!q) { setIsSearching(false); return; }
      const match = q.match(VERSE_REF_RE);
      if (match) {
        const sid = Number(match[1]);
        const vnum = Number(match[2]);
        if (sid >= 1 && sid <= 114 && vnum >= 1) {
          setIsSearching(false);
          setSearchQuery('');
          setSearchResults(null);
          setHasMore(false);
          onVerseRef(sid, vnum);
          return;
        }
      }
      if (q.length < MIN_QUERY_LENGTH) { setIsSearching(false); return; }
      setIsSearching(true);
      const trimmed = rawQuery.trim();
      try {
        const res = await quranService.searchVerses(trimmed, 1, PAGE_SIZE);
        pagingRef.current = { query: trimmed, page: 1, fromCache: false };
        setSearchResults(res.data ?? []);
        setHasMore(res.meta.current_page < res.meta.last_page);
      } catch {
        const cached = await offlineStorage.searchVersesCached(trimmed, PAGE_SIZE, 0);
        pagingRef.current = { query: trimmed, page: 1, fromCache: true };
        setSearchResults(cached);
        setHasMore(cached.length === PAGE_SIZE);
      } finally {
        setIsSearching(false);
      }
    },
    [onVerseRef]
  );

  // Appends the next page of results for whatever query last ran — used as a
  // FlatList onEndReached handler so long result sets aren't capped at PAGE_SIZE.
  const loadMore = useCallback(async () => {
    const paging = pagingRef.current;
    if (!paging.query || isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    const nextPage = paging.page + 1;
    try {
      if (paging.fromCache) {
        const cached = await offlineStorage.searchVersesCached(paging.query, PAGE_SIZE, (nextPage - 1) * PAGE_SIZE);
        setSearchResults((prev) => [...(prev ?? []), ...cached]);
        setHasMore(cached.length === PAGE_SIZE);
      } else {
        const res = await quranService.searchVerses(paging.query, nextPage, PAGE_SIZE);
        setSearchResults((prev) => [...(prev ?? []), ...(res.data ?? [])]);
        setHasMore(res.meta.current_page < res.meta.last_page);
      }
      paging.page = nextPage;
    } catch {
      setHasMore(false);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMore]);

  useEffect(() => {
    const q = normalizeArabicDigits(searchQuery.trim());
    if (q.length < MIN_QUERY_LENGTH) return;
    const timer = setTimeout(() => { handleSearch(searchQuery); }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchQuery, handleSearch]);

  const trimmedLength = normalizeArabicDigits(searchQuery.trim()).length;
  const isQueryTooShort = trimmedLength > 0 && trimmedLength < MIN_QUERY_LENGTH;

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    setSearchResults,
    isSearching,
    isQueryTooShort,
    isLoadingMore,
    hasMore,
    loadMore,
    handleSearch,
  };
}
