import { useCallback, useMemo } from 'react';
import { useRuqyahEngine } from '@/context/PlayerContext';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  setRecording,
  seek as seekAction,
  stop as stopAction,
  clearQueue,
  setRate as setRateAction,
  setTextColor as setTextColorAction,
  setFontSize as setFontSizeAction,
  setDarkMode as setDarkModeAction,
  selectCurrentRecording,
  selectIsPlaying,
  selectPlayerLoading,
  selectPlayerPosition,
  selectPlayerDuration,
  selectPlaybackRate,
  selectTextColor,
  selectFontSize,
  selectDarkMode,
} from '@/store/slices/playerSlice';
import type { Recording } from '@/types/recording';

/** Public hook for the global ruqyah audio player. */
export function usePlayer() {
  const engine = useRuqyahEngine();
  const dispatch = useAppDispatch();
  const currentRecording = useAppSelector(selectCurrentRecording);
  const isPlaying = useAppSelector(selectIsPlaying);
  const isLoading = useAppSelector(selectPlayerLoading);
  const position = useAppSelector(selectPlayerPosition);
  const duration = useAppSelector(selectPlayerDuration);
  const playbackRate = useAppSelector(selectPlaybackRate);
  const textColor = useAppSelector(selectTextColor);
  const fontSize = useAppSelector(selectFontSize);
  const isDarkMode = useAppSelector(selectDarkMode);

  const loadAndPlay = useCallback(
    (recording: Recording, diseaseId: number | null, localUri?: string | null) => {
      const uri = localUri ?? recording.audio_url;
      if (!uri) return;
      // Exiting general ruqyah mode — clear the queue before loading.
      dispatch(clearQueue());
      dispatch(setRecording({ recording, diseaseId, source: localUri ? 'local' : 'stream' }));
      engine.load(uri);
      engine.play();
    },
    [dispatch, engine],
  );

  const play = useCallback(() => engine.play(), [engine]);
  const pause = useCallback(() => engine.pause(), [engine]);

  const seekTo = useCallback(
    (millis: number) => {
      engine.seek(millis);
      dispatch(seekAction(millis));
    },
    [engine, dispatch],
  );

  const stop = useCallback(() => {
    engine.pause();
    dispatch(stopAction());
  }, [engine, dispatch]);

  const togglePlay = useCallback(() => {
    if (isPlaying) engine.pause();
    else engine.play();
  }, [isPlaying, engine]);

  const setRate = useCallback(
    (rate: number) => {
      engine.setRate(rate);
      dispatch(setRateAction(rate));
    },
    [engine, dispatch],
  );

  const setTextColor = useCallback(
    (color: string) => { dispatch(setTextColorAction(color)); },
    [dispatch],
  );

  const setFontSize = useCallback(
    (size: number) => { dispatch(setFontSizeAction(size)); },
    [dispatch],
  );

  const setDarkMode = useCallback(
    (dark: boolean) => { dispatch(setDarkModeAction(dark)); },
    [dispatch],
  );

  const isCurrent = useCallback(
    (recordingId: number) => currentRecording?.id === recordingId,
    [currentRecording],
  );

  return useMemo(
    () => ({
      currentRecording,
      isPlaying,
      isLoading,
      position,
      duration,
      playbackRate,
      textColor,
      fontSize,
      isDarkMode,
      loadAndPlay,
      play,
      pause,
      resume: play,
      seekTo,
      stop,
      togglePlay,
      setRate,
      setTextColor,
      setFontSize,
      setDarkMode,
      isCurrent,
    }),
    [
      currentRecording,
      isPlaying,
      isLoading,
      position,
      duration,
      playbackRate,
      textColor,
      fontSize,
      isDarkMode,
      loadAndPlay,
      play,
      pause,
      seekTo,
      stop,
      togglePlay,
      setRate,
      setTextColor,
      setFontSize,
      setDarkMode,
      isCurrent,
    ],
  );
}
