import { useQuery } from '@tanstack/react-query';
import { quranService } from '@/services/quranService';
import { cachedFetch } from '@/services/contentCache';
import type { PaginatedResponse } from '@/types/surah';
import type { Reciter } from '@/types/reciter';

export function useReciters() {
  return useQuery<PaginatedResponse<Reciter>>({
    queryKey: ['reciters'],
    queryFn: () => cachedFetch('reciters_list', () => quranService.getReciters()),
    staleTime: 10 * 60 * 1000,
  });
}
