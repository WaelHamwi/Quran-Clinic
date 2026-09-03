import { useEffect, useRef } from 'react';
import { useAppDispatch } from '@/store/hooks';
import type { AppDispatch } from '@/store/store';
import { useAuth } from '@/context/AuthContext';
import { favoriteService } from '@/services/content/favoriteService';
import { setFavorites, setNodeFavorites, setSyncStatus } from '@/store/slices/favoritesSlice';

/** Pull both favorite kinds from the server into the store. Throws on failure. */
export async function pullServerFavorites(dispatch: AppDispatch): Promise<void> {
  const [diseases, nodes] = await Promise.all([
    favoriteService.getFavorites(),
    favoriteService.getFavoriteNodes(),
  ]);
  dispatch(setFavorites(diseases));
  dispatch(setNodeFavorites(nodes));
}

/**
 * Pulls server-synced favorites (diseases + category/subcategory nodes) down
 * once per authenticated session, so a second device sees favorites made on
 * the first. Guests have no token, so this never fires for them — their
 * favorites stay local-only, same as before.
 */
export function useFavoritesSync() {
  const dispatch = useAppDispatch();
  const { token } = useAuth();
  const syncedForToken = useRef<string | null>(null);

  useEffect(() => {
    if (!token || syncedForToken.current === token) return;
    syncedForToken.current = token;

    let active = true;
    dispatch(setSyncStatus('syncing'));
    pullServerFavorites(dispatch)
      .then(() => {
        if (active) dispatch(setSyncStatus('synced'));
      })
      .catch(() => {
        if (active) dispatch(setSyncStatus('error'));
      });

    return () => {
      active = false;
    };
  }, [token, dispatch]);
}
