import { createSlice, createSelector, type PayloadAction } from '@reduxjs/toolkit';
import type { Disease } from '@/types/disease';
import type { RootState } from '@/store/rootReducer';

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error';

interface FavoritesState {
  /** Favorited DISEASES keyed by id — stored as objects so the Favorites
   *  screen works fully offline / for a guest (unauthenticated) user. */
  items: Record<number, Disease>;
  syncStatus: SyncStatus;
}

const initialState: FavoritesState = { items: {}, syncStatus: 'idle' };

/** Favorited diseases only (RULE_30). Persisted. */
const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    setFavorites(state, action: PayloadAction<Disease[]>) {
      state.items = {};
      for (const d of action.payload) state.items[d.id] = d;
    },
    addFavorite(state, action: PayloadAction<Disease>) {
      state.items[action.payload.id] = action.payload;
    },
    removeFavorite(state, action: PayloadAction<number>) {
      delete state.items[action.payload];
    },
    toggleFavorite(state, action: PayloadAction<Disease>) {
      const id = action.payload.id;
      if (state.items[id]) delete state.items[id];
      else state.items[id] = action.payload;
    },
    clearFavorites(state) {
      state.items = {};
    },
    setSyncStatus(state, action: PayloadAction<SyncStatus>) {
      state.syncStatus = action.payload;
    },
  },
});

export const {
  setFavorites,
  addFavorite,
  removeFavorite,
  toggleFavorite,
  clearFavorites,
  setSyncStatus,
} = favoritesSlice.actions;
export default favoritesSlice.reducer;

export const selectFavoriteItems = (s: RootState): Record<number, Disease> => s.favorites.items;

// createSelector memoizes the derived array so the reference is stable
// between renders when `items` hasn't changed — prevents spurious re-renders.
export const selectFavoriteDiseases = createSelector(
  selectFavoriteItems,
  (items): Disease[] => Object.values(items),
);
export const selectFavoriteIds = createSelector(
  selectFavoriteItems,
  (items): number[] => Object.keys(items).map(Number),
);
export const selectFavoritesCount = (s: RootState): number =>
  Object.keys(s.favorites.items).length;
export const selectIsFavorited = (s: RootState, diseaseId: number): boolean =>
  diseaseId in s.favorites.items;
export const selectFavoritesSyncStatus = (s: RootState): SyncStatus => s.favorites.syncStatus;
