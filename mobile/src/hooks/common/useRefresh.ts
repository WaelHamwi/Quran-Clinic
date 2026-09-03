import { useCallback, useState } from 'react';

/**
 * Manages the `refreshing` boolean for pull-to-refresh gestures.
 * Pass any async function (or composed `Promise.all`) as `refetch`.
 */
export function useRefresh(refetch: () => Promise<unknown> | unknown) {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  return { refreshing, onRefresh };
}
