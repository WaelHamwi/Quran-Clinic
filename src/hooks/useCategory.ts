import { useQuery } from '@tanstack/react-query';
import { ruqyahService } from '@/services/ruqyahService';
import { clinicCache } from '@/services/clinicCache';
import { cacheKeys } from '@/utils/cacheKeys';
import type { Category } from '@/types/category';

const FIVE_MIN = 1000 * 60 * 5;

/** One category with its subcategories (standard), direct diseases (disease_direct), or recordings (direct). */
export function useCategory(slug: string) {
  const query = useQuery({
    queryKey: cacheKeys.category(slug),
    queryFn: async () => {
      try {
        const data = await ruqyahService.getCategory(slug);
        await clinicCache.saveCategory(slug, data);
        return data;
      } catch {
        const cached = await clinicCache.getCategory(slug);
        if (cached) return cached;
        throw new Error('No internet connection and no cached data available');
      }
    },
    enabled: slug.length > 0,
    staleTime: FIVE_MIN,
    retry: false,
    networkMode: 'offlineFirst',
    refetchInterval: 30_000,
  });
  return {
    category: query.data as Category | undefined,
    subcategories: query.data?.subcategories ?? [],
    directDiseases: query.data?.direct_diseases ?? [],
    recordings: query.data?.recordings ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
