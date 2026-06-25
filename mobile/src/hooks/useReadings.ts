import { useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  toggleReading,
  selectReadSurahs,
  selectReadingIds,
} from '@/store/slices/readingsSlice';
import type { Surah } from '@/types/surah';

export function useReadings() {
  const dispatch = useAppDispatch();
  const readSurahs = useAppSelector(selectReadSurahs);
  const readingIds = useAppSelector(selectReadingIds);
  const idSet = useMemo(() => new Set(readingIds), [readingIds]);

  const isRead = useCallback((surahId: number) => idSet.has(surahId), [idSet]);

  const toggleRead = useCallback(
    (surah: Surah) => dispatch(toggleReading(surah)),
    [dispatch],
  );

  return useMemo(
    () => ({ readSurahs, readingIds, isRead, toggleRead }),
    [readSurahs, readingIds, isRead, toggleRead],
  );
}
