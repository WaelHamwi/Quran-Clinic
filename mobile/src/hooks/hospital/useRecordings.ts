import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ruqyahService } from '@/services/content/ruqyahService';
import { cachedFetch } from '@/services/common/contentCache';
import { cacheKeys } from '@/utils/cacheKeys';
import { useAppSelector } from '@/store/hooks';
import { selectIsPaid } from '@/store/slices/authSlice';
import { sortSummarizedFirst } from '@/utils/recordings';
import type { AccessibleRecording } from '@/types/recording';

const FIVE_MIN = 1000 * 60 * 5;

export function useRecordings(diseaseId: number) {
  const query = useQuery({
    queryKey: cacheKeys.recordings(diseaseId),
    queryFn: () =>
      cachedFetch(`clinic_recordings_${diseaseId}`, () => ruqyahService.getRecordings(diseaseId)),
    enabled: diseaseId > 0,
    staleTime: FIVE_MIN,
    refetchInterval: 30_000,
  });

  // The summarized (مختصرة) recording is free for all; the detailed (مطولة)
  // one needs a subscription/trial.
  const isPaid = useAppSelector(selectIsPaid);

  const recordings = useMemo<AccessibleRecording[]>(() => {
    return sortSummarizedFirst(query.data ?? []).map((r) => ({
      ...r,
      accessible: !r.requires_subscription || isPaid,
    }));
  }, [query.data, isPaid]);

  return {
    recordings,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
