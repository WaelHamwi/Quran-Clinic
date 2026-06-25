/** Notification preferences — mirrors NotificationPreferenceResource. */
export interface NotificationPreferences {
  adhkar_morning_enabled: boolean;
  adhkar_evening_enabled: boolean;
  adhkar_sleep_enabled: boolean;
  adhkar_waking_enabled: boolean;
  waking_start_time: string | null;
  waking_end_time: string | null;
}
