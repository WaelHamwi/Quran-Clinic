import { useQuery } from '@tanstack/react-query';
import { cacheKeys } from '@/utils/cacheKeys';
import { adhkarService } from '@/services/adhkarService';
import { cachedFetch } from '@/services/contentCache';

const FIVE_MIN = 1000 * 60 * 5;

/** Adhkar categories — these drive the time-of-day tab strip. */
export function useAdhkarCategories() {
  const query = useQuery({
    queryKey: cacheKeys.adhkarCategories,
    queryFn: () => cachedFetch('adhkar_categories', adhkarService.getCategories),
    staleTime: FIVE_MIN,
  });
  return {
    categories: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * One adhkar category with its sections + items. API-first with offline SQLite
 * fallback. The raw (un-shuffled) category is returned so the screen can apply
 * per-section randomization fresh on every view — see `flattenAdhkar`.
 */
export function useAdhkarItems(slug: string) {
  const query = useQuery({
    queryKey: cacheKeys.adhkarItems(slug),
    queryFn: () => cachedFetch(`adhkar_items_${slug}`, () => adhkarService.getItems(slug)),
    enabled: slug.length > 0,
    staleTime: FIVE_MIN,
  });
  return {
    category: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
