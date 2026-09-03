import reducer, {
  setFavorites,
  setNodeFavorites,
  toggleFavorite,
  reorderFavorites,
  favoriteKey,
  selectFavorites,
} from '@/store/slices/favoritesSlice';
import type { Disease } from '@/types/disease';
import type { FavoriteNodeDto } from '@/services/content/favoriteService';

const disease = (id: number) =>
  ({ id, name: { ar: 'د', en: 'Disease' }, slug: `d-${id}` } as unknown as Disease);

const node = (kind: 'category' | 'subcategory', id: number): FavoriteNodeDto => ({
  kind,
  id,
  name: { ar: 'ن', en: 'Node' },
  slug: `n-${id}`,
  icon: null,
});

describe('favoritesSlice reducer', () => {
  it('setFavorites populates disease items keyed by disease id', () => {
    const state = reducer(undefined, setFavorites([disease(1), disease(2)]));
    const items = selectFavorites({ favorites: state } as any);
    expect(items.map((i) => i.id).sort()).toEqual([1, 2]);
    expect(items.every((i) => i.favoriteKind === 'disease')).toBe(true);
  });

  it('setNodeFavorites populates category/subcategory items', () => {
    const state = reducer(undefined, setNodeFavorites([node('category', 5), node('subcategory', 6)]));
    const items = selectFavorites({ favorites: state } as any);
    expect(items.map((i) => i.favoriteKind).sort()).toEqual(['category', 'subcategory']);
  });

  it('setFavorites does not wipe out existing node favorites, and vice versa', () => {
    let state = reducer(undefined, setNodeFavorites([node('category', 5)]));
    state = reducer(state, setFavorites([disease(1)]));

    const items = selectFavorites({ favorites: state } as any);
    expect(items).toHaveLength(2);
    expect(items.some((i) => i.favoriteKind === 'category' && i.id === 5)).toBe(true);
    expect(items.some((i) => i.favoriteKind === 'disease' && i.id === 1)).toBe(true);

    // Re-hydrating diseases again must not touch the node favorite either.
    state = reducer(state, setFavorites([disease(1), disease(2)]));
    const after = selectFavorites({ favorites: state } as any);
    expect(after).toHaveLength(3);
    expect(after.some((i) => i.favoriteKind === 'category' && i.id === 5)).toBe(true);
  });

  it('setFavorites keeps the user drag order and refreshes surviving items in place', () => {
    let state = reducer(undefined, setFavorites([disease(1), disease(2), disease(3)]));
    state = reducer(state, reorderFavorites(['disease:3', 'disease:1', 'disease:2']));

    // Server returns them in its own order, with a new icon on one of them.
    const refreshed = { ...disease(1), icon: 'https://cdn/one.svg' } as Disease;
    state = reducer(state, setFavorites([refreshed, disease(2), disease(3), disease(4)]));

    const items = selectFavorites({ favorites: state } as any);
    expect(items.map((i) => i.id)).toEqual([3, 1, 2, 4]);
    expect(items.find((i) => i.id === 1)?.icon).toBe('https://cdn/one.svg');
  });

  it('setFavorites drops favorites the server no longer has', () => {
    let state = reducer(undefined, setFavorites([disease(1), disease(2)]));
    state = reducer(state, setFavorites([disease(2)]));

    expect(selectFavorites({ favorites: state } as any).map((i) => i.id)).toEqual([2]);
  });

  it('a disease and a category sharing the same numeric id never collide', () => {
    expect(favoriteKey('disease', 1)).not.toBe(favoriteKey('category', 1));
  });

  it('toggleFavorite still adds/removes a node favorite by composite key', () => {
    let state = reducer(undefined, setNodeFavorites([node('category', 5)]));
    const item = selectFavorites({ favorites: state } as any)[0];

    state = reducer(state, toggleFavorite(item));
    expect(selectFavorites({ favorites: state } as any)).toHaveLength(0);

    state = reducer(state, toggleFavorite(item));
    expect(selectFavorites({ favorites: state } as any)).toHaveLength(1);
  });
});
