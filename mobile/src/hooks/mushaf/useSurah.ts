import { useQuery } from '@tanstack/react-query';
import { offlineStorage } from '@/services/common/offlineStorage';
import { quranService } from '@/services/mushaf/quranService';
import type { SurahWithVerses } from '@/types/surah';

export function useSurah(id: number) {
  return useQuery<SurahWithVerses>({
    queryKey: ['surah', id],
    queryFn: async () => {
      try {
        const result = await quranService.getSurah(id);
        const { verses, ...surahMeta } = result.data;
        // Persist for offline use. Save the surah (parent) BEFORE its verses (child),
        // and isolate the writes in their own try/catch: a SQLite failure here — e.g.
        // a transient "database is locked" when several queries hit the DB at once on
        // first launch — must NOT discard an otherwise-successful fetch and fall through
        // to the (still-empty) offline cache, which is what caused the first-open
        // "failed to load". The fetched data is returned regardless of cache outcome.
        try {
          await offlineStorage.saveSurahs([surahMeta]);
          await offlineStorage.saveVerses(verses);
        } catch {
          // caching is best-effort; the live data below is still valid
        }
        return result.data;
      } catch {
        const verses = await offlineStorage.getVersesBySurah(id);
        const surahs = await offlineStorage.getSurahs();
        const surah = surahs.find((s) => s.id === id);
        if (!surah || verses.length === 0) throw new Error('Surah not available offline. Please connect to the internet first.');
        return { ...surah, verses };
      }
    },
    enabled: id > 0,
    retry: false,
    networkMode: 'offlineFirst',
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}
