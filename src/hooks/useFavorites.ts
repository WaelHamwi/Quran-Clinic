import { useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  toggleFavorite as toggleAction,
  selectFavoriteDiseases,
  selectFavoriteIds,
  selectFavoritesSyncStatus,
} from '@/store/slices/favoritesSlice';
import { enqueue } from '@/store/slices/offlineQueueSlice';
import { selectNetworkOnline } from '@/store/slices/uiSlice';
import { favoriteService } from '@/services/favoriteService';
import type { Disease } from '@/types/disease';

/**
 * Favorited diseases. Toggles update Redux optimistically and persist locally;
 * server sync is attempted and queued on failure (offline or unauthenticated).
 */
export function useFavorites() {
  const dispatch = useAppDispatch();
  const favorites = useAppSelector(selectFavoriteDiseases);
  const favoriteIds = useAppSelector(selectFavoriteIds);
  const syncStatus = useAppSelector(selectFavoritesSyncStatus);
  const online = useAppSelector(selectNetworkOnline);

  const idSet = useMemo(() => new Set(favoriteIds), [favoriteIds]);
  const isFavorited = useCallback((diseaseId: number) => idSet.has(diseaseId), [idSet]);

  const toggleFavorite = useCallback(
    (disease: Disease) => {
      dispatch(toggleAction(disease));
      if (online) {
        favoriteService.toggleFavorite(disease.id).catch(() => {
          dispatch(enqueue({ type: 'favorite', payload: { diseaseId: disease.id } }));
        });
      } else {
        dispatch(enqueue({ type: 'favorite', payload: { diseaseId: disease.id } }));
      }
    },
    [dispatch, online],
  );

  return useMemo(
    () => ({ favorites, favoriteIds, isFavorited, toggleFavorite, syncStatus }),
    [favorites, favoriteIds, isFavorited, toggleFavorite, syncStatus],
  );
}
