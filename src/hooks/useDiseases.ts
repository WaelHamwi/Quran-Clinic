import { useQuery } from '@tanstack/react-query';
import { ruqyahService } from '@/services/ruqyahService';
import { cacheKeys } from '@/utils/cacheKeys';

const FIVE_MIN = 1000 * 60 * 5;

/** Full diseases list (paginated). Used for browse-all / search fallback. */
export function useDiseases() {
  const query = useQuery({
    queryKey: cacheKeys.diseases(),
    queryFn: () => ruqyahService.getDiseases(100),
    staleTime: FIVE_MIN,
  });
  return {
    diseases: query.data?.items ?? [],
    meta: query.data?.meta,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
