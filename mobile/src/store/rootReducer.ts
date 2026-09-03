import { combineReducers } from '@reduxjs/toolkit';
import auth from '@/store/slices/authSlice';
import player from '@/store/slices/playerSlice';
import downloads from '@/store/slices/downloadsSlice';
import favorites from '@/store/slices/favoritesSlice';
import features from '@/store/slices/featuresSlice';
import onboarding from '@/store/slices/onboardingSlice';
import notifications from '@/store/slices/notificationsSlice';
import notificationInbox from '@/store/slices/notificationInboxSlice';
import offlineQueue from '@/store/slices/offlineQueueSlice';
import ui from '@/store/slices/uiSlice';
import drivingMode from '@/store/slices/drivingModeSlice';
import recordingHistory from '@/store/slices/recordingHistorySlice';

export const rootReducer = combineReducers({
  auth,
  player,
  downloads,
  favorites,
  features,
  onboarding,
  notifications,
  notificationInbox,
  offlineQueue,
  ui,
  drivingMode,
  recordingHistory,
});

export type RootState = ReturnType<typeof rootReducer>;
