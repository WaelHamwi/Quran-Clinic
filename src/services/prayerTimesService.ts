import * as Location from 'expo-location';
import { Coordinates, CalculationMethod, PrayerTimes } from 'adhan';

/** A computed waking window, derived from the day's prayer times.
 *  `start` = Fajr (dawn), `end` = sunrise — the natural span for waking adhkar. */
export interface PrayerWakingWindow {
  start: string; // "HH:MM"
  end: string; // "HH:MM"
}

/** Prayer times (as Date objects) for a single calendar day. */
export interface DayPrayerTimes {
  date: Date;
  fajr: Date;
  sunrise: Date;
  dhuhr: Date;
  asr: Date;
  maghrib: Date;
  isha: Date;
}

/** Mecca — used as a sensible fallback when device location is unavailable. */
const FALLBACK_COORDS = { latitude: 21.4225, longitude: 39.8262 };

/** Umm al-Qura — the official calculation method of Saudi Arabia. The app is
 *  primarily aimed at Saudi users, so this is the correct default everywhere. */
const calcParams = () => CalculationMethod.UmmAlQura();

function toHHMM(date: Date): string {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

/** Resolve device coordinates, requesting foreground permission if needed.
 *  Returns the Mecca fallback when permission is denied or lookup fails. */
async function resolveCoordinates(): Promise<{ latitude: number; longitude: number }> {
  try {
    let granted = (await Location.getForegroundPermissionsAsync()).granted;
    if (!granted) {
      granted = (await Location.requestForegroundPermissionsAsync()).granted;
    }
    if (!granted) return FALLBACK_COORDS;

    const last = await Location.getLastKnownPositionAsync();
    const pos = last ?? (await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Low,
    }));
    return { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
  } catch {
    return FALLBACK_COORDS;
  }
}

/**
 * Official prayer-time calculations (Umm al-Qura) powered by `adhan`.
 * Pure-JS — no native module / rebuild required. Location lookup falls back to
 * Mecca if permission is denied, so callers always get usable times.
 */
export const prayerTimesService = {
  /** Today's waking window (Fajr → sunrise). Falls back to a fixed window. */
  async getWakingWindow(): Promise<PrayerWakingWindow> {
    try {
      const { latitude, longitude } = await resolveCoordinates();
      const coords = new Coordinates(latitude, longitude);
      const times = new PrayerTimes(coords, new Date(), calcParams());
      return { start: toHHMM(times.fajr), end: toHHMM(times.sunrise) };
    } catch {
      return { start: '04:30', end: '07:30' };
    }
  },

  /** Prayer times for each of the given dates, computed for the device location. */
  async getDailyPrayerTimes(dates: Date[]): Promise<DayPrayerTimes[]> {
    const { latitude, longitude } = await resolveCoordinates();
    const coords = new Coordinates(latitude, longitude);
    return dates.map((date) => {
      const t = new PrayerTimes(coords, date, calcParams());
      return {
        date,
        fajr: t.fajr,
        sunrise: t.sunrise,
        dhuhr: t.dhuhr,
        asr: t.asr,
        maghrib: t.maghrib,
        isha: t.isha,
      };
    });
  },
};
