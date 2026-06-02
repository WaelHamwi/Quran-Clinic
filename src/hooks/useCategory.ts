import { useQuery } from '@tanstack/react-query';
import { ruqyahService } from '@/services/ruqyahService';
import { cacheKeys } from '@/utils/cacheKeys';

const FIVE_MIN = 1000 * 60 * 5;

/** One category with its subcategories. */
export function useCategory(slug: string) {
  const query = useQuery({
    queryKey: cacheKeys.category(slug),
    queryFn: () => ruqyahService.getCategory(slug),
    enabled: slug.length > 0,
    staleTime: FIVE_MIN,
  });
  return {
    category: query.data,
    subcategories: query.data?.subcategories ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
