import { useCallback, useState } from 'react';
import { ruqyahService } from '@/services/ruqyahService';
import { contentCache } from '@/services/contentCache';
import { useRuqyahEngine } from '@/context/PlayerContext';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  setRecording,
  setQueue,
  setQueueIndex,
  selectQueue,
  selectQueueIndex,
} from '@/store/slices/playerSlice';
import { selectIsPaid } from '@/store/slices/authSlice';
import type { Recording } from '@/types/recording';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * General Ruqyah queue manager.
 *
 * - Subscribed users: all `is_general` recordings in random order.
 * - Free users: only session 1 of each `is_general` recording, in random order.
 * - Auto-advance on track end is handled inside PlayerContext (always mounted).
 */
export function useGeneralRuqyah() {
  const engine = useRuqyahEngine();
  const dispatch = useAppDispatch();
  const queue = useAppSelector(selectQueue);
  const queueIndex = useAppSelector(selectQueueIndex);
  const isPaid = useAppSelector(selectIsPaid);
  const [isLoading, setIsLoading] = useState(false);

  /** Load and play a recording from the queue without clearing it. */
  const loadQueueTrack = useCallback(
    (recs: Recording[], idx: number) => {
      const rec = recs[idx];
      if (!rec || !rec.audio_url) return;
      dispatch(setRecording({ recording: rec, diseaseId: rec.disease_id, source: 'stream' }));
      engine.load(rec.audio_url);
      engine.play();
    },
    [dispatch, engine],
  );

  /** Fetch, filter by subscription, shuffle, and start playback. Falls back to device cache when offline. */
  const playGeneralRuqyah = useCallback(async () => {
    setIsLoading(true);
    try {
      const all = await ruqyahService.getGeneralRuqyah();
      void contentCache.setItem('clinic_general_ruqyah', all);
      const filtered = isPaid ? all : all.filter((r) => r.session_number === 1);
      const shuffled = shuffle(filtered);
      if (!shuffled.length) return;
      dispatch(setQueue({ recordings: shuffled, index: 0 }));
      loadQueueTrack(shuffled, 0);
    } catch {
      const cached = await contentCache.getItem<Recording[]>('clinic_general_ruqyah');
      if (cached?.length) {
        const filtered = isPaid ? cached : cached.filter((r) => r.session_number === 1);
        const shuffled = shuffle(filtered);
        if (shuffled.length) {
          dispatch(setQueue({ recordings: shuffled, index: 0 }));
          loadQueueTrack(shuffled, 0);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [isPaid, dispatch, loadQueueTrack]);

  const playNext = useCallback(() => {
    const nextIdx = queueIndex + 1;
    if (nextIdx < queue.length) {
      dispatch(setQueueIndex(nextIdx));
      loadQueueTrack(queue, nextIdx);
    }
  }, [queue, queueIndex, dispatch, loadQueueTrack]);

  const playPrevious = useCallback(() => {
    const prevIdx = queueIndex - 1;
    if (prevIdx >= 0) {
      dispatch(setQueueIndex(prevIdx));
      loadQueueTrack(queue, prevIdx);
    }
  }, [queue, queueIndex, dispatch, loadQueueTrack]);

  return {
    playGeneralRuqyah,
    playNext,
    playPrevious,
    hasPrevious: queueIndex > 0,
    hasNext: queueIndex < queue.length - 1,
    /** True while the general ruqyah queue is active (even when paused). */
    isGeneralMode: queue.length > 0,
    isLoading,
  };
}
