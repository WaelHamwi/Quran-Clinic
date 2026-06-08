import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { useCallback, useEffect, useRef, useState } from 'react';

export const PLAYBACK_SPEEDS = [0.5, 0.75, 1.0, 1.5, 2.0] as const;
export type PlaybackSpeed = typeof PLAYBACK_SPEEDS[number];

export function useAudio() {
  const [hasSource, setHasSource] = useState(false);
  const [rate, setRateState] = useState<PlaybackSpeed>(1.0);
  const rateRef = useRef<PlaybackSpeed>(1.0);
  const player = useAudioPlayer(null);
  const status = useAudioPlayerStatus(player);

  useEffect(() => {
    setAudioModeAsync({
      allowsRecording: false,
      playsInSilentMode: true,
      shouldPlayInBackground: true,
    }).catch(() => {});
  }, []);

  const loadAudio = useCallback(async (uri: string) => {
    setHasSource(true);
    // Remote streams go through the local backend's ngrok tunnel; without this
    // header ngrok returns its HTML browser-warning page instead of the MP3,
    // so expo-audio silently fails to load. Cached file:// paths don't need it.
    const isRemote = uri.startsWith('http://') || uri.startsWith('https://');
    player.replace(
      isRemote ? { uri, headers: { 'ngrok-skip-browser-warning': 'true' } } : { uri },
    );
  }, [player]);

  const play = useCallback(async () => { player.play(); }, [player]);
  const pause = useCallback(async () => { player.pause(); }, [player]);
  const seekTo = useCallback(async (millis: number) => { player.seekTo(millis / 1000); }, [player]);

  const setRate = useCallback((newRate: PlaybackSpeed) => {
    rateRef.current = newRate;
    try { player.setPlaybackRate(newRate); } catch {}
    setRateState(newRate);
  }, [player]);

  const unload = useCallback(async () => {
    setHasSource(false);
    rateRef.current = 1.0;
    setRateState(1.0);
    try { player.pause(); } catch {}
  }, [player]);

  return {
    hasSource,
    isPlaying: status.playing ?? false,
    isLoading: hasSource && !status.isLoaded,
    positionMillis: (status.currentTime ?? 0) * 1000,
    durationMillis: (status.duration ?? 0) * 1000,
    rate,
    loadAudio,
    play,
    pause,
    seekTo,
    setRate,
    unload,
  };
}
