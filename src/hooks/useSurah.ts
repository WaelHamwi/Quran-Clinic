import { useQuery } from '@tanstack/react-query';
import { offlineStorage } from '@/services/offlineStorage';
import { quranService } from '@/services/quranService';
import type { SurahWithVerses } from '@/types/surah';

export function useSurah(id: number) {
  return useQuery<SurahWithVerses>({
    queryKey: ['surah', id],
    queryFn: async () => {
      try {
        const result = await quranService.getSurah(id);
        const { verses, ...surahMeta } = result.data;
        // Persist BOTH the verses and the surah's own metadata. Saving the metadata
        // here (not just in the paginated list) is what makes any surah the user opens
        // available offline — the list only caches page 1, so surahs beyond #15 would
        // otherwise have verses but no metadata and fail to reconstruct offline.
        await offlineStorage.saveVerses(verses);
        await offlineStorage.saveSurahs([surahMeta]);
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
