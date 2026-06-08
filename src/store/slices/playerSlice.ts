import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Recording } from '@/types/recording';
import type { RootState } from '@/store/rootReducer';

export type PlayerSource = 'stream' | 'local';

interface PlayerState {
  currentRecording: Recording | null;
  diseaseId: number | null;
  source: PlayerSource;
  isPlaying: boolean;
  isLoading: boolean;
  loadError: boolean;
  positionMillis: number;
  durationMillis: number;
  playbackRate: number;
  volume: number;
  miniPlayerVisible: boolean;
  /** User-selected ruqyah text colour (hex string). Persists for the session. */
  textColor: string;
  /** User-selected ruqyah text font size (pt). Persists for the session. */
  fontSize: number;
  /** Whether dark mode is active for the ruqyah content card. */
  isDarkMode: boolean;
  /** Shuffled general ruqyah playlist. Empty = not in general ruqyah mode. */
  queue: Recording[];
  /** Current position within `queue`. -1 when no queue is active. */
  queueIndex: number;
}

const initialState: PlayerState = {
  currentRecording: null,
  diseaseId: null,
  source: 'stream',
  isPlaying: false,
  isLoading: false,
  loadError: false,
  positionMillis: 0,
  durationMillis: 0,
  playbackRate: 1,
  volume: 1,
  miniPlayerVisible: false,
  textColor: '#181d27',
  fontSize: 16,
  isDarkMode: false,
  queue: [],
  queueIndex: -1,
};

/** Global ruqyah audio player. Not persisted. Separate from the Mushaf player. */
const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    setRecording(
      state,
      action: PayloadAction<{ recording: Recording; diseaseId: number | null; source: PlayerSource }>,
    ) {
      state.currentRecording = action.payload.recording;
      state.diseaseId = action.payload.diseaseId;
      state.source = action.payload.source;
      state.positionMillis = 0;
      state.durationMillis = 0;
      state.isLoading = true;
      state.miniPlayerVisible = true;
    },
    play(state) {
      state.isPlaying = true;
    },
    pause(state) {
      state.isPlaying = false;
    },
    stop() {
      return initialState;
    },
    setProgress(state, action: PayloadAction<{ position: number; duration: number }>) {
      state.positionMillis = action.payload.position;
      if (action.payload.duration > 0) state.durationMillis = action.payload.duration;
    },
    seek(state, action: PayloadAction<number>) {
      state.positionMillis = action.payload;
    },
    setRate(state, action: PayloadAction<number>) {
      state.playbackRate = action.payload;
    },
    setTextColor(state, action: PayloadAction<string>) {
      state.textColor = action.payload;
    },
    setFontSize(state, action: PayloadAction<number>) {
      state.fontSize = action.payload;
    },
    setDarkMode(state, action: PayloadAction<boolean>) {
      state.isDarkMode = action.payload;
    },
    setVolume(state, action: PayloadAction<number>) {
      state.volume = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setLoadError(state, action: PayloadAction<boolean>) {
      state.loadError = action.payload;
      if (action.payload) state.isLoading = false;
    },
    showMiniPlayer(state) {
      state.miniPlayerVisible = true;
    },
    hideMiniPlayer(state) {
      state.miniPlayerVisible = false;
    },
    setQueue(state, action: PayloadAction<{ recordings: Recording[]; index: number }>) {
      state.queue = action.payload.recordings;
      state.queueIndex = action.payload.index;
    },
    setQueueIndex(state, action: PayloadAction<number>) {
      state.queueIndex = action.payload;
    },
    clearQueue(state) {
      state.queue = [];
      state.queueIndex = -1;
    },
  },
});

export const {
  setRecording,
  play,
  pause,
  stop,
  setProgress,
  seek,
  setRate,
  setTextColor,
  setFontSize,
  setDarkMode,
  setVolume,
  setLoading,
  setLoadError,
  showMiniPlayer,
  hideMiniPlayer,
  setQueue,
  setQueueIndex,
  clearQueue,
} = playerSlice.actions;
export default playerSlice.reducer;

export const selectCurrentRecording = (s: RootState): Recording | null =>
  s.player.currentRecording;
export const selectIsPlaying = (s: RootState): boolean => s.player.isPlaying;
export const selectPlayerLoading = (s: RootState): boolean => s.player.isLoading;
export const selectPlayerPosition = (s: RootState): number => s.player.positionMillis;
export const selectPlayerDuration = (s: RootState): number => s.player.durationMillis;
export const selectMiniPlayerVisible = (s: RootState): boolean =>
  s.player.miniPlayerVisible && s.player.currentRecording !== null;
export const selectPlayerDiseaseId = (s: RootState): number | null => s.player.diseaseId;
export const selectPlayerLoadError = (s: RootState): boolean => s.player.loadError;
export const selectQueue = (s: RootState): Recording[] => s.player.queue;
export const selectQueueIndex = (s: RootState): number => s.player.queueIndex;
export const selectPlaybackRate = (s: RootState): number => s.player.playbackRate;
export const selectTextColor = (s: RootState): string => s.player.textColor;
export const selectFontSize = (s: RootState): number => s.player.fontSize;
export const selectDarkMode = (s: RootState): boolean => s.player.isDarkMode;
