# CUSTOM HOOKS DESIGN

Hooks hold logic; components render. Each hook below is tagged with its data layer:
**[RQ]** React Query (server state) · **[RX]** Redux (app state) · **[L]** local.

## EXISTING HOOKS ✓ (built — do not change behaviour)
- `useAudio` — `expo-av` Sound lifecycle for the Mushaf player (load/play/pause/seek/
  unload). Stays on `expo-av`.
- `useSurahs` — surah list; API-first with SQLite fallback.
- `useSurah` — one surah with verses; API-first with SQLite fallback.
- `useReciters` — reciter list.
- `useVerseTiming` — per-verse timestamps from Quran.com v4 for verse highlighting.

## SERVER-STATE HOOKS (React Query)

### useCategories [RQ]
Categories list. `staleTime: Infinity` (static). Returns `{ categories, isLoading,
error, refetch }`.

### useCategory [RQ]
`useCategory(slug)` — one category with its subcategories.

### useSubcategory [RQ]
`useSubcategory(slug)` — one subcategory with its diseases.

### useDiseases [RQ]
`useDiseases(params)` — diseases for a subcategory/category. `staleTime: 5 min`.

### useDiseaseSearch [RQ + L]
Debounced search (`useDebounce`, 300 ms) over `/diseases/search`; synonym/alias
tolerant; Arabic + English. Returns `{ results, isSearching, query, setQuery }`.

### useDisease [RQ]
`useDisease(slug)` — disease detail (name, description, recordings).

### useRecordings [RQ + RX]
`useRecordings(diseaseId)` — recordings for a disease (max two: summarized + detailed).
Combines with `authSlice` `selectIsPaid` to mark each recording accessible/locked
(summarized free, detailed paid). Returns `{ recordings, accessibleRecordings, isLoading }`.

### useAdhkar [RQ + RX]
Fetches Morning/Evening/Sleep/Waking items. Per-item repeat counters live in
`uiSlice`/local + persisted. Returns grouped items, counters, `incrementCounter`,
`navigatePrev`, `navigateNext`.

### useTahsinat [RQ]
Self / For-Others items; honours `random_order`; repeat counters. Returns
`{ selfItems, othersItems, counters, incrementCounter }`.

### useCourses [RQ] · useSponsors [RQ] · useFeatures [RQ + RX]
List fetches. `useFeatures` writes flags into `featuresSlice` and caches for offline.

## APP-STATE HOOKS (Redux)

### useAuth [RX]
Wraps `authSlice`. Returns `user`, `isAuthenticated`, `isPaid`, `login`, `logout`.
Backed by the existing `AuthContext` bridge (see `store-design.md`).

### usePlayer [RX + L]
The global ruqyah audio player. Drives the `expo-audio` engine, dispatches
progress/state into `playerSlice`. Returns `play`, `pause`, `resume`, `seek`, `stop`,
`setRate`, `currentRecording`, `isPlaying`, `position`, `duration`, `isLoading`.
Separate from the Mushaf `useAudio` — do not merge them.

### useGeneralRuqyah [RX + RQ]
Fetches the `is_general` disease and plays its recording immediately via `usePlayer`
— no intermediate screens. Returns `{ playGeneralRuqyah, isLoading }`.

### useFavorites [RX]
Wraps `favoritesSlice`. Returns `favorites`, `isFavorited(diseaseId)`,
`toggleFavorite`, `syncStatus`. Offline toggles queue via `offlineQueueSlice`.

### useDownloadManager [RX]
Wraps `downloadsSlice` + `audioService`. Returns `download`, `cancel`, `retry`,
`deleteDownload`, `getProgress`, `downloads`, `storageUsage`, `clearAll`. Enforces
Wi-Fi-only and the free-tier session-1-only download limit.

### useSettings [RX] · useTheme [RX] · useLanguage [RX]
Wrap `settingsSlice`. `useTheme`/`useLanguage` keep their **current return shape**
(Context bridge) so existing Mushaf code is untouched.

### useNotificationPreferences [RX]
Wraps `notificationsSlice`. Returns prefs + `updatePreference`,
`scheduleNotifications`.

### useOfflineQueue [RX]
Wraps `offlineQueueSlice`. Returns `enqueue`, `processQueue`, `queueSize`.

### useNetworkStatus [RX + L]
Tracks connectivity, dispatches `uiSlice.setNetworkOnline`, triggers
`processQueue` on reconnect.

## UTILITY HOOKS

### useDebounce [L]
`useDebounce(value, delay = 300)` — delays a value; used by all search inputs.

### useMushafReader [RX] (target)
Optional future hook fronting `mushafSlice`. Only introduced as a behaviour-preserving
replacement for `MushafContext` — see `store-design.md` → Context bridge.

## HOOK RULES
- Server fetches go through React Query with keys from `src/utils/cacheKeys.ts`.
- App state mutations dispatch Redux actions; never mutate state directly.
- Memoize returned objects/callbacks (`useMemo`/`useCallback`) so consumers don't
  re-render needlessly.
- Audio hooks clean up (`unload`/stop) on unmount.
