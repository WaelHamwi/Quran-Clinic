import { apiGet, apiPost } from '@/services/common/apiClient';
import type { Disease } from '@/types/disease';
import type { Translatable } from '@/types/translatable';

export type FavoriteNodeKind = 'category' | 'subcategory';

/** A favorited category/subcategory "direct" playlist node, as returned by the API. */
export interface FavoriteNodeDto {
  kind: FavoriteNodeKind;
  id: number;
  name: Translatable;
  slug: string;
  icon: string | null;
}

/**
 * Favorites API (auth-gated on the backend). The bearer token is attached by
 * apiClient when a session exists; for a guest/unauthenticated user these 401 —
 * `useFavorites` keeps favorites working locally via redux-persist and treats
 * sync failures gracefully.
 */
export const favoriteService = {
  getFavorites: (): Promise<Disease[]> => apiGet<Disease[]>('/favorites'),

  toggleFavorite: (diseaseId: number): Promise<{ is_favorited: boolean }> =>
    apiPost<{ is_favorited: boolean }>('/favorites/toggle', { disease_id: diseaseId }),

  getFavoriteNodes: (): Promise<FavoriteNodeDto[]> => apiGet<FavoriteNodeDto[]>('/favorites/nodes'),

  toggleFavoriteNode: (
    kind: FavoriteNodeKind,
    nodeId: number,
  ): Promise<{ is_favorited: boolean }> =>
    apiPost<{ is_favorited: boolean }>('/favorites/nodes/toggle', { kind, node_id: nodeId }),
};
