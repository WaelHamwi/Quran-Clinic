import type { Translatable } from '@/types/translatable';

/** Milliseconds → `m:ss` (or `h:mm:ss`). Used by audio players. */
export function formatMillis(millis: number): string {
  if (!Number.isFinite(millis) || millis < 0) return '0:00';
  const totalSeconds = Math.floor(millis / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const ss = String(seconds).padStart(2, '0');
  if (hours > 0) return `${hours}:${String(minutes).padStart(2, '0')}:${ss}`;
  return `${minutes}:${ss}`;
}

/** Seconds → `m:ss`. */
export function formatSeconds(seconds: number | null | undefined): string {
  return formatMillis((seconds ?? 0) * 1000);
}

/** Byte count → human-readable size. */
export function formatBytes(bytes: number): string {
  if (!bytes || bytes < 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

/** Pick the active-language string from a Translatable, falling back to Arabic. */
export function pickText(value: Translatable | null | undefined, isArabic: boolean): string {
  if (!value) return '';
  if (isArabic) return value.ar ?? value.en ?? '';
  return value.en || value.ar || '';
}

/** ISO date string → localized short date. */
export function formatDate(iso: string | null | undefined, locale = 'en'): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(locale === 'ar' ? 'ar' : 'en', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
