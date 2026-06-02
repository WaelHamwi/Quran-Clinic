import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { useCallback, useEffect, useState } from 'react';

export function useAudio() {
  const [hasSource, setHasSource] = useState(false);
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
    player.replace({ uri });
  }, [player]);

  const play = useCallback(async () => { player.play(); }, [player]);
  const pause = useCallback(async () => { player.pause(); }, [player]);
  const seekTo = useCallback(async (millis: number) => { player.seekTo(millis / 1000); }, [player]);

  const unload = useCallback(async () => {
    setHasSource(false);
    try { player.pause(); } catch {}
  }, [player]);

  return {
    isPlaying: status.playing ?? false,
    isLoading: hasSource && !status.isLoaded,
    positionMillis: (status.currentTime ?? 0) * 1000,
    durationMillis: (status.duration ?? 0) * 1000,
    error: null,
    loadAudio,
    play,
    pause,
    seekTo,
    unload,
  };
}
