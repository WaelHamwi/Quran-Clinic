import { useQuery } from '@tanstack/react-query';
import { ruqyahService } from '@/services/content/ruqyahService';
import { cachedFetch } from '@/services/common/contentCache';
import { cacheKeys } from '@/utils/cacheKeys';

const FIVE_MIN = 1000 * 60 * 5;

/** One subcategory with its diseases. Cached for offline viewing. */
export function useSubcategory(slug: string) {
  const query = useQuery({
    queryKey: cacheKeys.subcategory(slug),
    queryFn: () => cachedFetch(`clinic_subcategory_${slug}`, () => ruqyahService.getSubcategory(slug)),
    enabled: slug.length > 0,
    staleTime: FIVE_MIN,
    refetchInterval: 30_000,
  });
  return {
    subcategory: query.data,
    diseases: query.data?.diseases ?? [],
    recordings: query.data?.recordings ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
