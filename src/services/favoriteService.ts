import { apiGet, apiPost } from '@/services/apiClient';
import type { Disease } from '@/types/disease';

/**
 * Favorites API (auth-gated on the backend). While auth is bypassed these will
 * 401 — `useFavorites` keeps favorites working locally via redux-persist and
 * treats sync failures gracefully.
 */
export const favoriteService = {
  getFavorites: (): Promise<Disease[]> => apiGet<Disease[]>('/favorites'),

  toggleFavorite: (diseaseId: number): Promise<{ is_favorited: boolean }> =>
    apiPost<{ is_favorited: boolean }>('/favorites/toggle', { disease_id: diseaseId }),
};
