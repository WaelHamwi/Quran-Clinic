# PERFORMANCE OPTIMIZATIONS

## MEMOIZATION
- **useMemo** — derived data (filtered/grouped/sorted lists, search results,
  shuffled tahsinat, theme-dependent style objects).
- **useCallback** — handlers passed to children, `FlatList` `renderItem`/
  `keyExtractor`, navigation callbacks.
- **React.memo** — pure list rows: `CategoryCard`, `DiseaseCard`, `RecordingCard`,
  `AdhkarItemRow`, `TahsinatItemRow`, `SurahRow`, `VerseRow`. Use a custom comparator
  where a prop is an object (e.g. `DiseaseCard` on `disease.id` + `isFavorited`).

## REDUX PERFORMANCE
- Derived state via `createSelector` — never compute in the component body.
- `useAppSelector` returns the **narrowest** slice needed; avoid selecting whole
  slices. Use `shallowEqual` / memoized selectors for object/array returns.
- Keep `playerSlice` progress updates throttled (~4/sec) so high-frequency audio
  position updates don't thrash subscribed components.
- Never dispatch inside render.

## FLATLIST
- `useCallback` for `renderItem` and `keyExtractor`.
- `removeClippedSubviews={true}`, `maxToRenderPerBatch={10}`, `windowSize={5}`,
  `initialNumToRender={8}`.
- `getItemLayout` for fixed-height rows (the existing reader handles variable rows
  via `onScrollToIndexFailed` — keep that pattern).
- `extraData` only the primitives that affect rows (mirror `mushaf/[id].tsx`).

## IMAGES
- `expo-image` for category/sponsor imagery and any WebP assets; placeholder while
  loading; `priority` for above-the-fold images only.

## REACT QUERY CONFIG
- Static (categories, surahs, reciters): `staleTime: Infinity`.
- Semi-static (diseases, adhkar, tahsinat): `staleTime: 5 min`.
- User-specific (favorites): `staleTime: 0`, refetch on focus.
- `gcTime: 10 min`, retry 2×. Keys centralized in `src/utils/cacheKeys.ts`.

## AVOID RERENDERS
- No inline arrow functions, objects, or arrays in props — `useCallback`/`useMemo` or
  module-level constants.
- Stable `StyleSheet.create` objects; for theme-dependent styles use a memoized
  `createXStyles(theme)` factory (existing pattern).
- Correct dependency arrays in every `useEffect`/`useMemo`/`useCallback`.

## LAZY LOADING
- Adhkar/Tahsinat: render a tab's content only when selected.
- Audio player / heavy screens: lean on Expo Router's route-level lazy loading.
- Mushaf reader: load the current verse range; the existing windowed `FlatList`
  already handles this — do not regress it.

## MEMORY MANAGEMENT
- Unload audio (`expo-av` Sound for Mushaf, `expo-audio` for ruqyah) on unmount.
- Remove accelerometer and notification listeners on unmount.
- On logout: clear the React Query cache, clear downloaded audio, purge persisted
  user state.
