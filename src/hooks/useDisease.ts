import { useQuery } from '@tanstack/react-query';
import { ruqyahService } from '@/services/ruqyahService';
import { clinicCache } from '@/services/clinicCache';
import { cacheKeys } from '@/utils/cacheKeys';
import type { Disease } from '@/types/disease';

const FIVE_MIN = 1000 * 60 * 5;

/** One disease's detail (name, description, is_general). Persisted so the screen loads offline. */
export function useDisease(slug: string) {
  const query = useQuery({
    queryKey: cacheKeys.disease(slug),
    queryFn: async () => {
      try {
        const data = await ruqyahService.getDisease(slug);
        await clinicCache.saveDisease(slug, data);
        return data;
      } catch {
        const cached = await clinicCache.getDisease(slug);
        if (cached) return cached;
        throw new Error('No internet connection and no cached data available');
      }
    },
    enabled: slug.length > 0,
    staleTime: FIVE_MIN,
    retry: false,
    networkMode: 'offlineFirst',
  });
  return {
    disease: query.data as Disease | undefined,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
