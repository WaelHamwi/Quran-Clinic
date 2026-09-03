import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Recording } from '@/types/recording';
import type { RootState } from '@/store/rootReducer';

export type PlayerSource = 'stream' | 'local';

/** Which flow owns the playback queue. General ruqyah is toggle-driven with no
 *  mini-player bar; favorites drives the full MiniPlayer; `wird` is a single
 *  tab's own recordings on the disease/recordings screen, played back-to-back —
 *  that one belongs to the screen, so it does not count as a foreign queue.
 *  Null = no active queue. */
export type QueueKind = 'general' | 'favorites' | 'wird' | null;

interface PlayerState {
  currentRecording: Recording | null;
  diseaseId: number | null;
  source: PlayerSource;
  isPlaying: boolean;
  isLoading: boolean;
  loadError: boolean;
  positionMillis: number;
  durationMillis: number;
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
  /** Which flow owns the queue (general ruqyah vs favorites). Null when idle. */
  queueKind: QueueKind;
  /**
   * The screen the queue belongs to (a disease id, or a direct category /
   * subcategory id). Recordings attached to a category carry no `disease_id`,
   * so auto-advance cannot re-derive it from the track — without this the wird
   * screen stops recognising its own playback after the first track ends.
   */
  queueContextId: number | null;
  /** Loop the current track on end instead of advancing the queue. */
  repeatOne: boolean;
  /**
   * Route of the screen the playing wird belongs to, so the mini player can take
   * the user back to it. A slug is the only way back to a wird screen and the
   * recordings themselves carry none, so the starting screen records it here.
   */
  originRoute: string | null;
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
  volume: 1,
  miniPlayerVisible: false,
  textColor: '#181d27',
  fontSize: 16,
  isDarkMode: false,
  queue: [],
  queueIndex: -1,
  queueKind: null,
  queueContextId: null,
  repeatOne: false,
  originRoute: null,
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
      // Playing implies the source is ready — clear any lingering load spinner
      // (covers a fast/streamed source that never toggles `isLoaded`).
      state.isLoading = false;
    },
    pause(state) {
      state.isPlaying = false;
    },
    stop(state) {
      // Reset playback identity but keep the user's session preferences so a
      // later replay reflects the font/colour and repeat mode they chose.
      return {
        ...initialState,
        textColor: state.textColor,
        fontSize: state.fontSize,
        isDarkMode: state.isDarkMode,
        repeatOne: state.repeatOne,
      };
    },
    setProgress(state, action: PayloadAction<{ position: number; duration: number }>) {
      state.positionMillis = action.payload.position;
      if (action.payload.duration > 0) state.durationMillis = action.payload.duration;
    },
    seek(state, action: PayloadAction<number>) {
      state.positionMillis = action.payload;
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
    setQueue(
      state,
      action: PayloadAction<{
        recordings: Recording[];
        index: number;
        kind: QueueKind;
        contextId?: number | null;
      }>,
    ) {
      state.queue = action.payload.recordings;
      state.queueIndex = action.payload.index;
      state.queueKind = action.payload.kind;
      state.queueContextId = action.payload.contextId ?? null;
    },
    setQueueIndex(state, action: PayloadAction<number>) {
      state.queueIndex = action.payload;
    },
    clearQueue(state) {
      state.queue = [];
      state.queueIndex = -1;
      state.queueKind = null;
      state.queueContextId = null;
    },
    setRepeatOne(state, action: PayloadAction<boolean>) {
      state.repeatOne = action.payload;
    },
    toggleRepeatOne(state) {
      state.repeatOne = !state.repeatOne;
    },
    setPlaybackOrigin(state, action: PayloadAction<string | null>) {
      state.originRoute = action.payload;
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
  setRepeatOne,
  toggleRepeatOne,
  setPlaybackOrigin,
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
export const selectQueueKind = (s: RootState): QueueKind => s.player.queueKind;
export const selectQueueContextId = (s: RootState): number | null => s.player.queueContextId;
export const selectRepeatOne = (s: RootState): boolean => s.player.repeatOne;
export const selectTextColor = (s: RootState): string => s.player.textColor;
export const selectFontSize = (s: RootState): number => s.player.fontSize;
export const selectDarkMode = (s: RootState): boolean => s.player.isDarkMode;
export const selectPlaybackOrigin = (s: RootState): string | null => s.player.originRoute;
