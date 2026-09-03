import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import type { FlatList } from 'react-native';
import {
  addMadaniPageBookmark,
  getAllMadaniPageBookmarks,
  removeMadaniPageBookmark,
  type MadaniPageBookmark,
} from '@/services/mushaf/bookmarks';

type Params = {
  currentSurahId: number;
  currentPage: number;
  setCurrentPage: (p: number) => void;
  listRef: React.RefObject<FlatList<number> | null>;
};

/** Bookmarking for the Madani reader — the bookmarked unit is an absolute
 *  1-604 print page (see `services/bookmarks.ts`'s `MadaniPageBookmark`). */
export function useMadaniReaderBookmarks({ currentSurahId, currentPage, setCurrentPage, listRef }: Params) {
  const router = useRouter();
  const [bookmarks, setBookmarks] = useState<MadaniPageBookmark[]>([]);
  const [bookmarkModalOpen, setBookmarkModalOpen] = useState(false);

  useEffect(() => {
    getAllMadaniPageBookmarks().then(setBookmarks).catch(() => {});
  }, []);

  const isCurrentBookmarked = useMemo(
    () => bookmarks.some((b) => b.page === currentPage),
    [bookmarks, currentPage]
  );

  // The in-reader sheet only lists pages bookmarked within the currently open surah.
  const surahBookmarks = useMemo(
    () => bookmarks.filter((b) => b.surahId === currentSurahId),
    [bookmarks, currentSurahId]
  );

  const handleToggleBookmark = useCallback(async () => {
    const next = isCurrentBookmarked
      ? await removeMadaniPageBookmark(currentPage)
      : await addMadaniPageBookmark(currentSurahId, currentPage);
    setBookmarks(next);
  }, [isCurrentBookmarked, currentSurahId, currentPage]);

  const handleGoToBookmark = useCallback((b: MadaniPageBookmark) => {
    setBookmarkModalOpen(false);
    if (b.surahId !== currentSurahId) {
      router.replace(`/mushaf/${b.surahId}?page=${b.page}` as never);
      return;
    }
    setCurrentPage(b.page);
    listRef.current?.scrollToIndex({ index: b.page - 1, animated: true });
  }, [currentSurahId, router, setCurrentPage, listRef]);

  return {
    surahBookmarks,
    bookmarkModalOpen,
    setBookmarkModalOpen,
    isCurrentBookmarked,
    handleToggleBookmark,
    handleGoToBookmark,
  };
}
