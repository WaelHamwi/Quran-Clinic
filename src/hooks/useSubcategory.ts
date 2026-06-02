import { useQuery } from '@tanstack/react-query';
import { ruqyahService } from '@/services/ruqyahService';
import { cacheKeys } from '@/utils/cacheKeys';

const FIVE_MIN = 1000 * 60 * 5;

/** One subcategory with its diseases. */
export function useSubcategory(slug: string) {
  const query = useQuery({
    queryKey: cacheKeys.subcategory(slug),
    queryFn: () => ruqyahService.getSubcategory(slug),
    enabled: slug.length > 0,
    staleTime: FIVE_MIN,
  });
  return {
    subcategory: query.data,
    diseases: query.data?.diseases ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
