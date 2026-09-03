import reducer, {
  setRecording,
  play,
  pause,
  stop,
  setProgress,
  setLoadError,
  setFontSize,
  setQueue,
  clearQueue,
  setPlaybackOrigin,
} from '@/store/slices/playerSlice';
import type { Recording } from '@/types/recording';

const recording = { id: 42 } as unknown as Recording;

const load = () =>
  reducer(undefined, setRecording({ recording, diseaseId: 7, source: 'stream' }));

describe('playerSlice reducer', () => {
  it('setRecording loads the track, shows the mini-player and resets progress', () => {
    const state = load();
    expect(state.currentRecording).toBe(recording);
    expect(state.diseaseId).toBe(7);
    expect(state.source).toBe('stream');
    expect(state.isLoading).toBe(true);
    expect(state.miniPlayerVisible).toBe(true);
    expect(state.positionMillis).toBe(0);
  });

  it('play clears the loading spinner; pause stops playback', () => {
    const playing = reducer(load(), play());
    expect(playing.isPlaying).toBe(true);
    expect(playing.isLoading).toBe(false);

    const paused = reducer(playing, pause());
    expect(paused.isPlaying).toBe(false);
  });

  it('setProgress updates position and only sets duration when positive', () => {
    let state = reducer(load(), setProgress({ position: 1500, duration: 0 }));
    expect(state.positionMillis).toBe(1500);
    expect(state.durationMillis).toBe(0);

    state = reducer(state, setProgress({ position: 2000, duration: 60000 }));
    expect(state.durationMillis).toBe(60000);
  });

  it('setLoadError flags the error and clears loading', () => {
    const state = reducer(load(), setLoadError(true));
    expect(state.loadError).toBe(true);
    expect(state.isLoading).toBe(false);
  });

  it('stop resets playback identity but preserves user session preferences', () => {
    let state = load();
    state = reducer(state, setFontSize(22));
    state = reducer(state, play());

    const stopped = reducer(state, stop());

    expect(stopped.currentRecording).toBeNull();
    expect(stopped.isPlaying).toBe(false);
    expect(stopped.miniPlayerVisible).toBe(false);
    // Preferences survive the reset.
    expect(stopped.fontSize).toBe(22);
  });

  it('setQueue keeps the owning screen id, so a category wird survives auto-advance', () => {
    const state = reducer(
      undefined,
      setQueue({ recordings: [recording], index: 0, kind: 'wird', contextId: 13 }),
    );
    expect(state.queueContextId).toBe(13);
    expect(reducer(state, clearQueue()).queueContextId).toBeNull();
  });

  it('setPlaybackOrigin records the route back to the wird, and stop clears it', () => {
    const route = '/hospital/disease/anxiety?skipIntro=1';
    const state = reducer(load(), setPlaybackOrigin(route));
    expect(state.originRoute).toBe(route);
    expect(reducer(state, setPlaybackOrigin(null)).originRoute).toBeNull();
    expect(reducer(state, stop()).originRoute).toBeNull();
  });

  it('setQueue without a context (general / favorites) leaves it null', () => {
    const state = reducer(
      undefined,
      setQueue({ recordings: [recording], index: 0, kind: 'general' }),
    );
    expect(state.queueContextId).toBeNull();
  });
});
