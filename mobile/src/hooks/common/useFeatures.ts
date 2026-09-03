import { useCallback, useEffect } from 'react';
import { AppState } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { cacheKeys } from '@/utils/cacheKeys';
import { featureService } from '@/services/common/featureService';
import { resolveFeatureVisible } from '@/constants/features';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setFlags, selectFeatureFlags } from '@/store/slices/featuresSlice';

/**
 * Fetches feature-visibility flags on launch and caches them into
 * `featuresSlice` (persisted for offline use). Mounted once in `MainApp`.
 *
 * Reflects an admin toggle without a restart by:
 *  - polling every 30s while the app is open (`refetchInterval`),
 *  - refetching whenever the app returns to the foreground,
 *  - honouring a manual pull-to-refresh (see `refreshFeatures`).
 */
export function useFeatures() {
  const dispatch = useAppDispatch();
  const flags = useAppSelector(selectFeatureFlags);

  const query = useQuery({
    queryKey: cacheKeys.features,
    queryFn: featureService.getFeatures,
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 30,
    refetchOnReconnect: true,
  });

  const { data, refetch } = query;

  useEffect(() => {
    if (data) dispatch(setFlags(data));
  }, [data, dispatch]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') refetch();
    });
    return () => sub.remove();
  }, [refetch]);

  const isVisible = useCallback((key: string) => resolveFeatureVisible(flags, key), [flags]);

  return { flags, isVisible, isLoading: query.isLoading };
}

/**
 * Read-only, reactive visibility check for UI consumers (tabs, pills, rows).
 * Does NOT trigger a fetch — `useFeatures()` (in `MainApp`) owns fetching.
 * Applies the parent → child cascade.
 */
export function useFeatureVisibility() {
  const flags = useAppSelector(selectFeatureFlags);
  return useCallback((key: string) => resolveFeatureVisible(flags, key), [flags]);
}

/**
 * Returns a callback that forces an immediate feature-flag refetch.
 * Wire it into a screen's pull-to-refresh so the latest admin toggles apply.
 */
export function useRefreshFeatures() {
  const queryClient = useQueryClient();
  return useCallback(
    () => queryClient.invalidateQueries({ queryKey: cacheKeys.features }),
    [queryClient],
  );
}
