import { useQuery } from '@tanstack/react-query';
import { cacheKeys } from '@/utils/cacheKeys';
import { tahsinatService } from '@/services/tahsinatService';
import { cachedFetch } from '@/services/contentCache';

const FIVE_MIN = 1000 * 60 * 5;

/** Tahsinat categories — drive the Self / For-Others tab strip. */
export function useTahsinatCategories() {
  const query = useQuery({
    queryKey: cacheKeys.tahsinatCategories,
    queryFn: () => cachedFetch('tahsinat_categories', tahsinatService.getCategories),
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
 * One tahsinat category with its sections + items. The raw (un-shuffled)
 * category is returned so the screen can apply per-section randomization fresh
 * on every view — see `flattenSectioned`.
 */
export function useTahsinatItems(slug: string) {
  const query = useQuery({
    queryKey: cacheKeys.tahsinatItems(slug),
    queryFn: () => cachedFetch(`tahsinat_items_${slug}`, () => tahsinatService.getItems(slug)),
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
