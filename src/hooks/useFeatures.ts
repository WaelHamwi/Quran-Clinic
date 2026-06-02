import { useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { cacheKeys } from '@/utils/cacheKeys';
import { featureService } from '@/services/featureService';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setFlags, selectFeatureFlags } from '@/store/slices/featuresSlice';

/**
 * Fetches feature-visibility flags on launch and caches them into
 * `featuresSlice` (persisted for offline use).
 */
export function useFeatures() {
  const dispatch = useAppDispatch();
  const flags = useAppSelector(selectFeatureFlags);

  const query = useQuery({
    queryKey: cacheKeys.features,
    queryFn: featureService.getFeatures,
    staleTime: 1000 * 60 * 30,
  });

  useEffect(() => {
    if (query.data) dispatch(setFlags(query.data));
  }, [query.data, dispatch]);

  /** Unknown keys default to visible — a missing flag must not hide a feature. */
  const isVisible = useCallback((key: string) => flags[key] !== false, [flags]);

  return { flags, isVisible, isLoading: query.isLoading };
}
