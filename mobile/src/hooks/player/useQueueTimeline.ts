import { useCallback, useMemo } from 'react';
import { useRuqyahEngine } from '@/context/PlayerContext';
import { usePlayer } from '@/hooks/player/usePlayer';
import { useDownloadManager } from '@/hooks/common/useDownloadManager';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  setQueueIndex,
  setRecording,
  selectQueue,
  selectQueueIndex,
  selectQueueKind,
  selectQueueContextId,
} from '@/store/slices/playerSlice';
import type { QueueTimeline } from '@/types/wird';

const millisOf = (durationSeconds: number | null | undefined): number =>
  (durationSeconds ?? 0) * 1000;

/**
 * The sessions behind one tab are a single ruqyah, so the transport times the
 * whole thing rather than restarting at 0:00 on every session — 1:07:21 total,
 * not 34:52 five times over.
 *
 * The engine only ever knows the length of the session it holds, so the rest
 * come from the CMS `duration_seconds`. When any of them is missing there is no
 * honest total to show, and the timeline falls back to the live session alone.
 */
export function useQueueTimeline(): QueueTimeline {
  const dispatch = useAppDispatch();
  const engine = useRuqyahEngine();
  const { position, duration, seekTo } = usePlayer();
  const { getLocalUri } = useDownloadManager();
  const queue = useAppSelector(selectQueue);
  const queueIndex = useAppSelector(selectQueueIndex);
  const queueKind = useAppSelector(selectQueueKind);
  const queueContextId = useAppSelector(selectQueueContextId);

  // The playing session's length comes from the engine, which is exact; the
  // others can only come from the metadata.
  const lengths = useMemo<number[] | null>(() => {
    // Only a wird is one continuous reading. General ruqyah and favorites are
    // playlists of unrelated recordings, where a combined clock means nothing.
    if (queueKind !== 'wird') return null;
    if (queueIndex < 0 || queueIndex >= queue.length) return null;

    // A text-only session is queued for its text but never plays, so it takes
    // up no room on the clock — counting it would promise time that is never
    // heard, and leave a stretch of the bar that seeking cannot land on.
    const audible = queue.map((r) => !!(getLocalUri(r.id) ?? r.audio_url));

    const all = queue.map((recording, i) => {
      if (!audible[i]) return 0;
      return i === queueIndex && duration > 0 ? duration : millisOf(recording.duration_seconds);
    });

    const played = all.filter((_, i) => audible[i]);

    return played.length >= 2 && played.every((ms) => ms > 0) ? all : null;
  }, [queue, queueIndex, queueKind, duration, getLocalUri]);

  const offsets = useMemo<number[]>(() => {
    if (!lengths) return [];
    const out: number[] = [];
    let running = 0;
    for (const ms of lengths) {
      out.push(running);
      running += ms;
    }
    return out;
  }, [lengths]);

  const total = useMemo(
    () => (lengths ? lengths.reduce((sum, ms) => sum + ms, 0) : duration),
    [lengths, duration],
  );

  const offset = lengths ? offsets[queueIndex] : 0;
  const elapsed = lengths
    ? offset + Math.min(Math.max(position, 0), lengths[queueIndex])
    : position;

  const seekTimeline = useCallback(
    (millis: number) => {
      if (!lengths) {
        seekTo(millis);
        return;
      }

      const clamped = Math.max(0, Math.min(millis, total));
      let index = lengths.findIndex((ms, i) => clamped < offsets[i] + ms);
      if (index < 0) index = lengths.length - 1;

      const within = clamped - offsets[index];
      if (index === queueIndex) {
        seekTo(within);
        return;
      }

      const target = queue[index];
      const localUri = getLocalUri(target.id);
      const uri = localUri ?? target.audio_url;
      if (!uri) return;

      dispatch(setQueueIndex(index));
      dispatch(
        setRecording({
          recording: target,
          diseaseId: queueContextId ?? target.disease_id,
          source: localUri ? 'local' : 'stream',
        }),
      );
      engine.load(uri, within);
      engine.play();
    },
    [
      lengths,
      offsets,
      total,
      queue,
      queueIndex,
      queueContextId,
      seekTo,
      getLocalUri,
      dispatch,
      engine,
    ],
  );

  return { position: elapsed, duration: total, spansQueue: !!lengths, seekTimeline };
}
