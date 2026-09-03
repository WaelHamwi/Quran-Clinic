import { useCallback, useEffect, useState } from 'react';
import type { Recitation } from '@/types/recitation';

/**
 * Tells the Mushaf reader which reciters actually have playable audio for the
 * current surah. The backend stores a recitation row for every reciter, but
 * some point at CDN files that 404 — those reciters must not appear selectable.
 *
 * A reciter is hidden ONLY on a definitive 4xx response. Network errors and
 * timeouts are treated as "unknown" (kept visible) so a flaky connection can
 * never wrongly remove a valid reciter. Results are cached per audio URL for
 * the session, so navigating between surahs doesn't re-probe the same file.
 */

// audioUrl → true (reachable) | false (confirmed missing). Lives for the session.
const availabilityCache = new Map<string, boolean>();

const PROBE_TIMEOUT_MS = 8000;

function withTimeout<T>(p: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms)),
  ]);
}

/** Returns true (reachable), false (4xx — missing), or null (unknown). */
async function probe(url: string, signal: AbortSignal): Promise<boolean | null> {
  try {
    // Range 0-1 fetches a single byte — enough to learn the status without
    // pulling the whole MP3. Some CDNs reject HEAD, so we GET a tiny range.
    const res = await fetch(url, {
      method: 'GET',
      headers: { Range: 'bytes=0-1', 'ngrok-skip-browser-warning': 'true' },
      signal,
    });
    if (res.status >= 200 && res.status < 300) return true;
    if (res.status >= 400 && res.status < 500) return false;
    return null; // 5xx / unexpected — don't penalise the reciter
  } catch {
    return null; // aborted / network / timeout — unknown
  }
}

export function useReciterAvailability(recitations: Recitation[]) {
  const [unavailableReciterIds, setUnavailableReciterIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (recitations.length === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: reset when there are no recitations to probe
      setUnavailableReciterIds(new Set());
      return;
    }

    const ctrl = new AbortController();
    let active = true;

    (async () => {
      const next = new Set<number>();
      await Promise.all(
        recitations.map(async (r) => {
          const url = r.audio_url;
          if (!url || !/^https?:\/\//.test(url)) return; // only remote files can 404
          let reachable = availabilityCache.get(url);
          if (reachable === undefined) {
            const result = await withTimeout(probe(url, ctrl.signal), PROBE_TIMEOUT_MS, null);
            if (result === null) return; // unknown — keep reciter visible
            reachable = result;
            availabilityCache.set(url, reachable);
          }
          if (!reachable) next.add(r.reciter_id);
        }),
      );
      if (active) setUnavailableReciterIds(next);
    })();

    return () => {
      active = false;
      ctrl.abort();
    };
  }, [recitations]);

  /** Reactively flag a reciter whose playback just failed (safety net for the probe). */
  const markUnavailable = useCallback((reciterId: number, audioUrl?: string) => {
    if (audioUrl) availabilityCache.set(audioUrl, false);
    setUnavailableReciterIds((prev) => {
      if (prev.has(reciterId)) return prev;
      const next = new Set(prev);
      next.add(reciterId);
      return next;
    });
  }, []);

  return { unavailableReciterIds, markUnavailable };
}
