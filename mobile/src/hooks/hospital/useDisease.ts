import { useQuery } from '@tanstack/react-query';
import { ruqyahService } from '@/services/content/ruqyahService';
import { cachedFetch } from '@/services/common/contentCache';
import { cacheKeys } from '@/utils/cacheKeys';

const FIVE_MIN = 1000 * 60 * 5;

/** One disease's detail (name, description, is_general). Cached for offline viewing. */
export function useDisease(slug: string) {
  const query = useQuery({
    queryKey: cacheKeys.disease(slug),
    queryFn: () => cachedFetch(`clinic_disease_${slug}`, () => ruqyahService.getDisease(slug)),
    enabled: slug.length > 0,
    staleTime: FIVE_MIN,
  });
  return {
    disease: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
