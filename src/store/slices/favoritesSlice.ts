import { createSlice, createSelector, type PayloadAction } from '@reduxjs/toolkit';
import type { Translatable } from '@/types/translatable';
import type { Category, Subcategory } from '@/types/category';
import type { Recording } from '@/types/recording';
import type { Disease } from '@/types/disease';
import type { RootState } from '@/store/rootReducer';

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error';

/**
 * What a favorite points at. A `disease` is a ruqyah session collection; a
 * `category` / `subcategory` is a "direct" node whose recordings hang straight
 * off it (no disease layer). Only diseases sync to the server — node favorites
 * are local-only (the backend favorites table stores disease ids).
 */
export type FavoriteKind = 'disease' | 'category' | 'subcategory';

/** A favorited entry — Disease-compatible so the Favorites UI renders any kind. */
export interface FavoriteItem {
  id: number;
  name: Translatable;
  slug: string;
  icon?: string | null;
  favoriteKind: FavoriteKind;
  /** Where the Favorites tab navigates when this item is tapped. */
  route: string;
  // Optional relations used only for the Favorites row subtitle.
  subcategory?: Subcategory;
  category?: Category;
  recordings_count?: number;
  recordings?: Recording[];
}

/** Composite key so a disease and a category sharing a numeric id never collide. */
export function favoriteKey(kind: FavoriteKind, id: number): string {
  return `${kind}:${id}`;
}

interface FavoritesState {
  /** Favorited items keyed by `${kind}:${id}` — stored as objects so the
   *  Favorites screen works fully offline / for a guest (unauthenticated) user. */
  items: Record<string, FavoriteItem>;
  syncStatus: SyncStatus;
}

const initialState: FavoritesState = { items: {}, syncStatus: 'idle' };

/** Server favorites are always diseases — adapt them to the local item shape. */
function diseaseToItem(d: Disease): FavoriteItem {
  return {
    id: d.id,
    name: d.name,
    slug: d.slug,
    icon: d.icon ?? null,
    favoriteKind: 'disease',
    route: `/hospital/disease/${d.slug}`,
    subcategory: d.subcategory,
    category: d.category,
    recordings_count: d.recordings_count,
    recordings: d.recordings,
  };
}

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    setFavorites(state, action: PayloadAction<Disease[]>) {
      state.items = {};
      for (const d of action.payload) {
        state.items[favoriteKey('disease', d.id)] = diseaseToItem(d);
      }
    },
    addFavorite(state, action: PayloadAction<FavoriteItem>) {
      const item = action.payload;
      state.items[favoriteKey(item.favoriteKind, item.id)] = item;
    },
    removeFavorite(state, action: PayloadAction<{ kind: FavoriteKind; id: number }>) {
      delete state.items[favoriteKey(action.payload.kind, action.payload.id)];
    },
    toggleFavorite(state, action: PayloadAction<FavoriteItem>) {
      const item = action.payload;
      const key = favoriteKey(item.favoriteKind, item.id);
      if (state.items[key]) delete state.items[key];
      else state.items[key] = item;
    },
    clearFavorites(state) {
      state.items = {};
    },
    /** Reorder favorites to match `action.payload` (an ordered list of
     *  `${kind}:${id}` keys). Rebuilds the items record in the given order —
     *  `Object.values` preserves insertion order, so the Favorites list renders
     *  in this sequence. Local-only: server has no notion of favorite order. */
    reorderFavorites(state, action: PayloadAction<string[]>) {
      const next: Record<string, FavoriteItem> = {};
      for (const key of action.payload) {
        if (state.items[key]) next[key] = state.items[key];
      }
      // Safety: keep any keys missing from the payload (appended in old order).
      for (const key of Object.keys(state.items)) {
        if (!next[key]) next[key] = state.items[key];
      }
      state.items = next;
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
  reorderFavorites,
  setSyncStatus,
} = favoritesSlice.actions;
export default favoritesSlice.reducer;

export const selectFavoriteItems = (s: RootState): Record<string, FavoriteItem> => s.favorites.items;

// createSelector memoizes the derived array so the reference is stable
// between renders when `items` hasn't changed — prevents spurious re-renders.
export const selectFavorites = createSelector(
  selectFavoriteItems,
  (items): FavoriteItem[] => Object.values(items),
);
/** Composite keys (`${kind}:${id}`) of every favorite — for O(1) membership. */
export const selectFavoriteKeys = createSelector(
  selectFavoriteItems,
  (items): string[] => Object.keys(items),
);
export const selectFavoritesCount = (s: RootState): number =>
  Object.keys(s.favorites.items).length;
export const selectFavoritesSyncStatus = (s: RootState): SyncStatus => s.favorites.syncStatus;
