import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { useCallback, useEffect, useRef, useState } from 'react';

// Playback speeds offered by the Mushaf player.
export const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.5, 2] as const;
export type PlaybackSpeed = (typeof PLAYBACK_SPEEDS)[number];

// Safety-net window: if a source never reaches `isLoaded` and never reports a
// 'failed' state within this time, treat it as a failed load so the UI stops
// spinning. Covers platforms/edge-cases that don't emit an explicit failure.
const LOAD_TIMEOUT_MS = 15000;

export function useAudio() {
  const [hasSource, setHasSource] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [rate, setRateState] = useState<PlaybackSpeed>(1);
  const player = useAudioPlayer(null);
  const status = useAudioPlayerStatus(player);
  const loadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Latest rate in a ref so we can re-apply it after a source swap without
  // adding `rate` to effect deps.
  const rateRef = useRef<PlaybackSpeed>(1);

  const clearLoadTimer = useCallback(() => {
    if (loadTimerRef.current) {
      clearTimeout(loadTimerRef.current);
      loadTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    setAudioModeAsync({
      allowsRecording: false,
      playsInSilentMode: true,
      shouldPlayInBackground: true,
    }).catch(() => {});
  }, []);

  // Once the source is ready: cancel the safety-net timer, clear any error that
  // the timeout may have raised on a slow-but-valid load, and re-apply the
  // chosen speed (replacing the source resets playbackRate to 1).
  useEffect(() => {
    if (status.isLoaded) {
      clearLoadTimer();
      setHasError(false);
      try { player.playbackRate = rateRef.current; } catch {}
    }
  }, [status.isLoaded, clearLoadTimer, player]);

  // ExoPlayer (Android) / AVPlayer (iOS) report 'failed' when the URL is
  // unreachable — e.g. a CDN 404 for a reciter that has no audio for this surah.
  useEffect(() => {
    if (hasSource && status.playbackState === 'failed') {
      setHasError(true);
      clearLoadTimer();
    }
  }, [status.playbackState, hasSource, clearLoadTimer]);

  const loadAudio = useCallback(async (uri: string) => {
    setHasError(false);
    setHasSource(true);
    clearLoadTimer();
    loadTimerRef.current = setTimeout(() => setHasError(true), LOAD_TIMEOUT_MS);
    // Remote streams go through the local backend's ngrok tunnel; without this
    // header ngrok returns its HTML browser-warning page instead of the MP3,
    // so expo-audio silently fails to load. Cached file:// paths don't need it.
    const isRemote = uri.startsWith('http://') || uri.startsWith('https://');
    player.replace(
      isRemote ? { uri, headers: { 'ngrok-skip-browser-warning': 'true' } } : { uri },
    );
  }, [player, clearLoadTimer]);

  const play = useCallback(async () => { player.play(); }, [player]);
  const pause = useCallback(async () => { player.pause(); }, [player]);
  const seekTo = useCallback(async (millis: number) => { player.seekTo(millis / 1000); }, [player]);

  const setRate = useCallback((spd: PlaybackSpeed) => {
    rateRef.current = spd;
    setRateState(spd);
    try { player.playbackRate = spd; } catch {}
  }, [player]);

  const unload = useCallback(async () => {
    clearLoadTimer();
    setHasSource(false);
    setHasError(false);
    try { player.pause(); } catch {}
  }, [player, clearLoadTimer]);

  return {
    hasSource,
    hasError,
    rate,
    isPlaying: status.playing ?? false,
    // Once an error is surfaced we are no longer "loading" — the spinner stops.
    isLoading: hasSource && !hasError && !status.isLoaded,
    positionMillis: (status.currentTime ?? 0) * 1000,
    durationMillis: (status.duration ?? 0) * 1000,
    loadAudio,
    play,
    pause,
    seekTo,
    setRate,
    unload,
  };
}
