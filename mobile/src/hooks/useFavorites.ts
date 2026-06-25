import { useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  toggleFavorite as toggleAction,
  reorderFavorites as reorderAction,
  favoriteKey,
  selectFavorites,
  selectFavoriteKeys,
  selectFavoritesSyncStatus,
  type FavoriteItem,
  type FavoriteKind,
} from '@/store/slices/favoritesSlice';
import { enqueue } from '@/store/slices/offlineQueueSlice';
import { selectNetworkOnline } from '@/store/slices/uiSlice';
import { favoriteService } from '@/services/favoriteService';
import type { Translatable } from '@/types/translatable';
import type { Category, Subcategory } from '@/types/category';
import type { Recording } from '@/types/recording';

/** Anything favoritable: a Disease, Category, or Subcategory all share this shape. */
interface FavoriteSource {
  id: number;
  name: Translatable;
  slug: string;
  icon?: string | null;
  subcategory?: Subcategory;
  category?: Category;
  recordings_count?: number;
  recordings?: Recording[];
}

/**
 * Favorited diseases and "direct" recording nodes (category/subcategory). Toggles
 * update Redux optimistically and persist locally; disease favorites also sync to
 * the server (queued on failure). Node favorites are local-only — the backend
 * favorites table only knows disease ids.
 */
export function useFavorites() {
  const dispatch = useAppDispatch();
  const favorites = useAppSelector(selectFavorites);
  const favoriteKeys = useAppSelector(selectFavoriteKeys);
  const syncStatus = useAppSelector(selectFavoritesSyncStatus);
  const online = useAppSelector(selectNetworkOnline);

  const keySet = useMemo(() => new Set(favoriteKeys), [favoriteKeys]);
  const isFavorited = useCallback(
    (id: number, kind: FavoriteKind = 'disease') => keySet.has(favoriteKey(kind, id)),
    [keySet],
  );

  const toggleFavorite = useCallback(
    (source: FavoriteSource, kind: FavoriteKind = 'disease', route?: string) => {
      const item: FavoriteItem = {
        id: source.id,
        name: source.name,
        slug: source.slug,
        icon: source.icon ?? null,
        favoriteKind: kind,
        route: route ?? `/hospital/disease/${source.slug}`,
        subcategory: source.subcategory,
        category: source.category,
        recordings_count: source.recordings_count,
        recordings: source.recordings,
      };
      dispatch(toggleAction(item));

      // Only diseases sync to the server; node favorites stay local.
      if (kind !== 'disease') return;
      if (online) {
        favoriteService.toggleFavorite(source.id).catch(() => {
          dispatch(enqueue({ type: 'favorite', payload: { diseaseId: source.id } }));
        });
      } else {
        dispatch(enqueue({ type: 'favorite', payload: { diseaseId: source.id } }));
      }
    },
    [dispatch, online],
  );

  /** Persist a new favorite order (list of `${kind}:${id}` keys). */
  const reorderFavorites = useCallback(
    (orderedKeys: string[]) => {
      dispatch(reorderAction(orderedKeys));
    },
    [dispatch],
  );

  return useMemo(
    () => ({ favorites, favoriteKeys, isFavorited, toggleFavorite, reorderFavorites, syncStatus }),
    [favorites, favoriteKeys, isFavorited, toggleFavorite, reorderFavorites, syncStatus],
  );
}
