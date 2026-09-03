import React from 'react';
import { act, renderHook } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { rootReducer } from '@/store/rootReducer';
import { setQueue, setRecording, setProgress } from '@/store/slices/playerSlice';
import { useQueueTimeline } from '@/hooks/player/useQueueTimeline';
import { usePlayer } from '@/hooks/player/usePlayer';
import type { QueueKind } from '@/store/slices/playerSlice';

const mockEngine = { load: jest.fn(), play: jest.fn(), pause: jest.fn(), seek: jest.fn() };
const mockSeekTo = jest.fn();

jest.mock('@/context/PlayerContext', () => ({
  useRuqyahEngine: () => mockEngine,
}));

jest.mock('@/hooks/common/useDownloadManager', () => ({
  useDownloadManager: () => ({ getLocalUri: () => null }),
}));

jest.mock('@/hooks/player/usePlayer', () => ({ usePlayer: jest.fn() }));

function withEngineClock(positionMs: number, durationMs: number) {
  (usePlayer as jest.Mock).mockReturnValue({
    position: positionMs,
    duration: durationMs,
    seekTo: mockSeekTo,
  });
}

const track = (id: number, durationSeconds: number | null, audioUrl?: string | null) => ({
  id,
  disease_id: null,
  category_id: null,
  subcategory_id: 7,
  session_number: id,
  description: { ar: `نص ${id}`, en: `Text ${id}` },
  segments: null,
  audio_url: audioUrl === undefined ? `https://cdn.test/${id}.mp3` : audioUrl,
  duration_seconds: durationSeconds,
  type: 'summarized' as const,
  is_general: false,
  is_free: true,
  requires_subscription: false,
  plays_count: 0,
});

// 34:52 + 32:29 + 32:05 — the shape of a real multi-session wird.
const SESSION_A = 2092;
const SESSION_B = 1949;
const SESSION_C = 1925;

function setup(
  queue: ReturnType<typeof track>[],
  { index = 0, positionMs = 0, engineDurationMs = 0, kind = 'wird' as QueueKind } = {},
) {
  const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefault) => getDefault({ serializableCheck: false }),
  });

  store.dispatch(setQueue({ recordings: queue, index, kind, contextId: 7 }));
  store.dispatch(setRecording({ recording: queue[index], diseaseId: 7, source: 'stream' }));
  store.dispatch(setProgress({ position: positionMs, duration: engineDurationMs }));

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );

  return { store, ...renderHook(() => useQueueTimeline(), { wrapper }) };
}

describe('useQueueTimeline — the transport times the whole wird', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    withEngineClock(0, 0);
  });

  it('adds every session into one total', () => {
    withEngineClock(0, SESSION_A * 1000);
    const { result } = setup([
      track(1, SESSION_A),
      track(2, SESSION_B),
      track(3, SESSION_C),
    ]);

    expect(result.current.spansQueue).toBe(true);
    expect(result.current.duration).toBe((SESSION_A + SESSION_B + SESSION_C) * 1000);
  });

  it('counts elapsed from the start of the wird, not the start of the session', () => {
    withEngineClock(30_000, SESSION_B * 1000);
    const { result } = setup([track(1, SESSION_A), track(2, SESSION_B)], { index: 1 });

    expect(result.current.position).toBe(SESSION_A * 1000 + 30_000);
  });

  it('prefers the engine length for the playing session over the CMS metadata', () => {
    // The CMS says 100s; the file is really 120s. The engine wins for the one
    // session it holds, so the total does not drift from what actually plays.
    withEngineClock(0, 120_000);
    const { result } = setup([track(1, 100), track(2, 60)]);

    expect(result.current.duration).toBe(180_000);
  });

  it('falls back to the session clock when a sibling has no known length', () => {
    withEngineClock(5_000, 60_000);
    const { result } = setup([track(1, 60), track(2, null)]);

    expect(result.current.spansQueue).toBe(false);
    expect(result.current.duration).toBe(60_000);
    expect(result.current.position).toBe(5_000);
  });

  it('gives a text-only session no time on the clock', () => {
    // It is queued so its text stacks in the reader, but it never plays, so
    // counting its length would promise time that is never heard.
    withEngineClock(0, SESSION_A * 1000);
    const { result } = setup([
      track(1, SESSION_A),
      track(2, 25, null),
      track(3, SESSION_B),
    ]);

    expect(result.current.spansQueue).toBe(true);
    expect(result.current.duration).toBe((SESSION_A + SESSION_B) * 1000);
  });

  it('seeks past a text-only session to the next audible one', () => {
    withEngineClock(0, SESSION_A * 1000);
    const { store, result } = setup([
      track(1, SESSION_A),
      track(2, 25, null),
      track(3, SESSION_B),
    ]);

    act(() => { result.current.seekTimeline(SESSION_A * 1000 + 10_000); });

    expect(store.getState().player.queueIndex).toBe(2);
    expect(mockEngine.load).toHaveBeenCalledWith('https://cdn.test/3.mp3', 10_000);
  });

  it('leaves a lone session on its own clock', () => {
    withEngineClock(5_000, 60_000);
    const { result } = setup([track(1, 60)]);

    expect(result.current.spansQueue).toBe(false);
    expect(result.current.duration).toBe(60_000);
  });

  it('does not merge a general-ruqyah playlist into one clock', () => {
    withEngineClock(0, 60_000);
    const { result } = setup([track(1, 60), track(2, 60)], { kind: 'general' });

    expect(result.current.spansQueue).toBe(false);
    expect(result.current.duration).toBe(60_000);
  });

  it('seeks inside the playing session without touching the queue', () => {
    withEngineClock(0, SESSION_A * 1000);
    const { store, result } = setup([track(1, SESSION_A), track(2, SESSION_B)]);

    act(() => { result.current.seekTimeline(60_000); });

    expect(mockSeekTo).toHaveBeenCalledWith(60_000);
    expect(mockEngine.load).not.toHaveBeenCalled();
    expect(store.getState().player.queueIndex).toBe(0);
  });

  it('switches session when the seek lands past the current one', () => {
    withEngineClock(0, SESSION_A * 1000);
    const { store, result } = setup([
      track(1, SESSION_A),
      track(2, SESSION_B),
      track(3, SESSION_C),
    ]);

    // 10s into session 2.
    act(() => { result.current.seekTimeline(SESSION_A * 1000 + 10_000); });

    expect(store.getState().player.queueIndex).toBe(1);
    expect(store.getState().player.currentRecording?.id).toBe(2);
    expect(mockEngine.load).toHaveBeenCalledWith('https://cdn.test/2.mp3', 10_000);
    expect(mockEngine.play).toHaveBeenCalled();
  });

  it('clamps a seek past the end of the wird to its last session', () => {
    withEngineClock(0, SESSION_A * 1000);
    const { store, result } = setup([track(1, SESSION_A), track(2, SESSION_B)]);

    act(() => { result.current.seekTimeline(99_999_999); });

    expect(store.getState().player.queueIndex).toBe(1);
  });
});
