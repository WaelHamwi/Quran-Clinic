import { estimateBasmalahLeadMs } from '@/utils/mushafReader';
import type { VerseTiming } from '@/hooks/mushaf/useVerseTiming';
import type { Verse } from '@/types/verse';

// Shared "which verse is playing right now" math for both Mushaf readers
// (classic per-page-chunk reader and the Madani/QCF4 print-page reader).
// Framework-free so it can be unit-tested and reused without pulling either
// reader's scroll/pager geometry along with it.

/** Text-length proportional start fraction per verse — fallback while exact
 *  verseTiming is loading or unavailable for a reciter. */
export function computeVerseStartFractions(verses: Verse[]): number[] {
  if (verses.length === 0) return [];
  const lengths = verses.map((v) => Math.max(v.text.ar.replace(/\s/g, '').length, 8));
  const total = lengths.reduce((a, b) => a + b, 0);
  let cum = 0;
  return lengths.map((len) => { const s = cum / total; cum += len; return s; });
}

/** Resolves the verse index (into the same array `verseStartFractions` was
 *  built from) whose recitation covers `positionMs`, using exact timing when
 *  given and falling back to text-length proportions otherwise. */
export function resolveActiveVerseIndex(opts: {
  positionMs: number;
  durationMillis: number;
  verseTiming: VerseTiming[] | undefined;
  verseStartFractions: number[];
  basmalahLeadMs: number;
}): number {
  const { positionMs, durationMillis, verseTiming, verseStartFractions, basmalahLeadMs } = opts;
  if (verseTiming && verseTiming.length > 0) {
    for (let i = verseTiming.length - 1; i >= 0; i--) {
      if (positionMs >= verseTiming[i].timestampFrom) return i;
    }
    return 0;
  }
  if (verseStartFractions.length === 0 || durationMillis === 0) return -1;
  if (positionMs < basmalahLeadMs) return -1;
  const progress = (positionMs - basmalahLeadMs) / Math.max(1, durationMillis - basmalahLeadMs);
  for (let i = verseStartFractions.length - 1; i >= 0; i--) {
    if (progress >= verseStartFractions[i]) return i;
  }
  return 0;
}

/** Inverse of `resolveActiveVerseIndex` — where in the track the verse at
 *  `verseIndex` begins. Null while nothing can place it yet: the proportional
 *  fallback has no track length to scale against until the source loads. */
export function resolveVerseStartMs(opts: {
  verseIndex: number;
  durationMillis: number;
  verseTiming: VerseTiming[] | undefined;
  verseStartFractions: number[];
  basmalahLeadMs: number;
}): number | null {
  const { verseIndex, durationMillis, verseTiming, verseStartFractions, basmalahLeadMs } = opts;
  if (verseIndex < 0) return null;
  if (verseTiming && verseIndex < verseTiming.length) return verseTiming[verseIndex].timestampFrom;
  if (durationMillis <= 0 || verseIndex >= verseStartFractions.length) return null;
  return basmalahLeadMs + verseStartFractions[verseIndex] * Math.max(0, durationMillis - basmalahLeadMs);
}

/**
 * Which verse a play-tap should enter the recitation at, given what the reader
 * is looking at. Null means "leave playback where it is" — either it is already
 * inside the visible page (a pause/resume must stay a resume) or the entry
 * point is the surah's own opening, which plays from the top the way it always
 * has, recited basmalah included.
 */
export function resolveEntryVerse(opts: {
  /** Verse range of the current surah on the visible print page. */
  pageVerseStart: number;
  pageVerseEnd: number;
  /** Verse just jumped to (search, bookmark, `?highlight=`) — null when the
   *  jump belongs to another surah or nothing was jumped to. */
  jumpedVerse: number | null;
  /** Verse being recited right now; -1 when no source is loaded. */
  activeVerse: number;
}): number | null {
  const { pageVerseStart, pageVerseEnd, jumpedVerse, activeVerse } = opts;
  const onPage = (verse: number) => verse >= pageVerseStart && verse <= pageVerseEnd;

  // An explicit jump names one verse, so it wins over the page it landed on —
  // but only while the reader is still on the page it put them on.
  if (jumpedVerse != null && onPage(jumpedVerse)) {
    return jumpedVerse !== activeVerse && jumpedVerse > 1 ? jumpedVerse : null;
  }
  if (onPage(activeVerse)) return null;
  return pageVerseStart > 1 ? pageVerseStart : null;
}

/**
 * Whether the currently loaded audio source is the exact Quran.com file
 * `verseTiming` describes (only then can timestamps drive the highlight —
 * the backend's legacy recordings are different takes), plus the derived
 * basmalah-lead / active-basmalah state used while that source is not (yet)
 * timing-aligned. Surah 1 (Al-Fatiha, verse 1 IS the basmalah) and Surah 9
 * (At-Tawbah, recited without one) never enter the basmalah phase.
 */
export function resolveVerseHighlightState(opts: {
  surahId: number;
  verseTiming: VerseTiming[] | undefined;
  timingAudioUrl: string | null;
  audioSourceUri: string | null;
  timedLocalPath: string | null;
  durationMillis: number;
  positionMillis: number;
  isPlaying: boolean;
}): {
  timedUrl: string | null;
  timingUsable: boolean;
  fallbackBasmalahLeadMs: number;
  isBasmalahActive: boolean;
} {
  const {
    surahId, verseTiming, timingAudioUrl, audioSourceUri, timedLocalPath,
    durationMillis, positionMillis, isPlaying,
  } = opts;

  const timingLoaded = !!verseTiming && verseTiming.length > 0;
  const timedUrl = timingLoaded ? timingAudioUrl : null;
  const timingUsable =
    !!timedUrl && (audioSourceUri === timedUrl || audioSourceUri === timedLocalPath);

  const isBasmalahPhase = surahId !== 1 && surahId !== 9;
  const fallbackBasmalahLeadMs =
    isBasmalahPhase && !timingUsable ? estimateBasmalahLeadMs(durationMillis) : 0;

  const firstVerseMs = timingUsable && verseTiming ? verseTiming[0].timestampFrom : 0;
  const isBasmalahActive =
    isPlaying &&
    isBasmalahPhase &&
    (timingUsable
      ? firstVerseMs > 0 && positionMillis < firstVerseMs
      : positionMillis < fallbackBasmalahLeadMs);

  return { timedUrl, timingUsable, fallbackBasmalahLeadMs, isBasmalahActive };
}
