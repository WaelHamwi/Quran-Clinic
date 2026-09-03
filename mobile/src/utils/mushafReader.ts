// Shared types, constants and pure helpers for the Mushaf reader
// (`app/mushaf/[id].tsx`) and its components/hooks. Kept framework-free
// so the formatters can be unit-tested in isolation.

export const TOTAL_SURAHS = 114;

/** Vertical scroll (continuous) vs. horizontal page-turn (pages). */
export type ReaderDisplayMode = 'continuous' | 'pages';

export type FontScale = 'sm' | 'md' | 'lg' | 'xl';
export const FONT_SCALES: FontScale[] = ['sm', 'md', 'lg', 'xl'];
export const ARABIC_FONT_SIZES: Record<FontScale, number> = { sm: 18, md: 22, lg: 26, xl: 32 };
export const ARABIC_LINE_HEIGHTS: Record<FontScale, number> = { sm: 34, md: 42, lg: 50, xl: 60 };
export const ENGLISH_FONT_SIZES: Record<FontScale, number> = { sm: 12, md: 14, lg: 16, xl: 18 };
export const FONT_SCALE_LABELS: Record<FontScale, string> = { sm: 'S', md: 'M', lg: 'L', xl: 'XL' };

// The legacy complete-surah files (quranicaudio.com, seeded by the backend)
// open with a recited basmalah (~5–8 s, sometimes preceded by isti'adhah) that
// has no verse of its own. When exact verse timings are unavailable, the
// highlight logic assumes this lead so verse 1 isn't lit during the basmalah.
export const BASMALAH_LEAD_MS = 6000;

/** Capped at half the track so very short surahs aren't swallowed by the lead. */
export function estimateBasmalahLeadMs(durationMillis: number): number {
  return durationMillis > 0
    ? Math.min(BASMALAH_LEAD_MS, durationMillis * 0.5)
    : BASMALAH_LEAD_MS;
}

// Verse-reference pattern: "2:255", "2.255", "٢:٢٥٥" (after digit normalization)
export const VERSE_REF_RE = /^(\d+)\s*[:：.]\s*(\d+)$/;

export function normalizeArabicDigits(s: string): string {
  // Arabic-Indic digits U+0660–U+0669 → Western 0–9
  return s.replace(/[٠-٩]/g, (c) => String(c.codePointAt(0)! - 0x0660));
}

const EASTERN_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'] as const;

/** Western number → Eastern-Arabic digits (e.g. 255 → ٢٥٥). */
export function toEastern(n: number): string {
  return String(n).split('').map((d) => EASTERN_DIGITS[+d]).join('');
}

/**
 * Milliseconds → `m:ss`. NOTE: minutes are NOT rolled into hours — a 90-minute
 * recitation reads `90:05`, matching the reader's long-standing display. Do not
 * swap this for `formatMillis` (which adds an `h:mm:ss` form).
 */
export function fmtTime(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, '0')}`;
}
