import { useQuery } from '@tanstack/react-query';
import { cacheKeys } from '@/utils/cacheKeys';
import { sponsorService } from '@/services/sponsorService';

export function useSponsors() {
  const query = useQuery({
    queryKey: cacheKeys.sponsors,
    queryFn: sponsorService.getSponsors,
    staleTime: 1000 * 60 * 10,
  });
  return {
    sponsors: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
