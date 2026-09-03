# REDUX TOOLKIT STORE DESIGN

Redux Toolkit is the **primary client/app-state layer**. React Query owns server
state only. Keep three layers strictly separate:

| Layer | Owner | Examples |
|---|---|---|
| Server state | React Query | categories, diseases, recordings, adhkar, surahs, courses |
| Application state | Redux slices | auth, subscription, player, downloads, favorites, settings |
| Ephemeral UI state | local `useState` / `uiSlice` | input focus, expanded rows, toasts |

We use **TanStack React Query** (already in the project) for server state — **not**
RTK Query — to avoid two competing data layers.

## STORE LAYOUT
```
src/store/
├── store.ts          # configureStore + redux-persist + middleware
├── hooks.ts          # useAppDispatch, useAppSelector (typed)
├── rootReducer.ts    # combineReducers
└── slices/
    ├── authSlice.ts
    ├── playerSlice.ts
    ├── downloadsSlice.ts
    ├── favoritesSlice.ts
    ├── featuresSlice.ts
    ├── onboardingSlice.ts
    ├── settingsSlice.ts
    ├── notificationsSlice.ts
    ├── mushafSlice.ts
    ├── offlineQueueSlice.ts
    └── uiSlice.ts
```
`StoreProvider` (`src/providers/StoreProvider.tsx`) wraps the app with `<Provider>`
+ `<PersistGate>`, nested inside the existing `QueryProvider`.

## SLICES

### authSlice — authentication / session / subscription
- State: `user`, `token` (mirror only — source of truth is secure-store),
  `status` ('idle'|'authenticating'|'authenticated'|'error'), `error`,
  `subscriptionTier` ('free'|'paid'), `trialActive`, `trialUsedCount`.
- Reducers: `setUser`, `clearAuth`, `setSubscription`, `setStatus`.
- Thunks: `loginWithGoogle`, `register`, `login`, `logout`, `fetchMe`.
- Selectors: `selectIsAuthenticated`, `selectIsPaid`, `selectCanAccessSession(n)`
  (summarized recording → true; detailed → paid or trial).
- Note: auth is **bypassed for development** (see CLAUDE.md). The slice exists and is
  wired, but `_layout.tsx` does not gate on it. Do not re-enable the guard unasked.

### playerSlice — global audio player (ruqyah recordings)
- State: `currentRecording`, `diseaseId`, `isPlaying`, `positionMillis`,
  `durationMillis`, `playbackRate`, `volume`, `source` ('stream'|'local'),
  `isLoading`, `miniPlayerVisible`.
- Reducers: `setRecording`, `play`, `pause`, `stop`, `setProgress`, `seek`,
  `setRate`, `setVolume`, `showMiniPlayer`, `hideMiniPlayer`.
- Thunks: `loadAndPlayRecording`, `playGeneralRuqyah`.
- The audio engine (`expo-audio`) is driven by the `usePlayer` hook, which dispatches
  progress/state into this slice. The existing Mushaf player is separate (see below).

### downloadsSlice — offline downloads
- State: `tasks` (record by `recordingId`: status, progress, totalBytes, error),
  `completed` (record of downloaded items: localPath, size, downloadedAt),
  `storageUsed`, `wifiOnly` (default `true`).
- Reducers: `startTask`, `updateProgress`, `completeTask`, `failTask`,
  `cancelTask`, `removeDownload`, `setWifiOnly`, `setStorageUsed`, `clearAll`.
- Thunks: `downloadRecording`, `deleteDownload`, `recomputeStorage`.
- `completed` + `wifiOnly` are persisted; live `tasks` are not.

### favoritesSlice — favorited diseases (diseases only)
- State: `diseaseIds` (number[]), `syncStatus` ('idle'|'syncing'|'synced'|'error').
- Reducers: `setFavorites`, `addFavorite`, `removeFavorite`, `toggleFavorite`,
  `clearFavorites`.
- Thunks: `fetchFavorites`, `syncFavorites` (POST `/favorites/toggle`; queues to
  `offlineQueueSlice` when offline).
- Selectors: `selectIsFavorited(diseaseId)` via `createSelector`.

### featuresSlice — feature visibility flags
- State: `flags` (record<string, boolean>), `fetchedAt`, `status`.
- Reducers: `setFlags`.
- Thunks: `fetchFeatures` (GET `/features` on launch; result cached/persisted for
  offline). Selector `selectIsFeatureVisible(key)`.

### onboardingSlice — onboarding & sponsor flow
- State: `hasCompletedOnboarding` (persisted), `sponsorShownThisSession` (not
  persisted), `currentStep`.
- Reducers: `completeOnboarding`, `markSponsorShown`, `setStep`, `resetSession`.

### settingsSlice — app settings / preferences
- State: `theme` ('light'|'dark'|'system'), `language` ('ar'|'en').
- Reducers: `setTheme`, `setLanguage`.
- Fully persisted. Backs the Theme/Language context bridge (see below).

### notificationsSlice — notification preferences
- State: `adhkarMorning`, `adhkarEvening`, `adhkarSleep`, `adhkarWaking` (booleans),
  `wakingStartTime`, `wakingEndTime`, `pushToken`.
- Reducers: `setAdhkarPref`, `setWakingHours`, `setPushToken`.
- Thunks: `fetchPreferences`, `savePreferences` (sync with backend).

### mushafSlice — Mushaf reader state
- State: `selectedSurahId`, `selectedReciterId`, `fontSize`, `showTranslation`.
- Reducers: `setSelectedSurah`, `setSelectedReciter`, `setFontSize`,
  `toggleTranslation`.
- ⚠ The shipped Mushaf currently keeps this in `MushafContext`. This slice is the
  **target**. Migration is optional and must be behaviour-preserving — see below.

### offlineQueueSlice — queued offline actions
- State: `queue` (items: id, type 'favorite'|'feedback'|'playCount', payload,
  timestamp, retryCount), `processing`.
- Reducers: `enqueue`, `dequeue`, `incrementRetry`, `setProcessing`, `clearQueue`.
- Thunks: `processQueue` (runs on reconnect; drops after 3 failed retries).

### uiSlice — global UI state
- State: `networkOnline`, `activeToast`, `activeModal`, per-tab selections for
  Adhkar/Tahsinat tab views.
- Reducers: `setNetworkOnline`, `showToast`, `dismissToast`, `setModal`,
  `setAdhkarTab`, `setTahsinatTab`.
- Not persisted.

## PERSISTENCE (`redux-persist` + `AsyncStorage`)
- Persisted slices: `auth` (without `token`), `favorites`, `settings`, `onboarding`
  (`hasCompletedOnboarding` only), `features`, `downloads` (`completed` + `wifiOnly`),
  `notifications`, `mushaf`, `offlineQueue`.
- Not persisted: `player`, `ui`, live `downloads.tasks`.
- The auth **token** lives in `expo-secure-store` (`src/lib/tokenManager.ts`), never
  in persisted Redux state. On launch, `authSlice` rehydrates the token from
  secure-store and validates it via `fetchMe`.
- `configureStore` middleware: ignore `redux-persist` action types in
  `serializableCheck`.

## TYPED HOOKS & SELECTORS
- `src/store/hooks.ts` exports `useAppDispatch` and `useAppSelector` typed against
  `AppDispatch` / `RootState`.
- All derived data uses `createSelector`. Co-locate selectors with their slice.
- Components never compute derived data inline — they read memoized selectors.

## EXISTING CONTEXT BRIDGE (preserve the Mushaf)
The shipped app uses `AuthContext`, `ThemeContext`, `LanguageContext`,
`MushafContext`. To make Redux the source of truth **without editing Mushaf screens**:

1. Keep the public hook APIs stable — `useTheme()`, `useLanguage()`,
   `useMushafContext()`, `useAuth()` keep the same return shape.
2. Re-implement each provider as a **thin adapter** that reads from the matching
   Redux slice and dispatches on change. Existing call sites compile unchanged.
3. Migrate one context at a time; after each, verify the Mushaf behaves identically.
4. If migrating a context is risky, leave it as plain Context — Redux primacy applies
   to **new** features; a working Mushaf outranks architectural uniformity.

This honours both goals: Redux Toolkit as the primary architecture, and an untouched,
non-corrupted Mushaf feature.
