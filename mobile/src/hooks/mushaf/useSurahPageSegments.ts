import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getSurahPageSegments, type SurahPageSegment } from '@/utils/qcf4Verse';

/** The current surah's verse→print-page layout, refetched (from the same
 *  per-page cache the pager reads) whenever the open surah changes. Used to
 *  resolve a verse number to a QCF4 page for search jump and the
 *  follow-the-audio page turn.
 *
 *  `enabled` gates the fetch — a long surah spans dozens of pages, and
 *  fetching all of them just to build this table would be wasted bandwidth
 *  for the common case of someone paging through without ever searching or
 *  playing audio. Pass `enabled` only while one of those features is
 *  actually in use (search open, or audio playing). */
export function useSurahPageSegments(
  surahId: number,
  firstPage: number,
  lastPage: number,
  enabled: boolean
) {
  const queryClient = useQueryClient();
  const [segments, setSegments] = useState<SurahPageSegment[]>([]);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    getSurahPageSegments(queryClient, surahId, firstPage, lastPage)
      .then((segs) => { if (!cancelled) setSegments(segs); })
      .catch(() => { if (!cancelled) setSegments([]); });
    return () => { cancelled = true; };
  }, [queryClient, surahId, firstPage, lastPage, enabled]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: clears the stale surah's segments when the open surah changes
    setSegments([]);
  }, [surahId]);

  return segments;
}
