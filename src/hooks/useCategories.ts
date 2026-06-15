import { useQuery } from '@tanstack/react-query';
import { ruqyahService } from '@/services/ruqyahService';
import { cachedFetch } from '@/services/contentCache';
import { cacheKeys } from '@/utils/cacheKeys';

/** Hospital categories list. API-first with SQLite offline fallback so the grid loads offline. */
export function useCategories() {
  const query = useQuery({
    queryKey: cacheKeys.categories,
    queryFn: () => cachedFetch('clinic_categories', ruqyahService.getCategories),
    staleTime: Infinity,
  });
  return {
    categories: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
