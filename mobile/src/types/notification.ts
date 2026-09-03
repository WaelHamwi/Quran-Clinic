/** Notification preferences — mirrors NotificationPreferenceResource. */
export interface NotificationPreferences {
  adhkar_morning_enabled: boolean;
  adhkar_evening_enabled: boolean;
  adhkar_sleep_enabled: boolean;
  adhkar_waking_enabled: boolean;
  waking_start_time: string | null;
  waking_end_time: string | null;
  /** Grace period after a detected wake-up before the reminder fires, 0–60. */
  waking_delay_minutes: number;
}
