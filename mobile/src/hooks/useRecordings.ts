import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ruqyahService } from '@/services/ruqyahService';
import { cachedFetch } from '@/services/contentCache';
import { cacheKeys } from '@/utils/cacheKeys';
import { useAppSelector } from '@/store/hooks';
import { selectIsPaid } from '@/store/slices/authSlice';
import type { Recording } from '@/types/recording';

const FIVE_MIN = 1000 * 60 * 5;

export interface AccessibleRecording extends Recording {
  /** False when the recording is a paid session and the user lacks access. */
  accessible: boolean;
}

/**
 * Recordings metadata for a disease, sorted by session, each tagged accessible/locked.
 * The metadata + ruqyah text (title, description, segments) is cached for offline use;
 * the audio FILES are not — the user must download those explicitly via the player.
 */
export function useRecordings(diseaseId: number) {
  const query = useQuery({
    queryKey: cacheKeys.recordings(diseaseId),
    queryFn: () =>
      cachedFetch(`clinic_recordings_${diseaseId}`, () => ruqyahService.getRecordings(diseaseId)),
    enabled: diseaseId > 0,
    staleTime: FIVE_MIN,
    refetchInterval: 30_000,
  });

  // Session 1 is free for all; sessions ≥ 2 need a subscription/trial.
  const isPaid = useAppSelector(selectIsPaid);

  const recordings = useMemo<AccessibleRecording[]>(() => {
    const list = [...(query.data ?? [])].sort((a, b) => {
      if (a.is_free !== b.is_free) return a.is_free ? -1 : 1;
      return a.session_number - b.session_number;
    });
    return list.map((r) => ({
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
