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
import { favoriteService } from '@/services/content/favoriteService';
import { pullServerFavorites } from '@/hooks/content/useFavoritesSync';
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
 * update Redux optimistically and persist locally; both kinds sync to the server
 * (queued on failure) — diseases via /favorites, nodes via /favorites/nodes.
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

      if (kind === 'disease') {
        if (online) {
          favoriteService.toggleFavorite(source.id).catch(() => {
            dispatch(enqueue({ type: 'favorite', payload: { diseaseId: source.id } }));
          });
        } else {
          dispatch(enqueue({ type: 'favorite', payload: { diseaseId: source.id } }));
        }
        return;
      }

      // Category/subcategory node favorite — same optimistic + offline-queue
      // pattern as diseases, via the separate /favorites/nodes endpoints.
      if (online) {
        favoriteService.toggleFavoriteNode(kind, source.id).catch(() => {
          dispatch(enqueue({ type: 'favoriteNode', payload: { kind, nodeId: source.id } }));
        });
      } else {
        dispatch(enqueue({ type: 'favoriteNode', payload: { kind, nodeId: source.id } }));
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

  /** Pull-to-refresh: re-read every favorite from the server so stale locally
   *  stored copies (name, icon, section) are replaced. A guest gets a 401 and an
   *  offline device a network error — both keep the local list untouched. */
  const refreshFavorites = useCallback(async () => {
    try {
      await pullServerFavorites(dispatch);
    } catch {
      // Guest or offline — local favorites remain authoritative.
    }
  }, [dispatch]);

  return useMemo(
    () => ({
      favorites,
      favoriteKeys,
      isFavorited,
      toggleFavorite,
      reorderFavorites,
      refreshFavorites,
      syncStatus,
    }),
    [
      favorites,
      favoriteKeys,
      isFavorited,
      toggleFavorite,
      reorderFavorites,
      refreshFavorites,
      syncStatus,
    ],
  );
}
