import { useCallback, useState } from 'react';
import { ruqyahService } from '@/services/content/ruqyahService';
import { cachedFetch } from '@/services/common/contentCache';
import { useRuqyahEngine } from '@/context/PlayerContext';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setRecording, setQueue, setPlaybackOrigin } from '@/store/slices/playerSlice';
import { selectFavorites, type FavoriteItem } from '@/store/slices/favoritesSlice';
import { selectIsPaid } from '@/store/slices/authSlice';
import type { Recording } from '@/types/recording';

/** Fetch a favorite's recordings, dispatching by kind (disease vs direct node). */
function fetchFavoriteRecordings(fav: FavoriteItem): Promise<Recording[]> {
  if (fav.favoriteKind === 'category') {
    return cachedFetch(`clinic_category_${fav.slug}`, () => ruqyahService.getCategory(fav.slug))
      .then((c) => c.recordings ?? [])
      .catch(() => [] as Recording[]);
  }
  if (fav.favoriteKind === 'subcategory') {
    return cachedFetch(`clinic_subcategory_${fav.slug}`, () => ruqyahService.getSubcategory(fav.slug))
      .then((s) => s.recordings ?? [])
      .catch(() => [] as Recording[]);
  }
  return cachedFetch(`clinic_recordings_${fav.id}`, () => ruqyahService.getRecordings(fav.id))
    .catch(() => [] as Recording[]);
}

/**
 * "Play all" for the Favorites screen.
 *
 * Builds a single playback queue from every favorited disease's recordings —
 * in favorite order, sessions ordered within each disease — and starts it.
 * Reuses the shared player queue (same mechanism as General Ruqyah): the global
 * MiniPlayer surfaces prev/next and PlayerContext auto-advances one by one.
 *
 * Free users only get accessible audio (session 1 / free recordings); paid
 * sessions are skipped so locked audio never enters the queue.
 */
export function usePlayFavorites() {
  const engine = useRuqyahEngine();
  const dispatch = useAppDispatch();
  const favorites = useAppSelector(selectFavorites);
  const isPaid = useAppSelector(selectIsPaid);
  const [isLoading, setIsLoading] = useState(false);

  const playFavorites = useCallback(async () => {
    if (!favorites.length) return;
    setIsLoading(true);
    try {
      // Fetch recordings for each favorite in parallel; a failing favorite
      // contributes nothing rather than aborting the whole queue.
      const lists = await Promise.all(favorites.map(fetchFavoriteRecordings));

      const queue: Recording[] = [];
      for (const list of lists) {
        const sorted = [...list].sort((a, b) => {
          if (a.is_free !== b.is_free) return a.is_free ? -1 : 1;
          return a.session_number - b.session_number;
        });
        for (const r of sorted) {
          if (r.audio_url && (!r.requires_subscription || isPaid)) queue.push(r);
        }
      }

      if (!queue.length) return;
      dispatch(setQueue({ recordings: queue, index: 0, kind: 'favorites' }));
      // The queue spans every favorited wird, so no single wird screen owns it —
      // the favorites list is where this playback came from.
      dispatch(setPlaybackOrigin('/favorites'));
      const first = queue[0];
      dispatch(setRecording({ recording: first, diseaseId: first.disease_id, source: 'stream' }));
      engine.load(first.audio_url!);
      engine.play();
    } finally {
      setIsLoading(false);
    }
  }, [favorites, isPaid, dispatch, engine]);

  return { playFavorites, isLoading, count: favorites.length };
}
