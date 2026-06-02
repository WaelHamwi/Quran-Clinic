import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ruqyahService } from '@/services/ruqyahService';
import { cacheKeys } from '@/utils/cacheKeys';
import { useAppSelector } from '@/store/hooks';
import { selectIsPaid } from '@/store/slices/authSlice';
import type { Recording } from '@/types/recording';

const FIVE_MIN = 1000 * 60 * 5;

export interface AccessibleRecording extends Recording {
  /** False when the recording is a paid session and the user lacks access. */
  accessible: boolean;
}

/** Recordings for a disease, sorted by session, each tagged accessible/locked. */
export function useRecordings(diseaseId: number) {
  const query = useQuery({
    queryKey: cacheKeys.recordings(diseaseId),
    queryFn: () => ruqyahService.getRecordings(diseaseId),
    enabled: diseaseId > 0,
    staleTime: FIVE_MIN,
  });

  // Session 1 is free for all; sessions ≥ 2 need a subscription/trial.
  const isPaid = useAppSelector(selectIsPaid);

  const recordings = useMemo<AccessibleRecording[]>(() => {
    const list = [...(query.data ?? [])].sort(
      (a, b) => a.session_number - b.session_number,
    );
    return list.map((r) => ({
      ...r,
      accessible: !r.requires_subscription || r.session_number <= 1 || isPaid,
    }));
  }, [query.data, isPaid]);

  return {
    recordings,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
