import { configureStore, type Reducer } from '@reduxjs/toolkit';
import {
  persistReducer,
  persistStore,
  createTransform,
  createMigrate,
  type PersistConfig,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { rootReducer, type RootState } from '@/store/rootReducer';
import type { CompletedDownload } from '@/store/slices/downloadsSlice';
import { clearAuth } from '@/store/slices/authSlice';
import { setUnauthorizedHandler } from '@/services/apiClient';
import { playCountListener } from '@/store/middleware/playCountListener';

type DownloadsSlice = RootState['downloads'];
type DownloadsPersisted = Pick<DownloadsSlice, 'completed' | 'wifiOnly' | 'tasks'>;

/**
 * Persist `completed` + `wifiOnly`, plus any unfinished `tasks` (pending/downloading/failed)
 * so an interrupted download can be resumed on the next launch. Storage is recomputed from
 * the persisted `completed` map rather than persisted directly.
 */
const downloadsTransform = createTransform<DownloadsSlice, DownloadsPersisted>(
  (state) => {
    const tasks = Object.fromEntries(
      Object.entries(state.tasks).filter(([, t]) => t.status !== 'cancelled'),
    );
    return { completed: state.completed, wifiOnly: state.wifiOnly, tasks };
  },
  (persisted) => {
    const completed = persisted.completed ?? {};
    const storageUsed = Object.values(completed).reduce(
      (sum, d: CompletedDownload) => sum + (d.size ?? 0),
      0,
    );
    return {
      tasks: persisted.tasks ?? {},
      completed,
      wifiOnly: persisted.wifiOnly ?? true,
      storageUsed,
    };
  },
  { whitelist: ['downloads'] },
);

type OnboardingSlice = RootState['onboarding'];
type OnboardingPersisted = Pick<OnboardingSlice, 'hasCompletedOnboarding'>;

/** Persist only `hasCompletedOnboarding`; the sponsor/step flags reset each session. */
const onboardingTransform = createTransform<OnboardingSlice, OnboardingPersisted>(
  (state) => ({ hasCompletedOnboarding: state.hasCompletedOnboarding }),
  (persisted) => ({
    hasCompletedOnboarding: persisted.hasCompletedOnboarding ?? false,
    sponsorShownThisSession: false,
    currentStep: 0,
  }),
  { whitelist: ['onboarding'] },
);

// v2: reset hasCompletedOnboarding so all existing devices see onboarding on next launch.
// v3: favorites moved from numeric ids to composite `${kind}:${id}` keys + carry a route.
const migrations = {
  2: (state: any) => ({
    ...state,
    onboarding: {
      hasCompletedOnboarding: false,
      sponsorShownThisSession: false,
      currentStep: 0,
    },
  }),
  3: (state: any) => {
    const oldItems = state?.favorites?.items ?? {};
    const items: Record<string, any> = {};
    for (const [key, value] of Object.entries<any>(oldItems)) {
      // Skip entries already migrated (composite string keys).
      if (key.includes(':')) {
        items[key] = value;
        continue;
      }
      const id = value?.id ?? Number(key);
      items[`disease:${id}`] = {
        ...value,
        favoriteKind: 'disease',
        route: `/hospital/disease/${value?.slug ?? ''}`,
      };
    }
    return { ...state, favorites: { ...state?.favorites, items } };
  },
};

const persistConfig: PersistConfig<RootState> = {
  key: 'root',
  version: 3,
  storage: AsyncStorage,
  // Batch writes: download progress dispatches many times/sec; cap persistence to ~1 write/s.
  throttle: 1000,
  migrate: createMigrate(migrations as any, { debug: false }),
  // `player` and `ui` are intentionally ephemeral.
  whitelist: ['auth', 'favorites', 'readings', 'features', 'onboarding', 'notifications', 'notificationInbox', 'downloads', 'offlineQueue'],
  transforms: [downloadsTransform, onboardingTransform],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  // redux-persist@6 predates redux 5's reducer generics — cast keeps RootState clean.
  reducer: persistedReducer as unknown as Reducer<RootState>,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).prepend(playCountListener.middleware),
});

export const persistor = persistStore(store);

// A 401 from any apiClient request clears auth without a circular import.
setUnauthorizedHandler(() => {
  store.dispatch(clearAuth());
});

export type AppStore = typeof store;
export type AppDispatch = typeof store.dispatch;
export type { RootState };
