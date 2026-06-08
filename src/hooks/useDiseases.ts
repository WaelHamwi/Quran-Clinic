import { useQuery } from '@tanstack/react-query';
import { ruqyahService } from '@/services/ruqyahService';
import { clinicCache } from '@/services/clinicCache';
import { cacheKeys } from '@/utils/cacheKeys';
import type { Paginated } from '@/types/api';
import type { Disease } from '@/types/disease';

const FIVE_MIN = 1000 * 60 * 5;

/** Full diseases list (paginated). Persisted so browse-all works offline. */
export function useDiseases() {
  const query = useQuery({
    queryKey: cacheKeys.diseases(),
    queryFn: async () => {
      try {
        const data = await ruqyahService.getDiseases(100);
        await clinicCache.saveDiseases(data);
        return data;
      } catch {
        const cached = await clinicCache.getDiseases();
        if (cached) return cached;
        throw new Error('No internet connection and no cached data available');
      }
    },
    staleTime: FIVE_MIN,
    retry: false,
    networkMode: 'offlineFirst',
  });
  return {
    diseases: query.data?.items ?? [] as Disease[],
    meta: query.data?.meta,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
