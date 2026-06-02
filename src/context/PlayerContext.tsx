import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { useAudioPlayer, useAudioPlayerStatus, setAudioModeAsync } from 'expo-audio';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  setProgress,
  play as playAction,
  pause as pauseAction,
  setLoading,
  setLoadError,
  setRecording,
  setQueueIndex,
  clearQueue,
  selectQueue,
  selectQueueIndex,
} from '@/store/slices/playerSlice';
import type { Recording } from '@/types/recording';

/**
 * Single shared `expo-audio` engine for ruqyah recordings. Holds the
 * non-serializable player object (which cannot live in Redux); playback STATE
 * is mirrored into `playerSlice`. Completely separate from the Mushaf
 * `useAudio` engine — the two never share a player (RULE_42).
 *
 * Also owns queue auto-advance: when a track ends (playing → idle/ended),
 * this context loads the next track in the general ruqyah queue so it works
 * regardless of which screen the user is currently on.
 */
export interface PlayerEngine {
  load: (uri: string) => void;
  play: () => void;
  pause: () => void;
  seek: (millis: number) => void;
  setRate: (rate: number) => void;
}

const PlayerContext = createContext<PlayerEngine | null>(null);
const PROGRESS_THROTTLE_MS = 250;

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const player = useAudioPlayer(null);
  const status = useAudioPlayerStatus(player);
  const lastTickRef = useRef(0);
  const hasSourceRef = useRef(false);
  const pendingPlayRef = useRef(false);
  const isLoadedRef = useRef(false);
  const prevPlaybackStateRef = useRef<string | undefined>(undefined);

  // Keep queue in refs so the playbackState effect never has stale values
  // without re-creating the effect on every queue update.
  const queue = useAppSelector(selectQueue);
  const queueIndex = useAppSelector(selectQueueIndex);
  const queueRef = useRef<Recording[]>(queue);
  const queueIndexRef = useRef<number>(queueIndex);
  useEffect(() => { queueRef.current = queue; }, [queue]);
  useEffect(() => { queueIndexRef.current = queueIndex; }, [queueIndex]);

  useEffect(() => {
    setAudioModeAsync({
      allowsRecording: false,
      playsInSilentMode: true,
      shouldPlayInBackground: true,
    }).catch(() => {});
  }, []);

  // Throttle high-frequency progress updates into Redux (~4/sec).
  useEffect(() => {
    const now = Date.now();
    if (now - lastTickRef.current >= PROGRESS_THROTTLE_MS) {
      lastTickRef.current = now;
      dispatch(
        setProgress({
          position: (status.currentTime ?? 0) * 1000,
          duration: (status.duration ?? 0) * 1000,
        }),
      );
    }
  }, [status.currentTime, status.duration, dispatch]);

  useEffect(() => {
    dispatch(status.playing ? playAction() : pauseAction());
  }, [status.playing, dispatch]);

  // Keep isLoaded ref fresh so play() can check it without a stale closure.
  // Auto-play as soon as the source is ready when a play was requested.
  useEffect(() => {
    isLoadedRef.current = status.isLoaded;
    if (status.isLoaded && pendingPlayRef.current) {
      pendingPlayRef.current = false;
      player.play();
    }
  }, [status.isLoaded, player]);

  useEffect(() => {
    dispatch(setLoading(hasSourceRef.current && !status.isLoaded));
  }, [status.isLoaded, dispatch]);

  // AVPlayer (iOS) reports 'failed'; ExoPlayer (Android) may surface similar.
  useEffect(() => {
    if (hasSourceRef.current && status.playbackState === 'failed') {
      dispatch(setLoadError(true));
    }
  }, [status.playbackState, dispatch]);

  // Auto-advance the general ruqyah queue when a track ends naturally.
  // Detects the playing → idle/ended transition to distinguish from user pause.
  useEffect(() => {
    const prev = prevPlaybackStateRef.current;
    const curr = status.playbackState;

    if (
      prev === 'playing' &&
      (curr === 'idle' || curr === 'ended') &&
      hasSourceRef.current
    ) {
      const q = queueRef.current;
      const idx = queueIndexRef.current;
      const nextIdx = idx + 1;

      if (q.length > 0 && nextIdx < q.length) {
        const next = q[nextIdx];
        if (next?.audio_url) {
          dispatch(setQueueIndex(nextIdx));
          dispatch(setRecording({ recording: next, diseaseId: next.disease_id, source: 'stream' }));
          pendingPlayRef.current = true;
          player.replace({ uri: next.audio_url, headers: { 'ngrok-skip-browser-warning': 'true' } });
        }
      } else if (q.length > 0) {
        // Reached the end of the queue — clear it.
        dispatch(clearQueue());
      }
    }

    prevPlaybackStateRef.current = curr;
  }, [status.playbackState, dispatch, player]);

  const load = useCallback(
    (uri: string) => {
      hasSourceRef.current = true;
      pendingPlayRef.current = true;
      dispatch(setLoadError(false));
      // Pass the ngrok header so the tunnel serves the file directly
      // rather than showing its browser-warning HTML page.
      player.replace({ uri, headers: { 'ngrok-skip-browser-warning': 'true' } });
    },
    [player, dispatch],
  );
  const play = useCallback(() => {
    if (isLoadedRef.current) {
      player.play();
    } else {
      // Source not ready yet — auto-play once isLoaded fires.
      pendingPlayRef.current = true;
    }
  }, [player]);
  const pause = useCallback(() => {
    pendingPlayRef.current = false; // cancel any pending auto-play
    player.pause();
  }, [player]);
  const seek = useCallback(
    (millis: number) => {
      player.seekTo(millis / 1000);
    },
    [player],
  );
  const setRate = useCallback(
    (rate: number) => {
      player.playbackRate = rate;
    },
    [player],
  );

  const value = useMemo<PlayerEngine>(
    () => ({ load, play, pause, seek, setRate }),
    [load, play, pause, seek, setRate],
  );

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

/** Internal — the imperative engine handle. Screens use `usePlayer` instead. */
export function useRuqyahEngine(): PlayerEngine {
  const ctx = useContext(PlayerContext);
  if (!ctx) {
    throw new Error('useRuqyahEngine must be used within a PlayerProvider');
  }
  return ctx;
}
