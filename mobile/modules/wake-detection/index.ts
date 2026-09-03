import { Platform } from 'react-native';
import { requireOptionalNativeModule } from 'expo-modules-core';

export interface WakeDetectionOptions {
  startTime: string;
  endTime: string;
  stillnessMinutes: number;
  sampleIntervalMs: number;
  /** Android channel carrying the chosen ringtone — created by expo-notifications. */
  channelId: string;
  /** Bundled tone filename, `'default'` for the OS tone, or `''` for silent.
   *  The service plays this itself: a channel's sound cannot be guaranteed to
   *  make a noise, since it is frozen at creation and the user owns it after. */
  soundName: string;
  /** `'alarm'` or `'notification'` — falls back to the other automatically if
   *  the chosen stream's volume is zero. */
  soundStream: string;
  title: string;
  body: string;
  dismissLabel: string;
  repeat: boolean;
  repeatIntervalMinutes: number;
  repeatMax: number;
  /** Text of the permanent notification Android requires for a foreground service. */
  serviceTitle: string;
  serviceBody: string;
  /** The OS-scheduled end-of-window backstops, and when each fires. The service
   *  cancels only the one due today, so a wake-up detected by the sensor does
   *  not silence the coming days' safety net. */
  backstopIds: string[];
  backstopTimes: number[];
}

interface WakeDetectionNativeModule {
  isSupported(): boolean;
  start(options: WakeDetectionOptions): boolean;
  stop(): boolean;
  isBatteryOptimizationIgnored(): boolean;
  requestIgnoreBatteryOptimization(): boolean;
}

// Optional so a build without the native module — an OTA update onto an older
// binary, or iOS, where this has no implementation — degrades to the JS
// detector plus the scheduled backstop instead of crashing at import time.
const native = requireOptionalNativeModule<WakeDetectionNativeModule>('WakeDetection');

/** False on iOS and on any binary predating the module. */
export const isAvailable = Platform.OS === 'android' && native != null;

export const wakeDetectionService = {
  isAvailable,

  isSupported(): boolean {
    if (!isAvailable) return false;
    try {
      return native!.isSupported();
    } catch {
      return false;
    }
  },

  start(options: WakeDetectionOptions): boolean {
    if (!isAvailable) return false;
    try {
      return native!.start(options);
    } catch {
      return false;
    }
  },

  stop(): boolean {
    if (!isAvailable) return false;
    try {
      return native!.stop();
    } catch {
      return false;
    }
  },

  isBatteryOptimizationIgnored(): boolean {
    if (!isAvailable) return true;
    try {
      return native!.isBatteryOptimizationIgnored();
    } catch {
      return true;
    }
  },

  requestIgnoreBatteryOptimization(): boolean {
    if (!isAvailable) return false;
    try {
      return native!.requestIgnoreBatteryOptimization();
    } catch {
      return false;
    }
  },
};
