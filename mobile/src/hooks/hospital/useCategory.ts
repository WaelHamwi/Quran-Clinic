import { useQuery } from '@tanstack/react-query';
import { ruqyahService } from '@/services/content/ruqyahService';
import { cachedFetch } from '@/services/common/contentCache';
import { cacheKeys } from '@/utils/cacheKeys';

const FIVE_MIN = 1000 * 60 * 5;

/** One category with its subcategories (standard), direct diseases (disease_direct), or recordings (direct). */
export function useCategory(slug: string) {
  const query = useQuery({
    queryKey: cacheKeys.category(slug),
    queryFn: () => cachedFetch(`clinic_category_${slug}`, () => ruqyahService.getCategory(slug)),
    enabled: slug.length > 0,
    staleTime: FIVE_MIN,
    refetchInterval: 30_000,
  });
  return {
    category: query.data,
    subcategories: query.data?.subcategories ?? [],
    directDiseases: query.data?.direct_diseases ?? [],
    recordings: query.data?.recordings ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
