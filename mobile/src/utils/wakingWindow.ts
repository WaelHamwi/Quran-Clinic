const HHMM = /^(\d{1,2}):(\d{2})$/;

/** Parse an "HH:MM" string into { hour, minute }; null if malformed or out of range. */
export function parseHHMM(hhmm: string): { hour: number; minute: number } | null {
  const match = HHMM.exec(String(hhmm));
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour > 23 || minute > 59) return null;
  return { hour, minute };
}

/** Minutes elapsed since local midnight; null if the time is malformed. */
export function minutesOfDay(hhmm: string): number | null {
  const t = parseHHMM(hhmm);
  return t ? t.hour * 60 + t.minute : null;
}

/**
 * True when `now` falls inside the `[start, end]` waking window.
 *
 * The window is allowed to cross midnight (start > end, e.g. 23:00 → 05:00),
 * in which case it is the union of [start, 24:00) and [00:00, end]. A malformed
 * or zero-length window matches nothing, so a bad preference can never make the
 * wake reminder fire all day.
 */
export function isWithinWakingWindow(now: Date, start: string, end: string): boolean {
  const from = minutesOfDay(start);
  const to = minutesOfDay(end);
  if (from == null || to == null || from === to) return false;
  const at = now.getHours() * 60 + now.getMinutes();
  return from < to ? at >= from && at <= to : at >= from || at <= to;
}

/** Local calendar day as "YYYY-MM-DD" — the once-per-day key for wake detection. */
export function localDayKey(now: Date = new Date()): string {
  const pad = (n: number): string => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}
