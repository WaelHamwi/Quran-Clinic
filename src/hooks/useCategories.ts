import { useQuery } from '@tanstack/react-query';
import { ruqyahService } from '@/services/ruqyahService';
import { clinicCache } from '@/services/clinicCache';
import { cacheKeys } from '@/utils/cacheKeys';
import type { Category } from '@/types/category';

/** Hospital categories list. Persisted to device storage so the grid loads offline. */
export function useCategories() {
  const query = useQuery({
    queryKey: cacheKeys.categories,
    queryFn: async () => {
      try {
        const data = await ruqyahService.getCategories();
        await clinicCache.saveCategories(data);
        return data;
      } catch {
        const cached = await clinicCache.getCategories();
        if (cached) return cached;
        throw new Error('No internet connection and no cached data available');
      }
    },
    staleTime: Infinity,
    retry: false,
    networkMode: 'offlineFirst',
  });
  return {
    categories: query.data ?? [] as Category[],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
