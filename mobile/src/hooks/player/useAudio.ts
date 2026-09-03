import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus, type AudioMetadata } from 'expo-audio';
import { useCallback, useEffect, useRef, useState } from 'react';
import { buildAudioHeaders } from '@/lib/audioAuth';
import { LOCK_SCREEN_OPTIONS } from '@/constants/lockScreen';

// Safety-net window: if a source never reaches `isLoaded` and never reports a
// 'failed' state within this time, stop spinning but DON'T mark the audio as failed
// (it may be a slow network, not a missing file). Covers edge-cases that don't emit
// explicit player failure.
const LOAD_TIMEOUT_MS = 15000;

export function useAudio() {
  const [hasSource, setHasSource] = useState(false);
  // URI last handed to the player — lets consumers check whether external
  // verse-timing data actually describes the file that is playing.
  const [sourceUri, setSourceUri] = useState<string | null>(null);
  // True only when the native player reports 'failed' (definitive 404 or unreachable).
  // Transient timeouts do NOT set this; they only stop the spinner.
  const [hasError, setHasError] = useState(false);
  // True when load hasn't resolved within LOAD_TIMEOUT_MS but the player is still trying.
  // Shows "Retry" UI instead of a spinner.
  const [loadTimedOut, setLoadTimedOut] = useState(false);
  const player = useAudioPlayer(null);
  const status = useAudioPlayerStatus(player);
  const loadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nowPlayingRef = useRef<AudioMetadata | null>(null);
  // Only one player app-wide may own the lock screen (the Ruqyah engine is the
  // other contender) — claimed on each play so the last-played engine wins.
  const lockScreenActiveRef = useRef(false);

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

  // Once the source is ready: cancel the safety-net timer and clear the timeout
  // flag (the audio loaded despite the timeout).
  /* eslint-disable react-hooks/set-state-in-effect -- setLoadTimedOut here intentionally reacts to native playback status changes */
  useEffect(() => {
    if (status.isLoaded) {
      clearLoadTimer();
      setLoadTimedOut(false);
    }
  }, [status.isLoaded, clearLoadTimer]);

  // ExoPlayer (Android) / AVPlayer (iOS) report 'failed' when the URL is
  // unreachable — e.g. a CDN 404 for a reciter that has no audio for this surah.
  useEffect(() => {
    if (hasSource && status.playbackState === 'failed') {
      setHasError(true);
      clearLoadTimer();
    }
  }, [status.playbackState, hasSource, clearLoadTimer]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (status.playing) {
      try {
        player.setActiveForLockScreen(true, nowPlayingRef.current ?? undefined, LOCK_SCREEN_OPTIONS);
        lockScreenActiveRef.current = true;
      } catch {}
    }
  }, [status.playing, player]);

  const setNowPlaying = useCallback((metadata: AudioMetadata) => {
    nowPlayingRef.current = metadata;
    if (lockScreenActiveRef.current) {
      try { player.updateLockScreenMetadata(metadata); } catch {}
    }
  }, [player]);

  const loadAudio = useCallback(async (uri: string) => {
    setHasError(false);
    setLoadTimedOut(false);
    setHasSource(true);
    setSourceUri(uri);
    clearLoadTimer();
    // If load takes > 15s, show "Retry" instead of spinner. Don't mark as failed—
    // the network may be slow but the file could still load.
    loadTimerRef.current = setTimeout(() => setLoadTimedOut(true), LOAD_TIMEOUT_MS);
    // Remote streams need headers: the ngrok tunnel warning bypass, plus a bearer token
    // for our own gated recording-audio endpoint (attached only for our origin). Cached
    // file:// paths need none.
    const isRemote = uri.startsWith('http://') || uri.startsWith('https://');
    player.replace(
      isRemote ? { uri, headers: await buildAudioHeaders(uri) } : { uri },
    );
  }, [player, clearLoadTimer]);

  const play = useCallback(async () => { player.play(); }, [player]);
  const pause = useCallback(async () => { player.pause(); }, [player]);
  const seekTo = useCallback(async (millis: number) => { player.seekTo(millis / 1000); }, [player]);

  const unload = useCallback(async () => {
    clearLoadTimer();
    setHasSource(false);
    setSourceUri(null);
    setHasError(false);
    setLoadTimedOut(false);
    try { player.pause(); } catch {}
    if (lockScreenActiveRef.current) {
      try { player.clearLockScreenControls(); } catch {}
      lockScreenActiveRef.current = false;
    }
  }, [player, clearLoadTimer]);

  return {
    hasSource,
    sourceUri,
    hasError,
    loadTimedOut,
    // Natural track end. The only cross-platform signal: Android holds it true
    // while ExoPlayer sits in STATE_ENDED, iOS pulses it once on play-to-end —
    // consumers must edge-detect. (`playbackState` strings are platform-specific
    // and never equal 'playing', so transition checks on them silently dead-end.)
    didJustFinish: status.didJustFinish ?? false,
    isPlaying: status.playing ?? false,
    // Once an error is surfaced we are no longer "loading" — the spinner stops.
    // Timeout does NOT count as error; it's transient.
    isLoading: hasSource && !hasError && !loadTimedOut && !status.isLoaded,
    positionMillis: (status.currentTime ?? 0) * 1000,
    durationMillis: (status.duration ?? 0) * 1000,
    loadAudio,
    play,
    pause,
    seekTo,
    setNowPlaying,
    unload,
  };
}
