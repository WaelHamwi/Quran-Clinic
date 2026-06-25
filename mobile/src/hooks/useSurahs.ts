import { useInfiniteQuery } from '@tanstack/react-query';
import { offlineStorage } from '@/services/offlineStorage';
import { quranService } from '@/services/quranService';
import type { PaginatedResponse, Surah } from '@/types/surah';

export function useSurahs() {
  return useInfiniteQuery<PaginatedResponse<Surah>>({
    queryKey: ['surahs'],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const page = pageParam as number;
      try {
        const result = await quranService.getSurahs(page);
        // Cache every page the user scrolls through — not just page 1 — so the full
        // browsed list is rebuildable offline.
        await offlineStorage.saveSurahs(result.data);
        return result;
      } catch {
        if (page !== 1) throw new Error('Failed to load more surahs');
        const cached = await offlineStorage.getSurahs();
        if (cached.length === 0) throw new Error('No internet connection and no cached data available');
        return {
          success: true,
          message: 'cached',
          data: cached,
          meta: { current_page: 1, last_page: 1, per_page: cached.length, total: cached.length },
        };
      }
    },
    getNextPageParam: (lastPage) =>
      lastPage.meta.current_page < lastPage.meta.last_page
        ? lastPage.meta.current_page + 1
        : undefined,
    staleTime: 5 * 60 * 1000,
    retry: false,
    networkMode: 'offlineFirst',
  });
}
