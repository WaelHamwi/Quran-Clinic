import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AdhkarTime } from '@/types/adhkar';
import type { NotificationPreferences } from '@/types/notification';
import type { RootState } from '@/store/rootReducer';

interface NotificationsState {
  adhkarMorning: boolean;
  adhkarEvening: boolean;
  adhkarSleep: boolean;
  adhkarWaking: boolean;
  /** When true the waking window is derived from prayer times, not set manually.
   *  Local-only preference — not part of the backend NotificationPreferences payload. */
  wakingAuto: boolean;
  wakingStartTime: string;
  wakingEndTime: string;
  pushToken: string | null;
  permissionGranted: boolean;
}

const initialState: NotificationsState = {
  adhkarMorning: false,
  adhkarEvening: false,
  adhkarSleep: false,
  adhkarWaking: false,
  wakingAuto: false,
  wakingStartTime: '04:30',
  wakingEndTime: '07:30',
  pushToken: null,
  permissionGranted: false,
};

/** Notification preferences. Persisted; synced with the backend. */
const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setAdhkarPref(state, action: PayloadAction<{ type: AdhkarTime; enabled: boolean }>) {
      switch (action.payload.type) {
        case 'morning':
          state.adhkarMorning = action.payload.enabled;
          break;
        case 'evening':
          state.adhkarEvening = action.payload.enabled;
          break;
        case 'sleep':
          state.adhkarSleep = action.payload.enabled;
          break;
        case 'waking':
          state.adhkarWaking = action.payload.enabled;
          break;
      }
    },
    setWakingHours(state, action: PayloadAction<{ start: string; end: string }>) {
      state.wakingStartTime = action.payload.start;
      state.wakingEndTime = action.payload.end;
    },
    setWakingAuto(state, action: PayloadAction<boolean>) {
      state.wakingAuto = action.payload;
    },
    setPushToken(state, action: PayloadAction<string | null>) {
      state.pushToken = action.payload;
    },
    setPermissionGranted(state, action: PayloadAction<boolean>) {
      state.permissionGranted = action.payload;
    },
    setPreferences(state, action: PayloadAction<NotificationPreferences>) {
      const p = action.payload;
      state.adhkarMorning = p.adhkar_morning_enabled;
      state.adhkarEvening = p.adhkar_evening_enabled;
      state.adhkarSleep = p.adhkar_sleep_enabled;
      state.adhkarWaking = p.adhkar_waking_enabled;
      if (p.waking_start_time) state.wakingStartTime = p.waking_start_time;
      if (p.waking_end_time) state.wakingEndTime = p.waking_end_time;
    },
  },
});

export const {
  setAdhkarPref,
  setWakingHours,
  setWakingAuto,
  setPushToken,
  setPermissionGranted,
  setPreferences,
} = notificationsSlice.actions;
export default notificationsSlice.reducer;

export const selectNotifications = (s: RootState): NotificationsState => s.notifications;
export const selectAdhkarEnabled = (s: RootState, type: AdhkarTime): boolean => {
  switch (type) {
    case 'morning':
      return s.notifications.adhkarMorning;
    case 'evening':
      return s.notifications.adhkarEvening;
    case 'sleep':
      return s.notifications.adhkarSleep;
    case 'waking':
      return s.notifications.adhkarWaking;
  }
};
