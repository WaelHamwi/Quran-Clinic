import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { cacheKeys } from '@/utils/cacheKeys';
import { tahsinatService } from '@/services/tahsinatService';
import { cachedFetch } from '@/services/contentCache';
import type { TahsinatItem } from '@/types/tahsinat';

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

/** Items for one tahsinat category. `randomOrder` shuffles them once per mount. */
export function useTahsinatItems(slug: string, randomOrder = false) {
  const query = useQuery({
    queryKey: cacheKeys.tahsinatItems(slug),
    queryFn: () => cachedFetch(`tahsinat_items_${slug}`, () => tahsinatService.getItems(slug)),
    enabled: slug.length > 0,
    staleTime: FIVE_MIN,
  });

  const items = useMemo<TahsinatItem[]>(() => {
    const list = query.data ?? [];
    if (!randomOrder) return list;
    const shuffled = [...list];
    for (let i = shuffled.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, [query.data, randomOrder]);

  return {
    items,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
