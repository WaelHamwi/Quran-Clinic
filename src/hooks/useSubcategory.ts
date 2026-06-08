import { useQuery } from '@tanstack/react-query';
import { ruqyahService } from '@/services/ruqyahService';
import { clinicCache } from '@/services/clinicCache';
import { cacheKeys } from '@/utils/cacheKeys';
import type { Subcategory } from '@/types/category';

const FIVE_MIN = 1000 * 60 * 5;

/** One subcategory with its diseases. Persisted so the screen loads offline. */
export function useSubcategory(slug: string) {
  const query = useQuery({
    queryKey: cacheKeys.subcategory(slug),
    queryFn: async () => {
      try {
        const data = await ruqyahService.getSubcategory(slug);
        await clinicCache.saveSubcategory(slug, data);
        return data;
      } catch {
        const cached = await clinicCache.getSubcategory(slug);
        if (cached) return cached;
        throw new Error('No internet connection and no cached data available');
      }
    },
    enabled: slug.length > 0,
    staleTime: FIVE_MIN,
    retry: false,
    networkMode: 'offlineFirst',
    refetchInterval: 30_000,
  });
  return {
    subcategory: query.data as Subcategory | undefined,
    diseases: query.data?.diseases ?? [],
    recordings: query.data?.recordings ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
