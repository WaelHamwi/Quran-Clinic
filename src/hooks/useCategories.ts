import { useQuery } from '@tanstack/react-query';
import { ruqyahService } from '@/services/ruqyahService';
import { cacheKeys } from '@/utils/cacheKeys';

/** Hospital categories list. Static content — `staleTime: Infinity`. */
export function useCategories() {
  const query = useQuery({
    queryKey: cacheKeys.categories,
    queryFn: ruqyahService.getCategories,
    staleTime: Infinity,
  });
  return {
    categories: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
