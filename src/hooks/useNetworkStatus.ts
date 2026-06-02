import { useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setNetworkOnline, selectNetworkOnline } from '@/store/slices/uiSlice';

/**
 * Tracks connectivity and mirrors it into `uiSlice`. The offline-action queue
 * watches the same `networkOnline` flag (see `useOfflineQueue`) to retry on
 * reconnect — kept separate so this hook has no forward dependency.
 */
export function useNetworkStatus(): { online: boolean } {
  const dispatch = useAppDispatch();
  const online = useAppSelector(selectNetworkOnline);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const isOnline = state.isConnected === true && state.isInternetReachable !== false;
      dispatch(setNetworkOnline(isOnline));
    });
    return () => unsubscribe();
  }, [dispatch]);

  return { online };
}
