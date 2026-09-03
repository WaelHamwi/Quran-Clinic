import { useCallback, useState } from 'react';
import { ruqyahService } from '@/services/content/ruqyahService';
import { contentCache } from '@/services/common/contentCache';
import { useRuqyahEngine } from '@/context/PlayerContext';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  setRecording,
  setQueue,
  setQueueIndex,
  setPlaybackOrigin,
  stop as stopAction,
  toggleRepeatOne,
  selectQueue,
  selectQueueIndex,
  selectQueueKind,
  selectRepeatOne,
} from '@/store/slices/playerSlice';
import { selectIsPaid } from '@/store/slices/authSlice';
import { selectRecordingHistory, selectHasRecordingHistory } from '@/store/slices/recordingHistorySlice';
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
 * - Personalized: once the user has played anything, the queue shuffles the
 *   recordings they've actually accessed (FR-6.5) instead of the admin-curated set.
 * - New user / empty history: falls back to all `is_general` recordings, same as before.
 * - Subscribed users: all matching recordings in random order.
 * - Free users: only session 1 of each matching recording, in random order.
 * - Auto-advance on track end is handled inside PlayerContext (always mounted).
 */
export function useGeneralRuqyah() {
  const engine = useRuqyahEngine();
  const dispatch = useAppDispatch();
  const queue = useAppSelector(selectQueue);
  const queueIndex = useAppSelector(selectQueueIndex);
  const queueKind = useAppSelector(selectQueueKind);
  const repeatOne = useAppSelector(selectRepeatOne);
  const isPaid = useAppSelector(selectIsPaid);
  const history = useAppSelector(selectRecordingHistory);
  const hasHistory = useAppSelector(selectHasRecordingHistory);
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

  /**
   * Personalized when history exists (shuffles recordings the user has actually played);
   * otherwise fetches, filters by subscription, shuffles, and falls back to the
   * admin-curated `is_general` set, same as before. Falls back to device cache when offline.
   */
  const playGeneralRuqyah = useCallback(async () => {
    setIsLoading(true);
    // Shuffled across every wird — nothing to return to, and leaving a previous
    // wird's route set would send the mini player somewhere that isn't playing.
    dispatch(setPlaybackOrigin(null));
    try {
      if (hasHistory) {
        const filtered = isPaid ? history : history.filter((r) => !r.requires_subscription);
        const shuffled = shuffle(filtered);
        if (shuffled.length) {
          dispatch(setQueue({ recordings: shuffled, index: 0, kind: 'general' }));
          loadQueueTrack(shuffled, 0);
          return;
        }
        // Every played recording got filtered out (e.g. trial expired) — fall through
        // to the admin-curated set below instead of playing nothing.
      }

      const all = await ruqyahService.getGeneralRuqyah();
      void contentCache.setItem('clinic_general_ruqyah', all);
      const filtered = isPaid ? all : all.filter((r) => !r.requires_subscription);
      const shuffled = shuffle(filtered);
      if (!shuffled.length) return;
      dispatch(setQueue({ recordings: shuffled, index: 0, kind: 'general' }));
      loadQueueTrack(shuffled, 0);
    } catch {
      const cached = await contentCache.getItem<Recording[]>('clinic_general_ruqyah');
      if (cached?.length) {
        const filtered = isPaid ? cached : cached.filter((r) => !r.requires_subscription);
        const shuffled = shuffle(filtered);
        if (shuffled.length) {
          dispatch(setQueue({ recordings: shuffled, index: 0, kind: 'general' }));
          loadQueueTrack(shuffled, 0);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [isPaid, hasHistory, history, dispatch, loadQueueTrack]);

  /** Turn general ruqyah off: stop the engine and clear the queue/playback state. */
  const stopGeneralRuqyah = useCallback(() => {
    engine.pause();
    dispatch(stopAction());
  }, [engine, dispatch]);

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

  const toggleRepeat = useCallback(() => {
    dispatch(toggleRepeatOne());
  }, [dispatch]);

  return {
    playGeneralRuqyah,
    stopGeneralRuqyah,
    playNext,
    playPrevious,
    toggleRepeat,
    repeatOne,
    hasPrevious: queueIndex > 0,
    hasNext: queueIndex < queue.length - 1,
    /** True while a FOREIGN queue (general ruqyah OR favorites) owns the engine,
     *  even when paused. Used to tell screens their own playback isn't live.
     *  The `wird` queue is excluded: it is the disease screen playing its own
     *  tab's recordings back-to-back, so that screen still owns playback. */
    isQueueActive: queue.length > 0 && queueKind !== 'wird',
    /** True only for the toggle-driven general ruqyah queue (no mini-player bar). */
    isGeneralMode: queueKind === 'general',
    isLoading,
  };
}
