import { combineReducers } from '@reduxjs/toolkit';
import auth from '@/store/slices/authSlice';
import player from '@/store/slices/playerSlice';
import downloads from '@/store/slices/downloadsSlice';
import favorites from '@/store/slices/favoritesSlice';
import readings from '@/store/slices/readingsSlice';
import features from '@/store/slices/featuresSlice';
import onboarding from '@/store/slices/onboardingSlice';
import notifications from '@/store/slices/notificationsSlice';
import offlineQueue from '@/store/slices/offlineQueueSlice';
import ui from '@/store/slices/uiSlice';
import drivingMode from '@/store/slices/drivingModeSlice';

export const rootReducer = combineReducers({
  auth,
  player,
  downloads,
  favorites,
  readings,
  features,
  onboarding,
  notifications,
  offlineQueue,
  ui,
  drivingMode,
});

export type RootState = ReturnType<typeof rootReducer>;
