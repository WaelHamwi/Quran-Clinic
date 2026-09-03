import React from 'react';
import { Text } from 'react-native';
import { act, render } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { rootReducer } from '@/store/rootReducer';
import { setQueue, setRecording, setRepeatOne } from '@/store/slices/playerSlice';
import { completeTask } from '@/store/slices/downloadsSlice';
import { PlayerProvider, useRuqyahEngine, type PlayerEngine } from '@/context/PlayerContext';

const mockPlayer = {
  replace: jest.fn(),
  play: jest.fn(),
  pause: jest.fn(),
  seekTo: jest.fn(() => Promise.resolve()),
  updateLockScreenMetadata: jest.fn(),
  clearLockScreenControls: jest.fn(),
  setActiveForLockScreen: jest.fn(),
};

let mockStatus: Record<string, unknown> = {};

jest.mock('expo-audio', () => ({
  useAudioPlayer: () => mockPlayer,
  useAudioPlayerStatus: () => mockStatus,
  setAudioModeAsync: () => Promise.resolve(),
}));

jest.mock('@/context/LanguageContext', () => ({
  useLanguage: () => ({
    isArabic: true,
    t: {
      hospital: { generalRuqyah: 'g' },
      disease: { typeDetailed: 'd', typeSummarized: 's' },
      more: { appName: 'app' },
    },
  }),
}));

const track = (id: number, audioUrl: string | null, attachmentId = id) => ({
  id,
  attachment_id: attachmentId,
  disease_id: null,
  category_id: null,
  subcategory_id: 7,
  session_number: attachmentId,
  description: { ar: `نص ${id}`, en: `Text ${id}` },
  segments: null,
  audio_url: audioUrl,
  duration_seconds: 60,
  type: 'summarized' as const,
  is_general: false,
  is_free: true,
  requires_subscription: false,
  plays_count: 0,
});

const READY = {
  isLoaded: true,
  playing: true,
  currentTime: 10,
  duration: 60,
  didJustFinish: false,
  playbackState: 'ready',
};
/** A finished track reports its clock at the end, not mid-way. */
const FINISHED = { ...READY, currentTime: 60, playing: false, didJustFinish: true };
/** The track ran to its end but the engine never emitted `didJustFinish`. */
const AT_END_SILENT = { ...READY, currentTime: 60, didJustFinish: false };
/** Parked near the end while paused — not an ended track. */
const PAUSED_AT_END = { ...AT_END_SILENT, playing: false };

const engineRef: { current: PlayerEngine | null } = { current: null };

function Harness() {
  const engine = useRuqyahEngine();
  React.useEffect(() => { engineRef.current = engine; }, [engine]);
  return <Text>x</Text>;
}

function setup(
  queue: ReturnType<typeof track>[],
  downloads: Record<number, { localPath: string }> = {},
) {
  const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefault) => getDefault({ serializableCheck: false }),
  });

  store.dispatch(setQueue({ recordings: queue, index: 0, kind: 'wird', contextId: 7 }));
  store.dispatch(setRecording({ recording: queue[0], diseaseId: 7, source: 'stream' }));

  for (const [recordingId, { localPath }] of Object.entries(downloads)) {
    store.dispatch(
      completeTask({
        recordingId: Number(recordingId),
        diseaseId: 7,
        title: 'wird',
        sessionNumber: Number(recordingId),
        localPath,
        size: 1,
        downloadedAt: 0,
      }),
    );
  }

  // A fresh element per render: React bails out of re-rendering an element it
  // is handed by identity, which would freeze the mocked playback status.
  const tree = () => (
    <Provider store={store}>
      <PlayerProvider>
        <Harness />
      </PlayerProvider>
    </Provider>
  );

  mockStatus = READY;
  const view = render(tree());

  const withStatus = (status: Record<string, unknown>) => {
    mockStatus = status;
    act(() => { view.rerender(tree()); });
  };

  // The first session is started the way the wird screen starts it, so the
  // engine holds a source — the end-of-track handler ignores an idle engine.
  act(() => { engineRef.current!.load(queue[0].audio_url!); });
  // One tick of this source actually running, which is what tells the
  // end-of-track check the clock it is reading belongs to the loaded session.
  withStatus({ ...READY, currentTime: 5 });
  jest.clearAllMocks();

  const finish = () => {
    withStatus(FINISHED);
    withStatus(READY);
  };

  return { store, finish, withStatus };
}

describe('PlayerContext auto-advance — a wird plays as one continuous ruqyah', () => {
  afterEach(() => {
    engineRef.current = null;
    jest.clearAllMocks();
  });

  it('starts the next session, not just loads it', () => {
    // A replace() with no play() leaves session 2 loaded and silent, which is
    // what made a multi-session wird stop dead after the first recording.
    const { store, finish } = setup([
      track(1, 'https://cdn.test/1.mp3'),
      track(2, 'https://cdn.test/2.mp3'),
      track(3, 'https://cdn.test/3.mp3'),
    ]);

    finish();

    expect(mockPlayer.replace).toHaveBeenCalledWith(
      expect.objectContaining({ uri: 'https://cdn.test/2.mp3' }),
    );
    expect(mockPlayer.play).toHaveBeenCalled();
    expect(store.getState().player.queueIndex).toBe(1);
    expect(store.getState().player.currentRecording?.id).toBe(2);
  });

  it('walks the whole group in session order', () => {
    const { store, finish } = setup([
      track(1, 'https://cdn.test/1.mp3'),
      track(2, 'https://cdn.test/2.mp3'),
      track(3, 'https://cdn.test/3.mp3'),
    ]);

    finish();
    finish();

    expect(store.getState().player.queueIndex).toBe(2);
    expect(store.getState().player.currentRecording?.id).toBe(3);
  });

  it('steps over a text-only session instead of stopping on it', () => {
    const { store, finish } = setup([
      track(1, 'https://cdn.test/1.mp3'),
      track(2, null),
      track(3, 'https://cdn.test/3.mp3'),
    ]);

    finish();

    expect(store.getState().player.queueIndex).toBe(2);
    expect(store.getState().player.currentRecording?.id).toBe(3);
  });

  it('plays a downloaded session from its local file, without remote headers', () => {
    const { store, finish } = setup(
      [track(1, 'https://cdn.test/1.mp3'), track(2, 'https://cdn.test/2.mp3')],
      { 2: { localPath: 'file:///downloads/2.mp3' } },
    );

    finish();

    expect(mockPlayer.replace).toHaveBeenCalledWith({ uri: 'file:///downloads/2.mp3' });
    expect(store.getState().player.source).toBe('local');
  });

  it('clears the queue once the last session ends', () => {
    const { store, finish } = setup([track(1, 'https://cdn.test/1.mp3')]);

    finish();

    expect(store.getState().player.queue).toHaveLength(0);
    expect(store.getState().player.queueIndex).toBe(-1);
  });

  it('advances on the clock when the engine never reports the end', () => {
    // `didJustFinish` is not emitted reliably for a long streamed session; the
    // wird must not strand on its first recording when it goes missing.
    const { store, withStatus } = setup([
      track(1, 'https://cdn.test/1.mp3'),
      track(2, 'https://cdn.test/2.mp3'),
    ]);

    withStatus(AT_END_SILENT);

    expect(mockPlayer.play).toHaveBeenCalled();
    expect(store.getState().player.queueIndex).toBe(1);
    expect(store.getState().player.currentRecording?.id).toBe(2);
  });

  it('steps once, not twice, when both end signals arrive together', () => {
    const { store, withStatus } = setup([
      track(1, 'https://cdn.test/1.mp3'),
      track(2, 'https://cdn.test/2.mp3'),
      track(3, 'https://cdn.test/3.mp3'),
    ]);

    withStatus({ ...AT_END_SILENT, playing: false, didJustFinish: true });

    expect(store.getState().player.queueIndex).toBe(1);
    expect(store.getState().player.currentRecording?.id).toBe(2);
  });

  it('does not read the previous track position as the new one already ending', () => {
    const { store, withStatus } = setup([
      track(1, 'https://cdn.test/1.mp3'),
      track(2, 'https://cdn.test/2.mp3'),
      track(3, 'https://cdn.test/3.mp3'),
    ]);

    withStatus(FINISHED);
    // The engine still reports the finished track's clock right after the swap,
    // before session 2 has played a single tick of its own.
    withStatus(AT_END_SILENT);

    expect(store.getState().player.queueIndex).toBe(1);
    expect(store.getState().player.currentRecording?.id).toBe(2);
  });

  it('leaves a session parked near its end while paused alone', () => {
    const { store, withStatus } = setup([
      track(1, 'https://cdn.test/1.mp3'),
      track(2, 'https://cdn.test/2.mp3'),
    ]);

    withStatus({ ...READY, playing: false });
    withStatus(PAUSED_AT_END);

    expect(store.getState().player.queueIndex).toBe(0);
    expect(store.getState().player.currentRecording?.id).toBe(1);
  });

  it('advances past a recording the wird plays twice in a row', () => {
    // A ruqyah may repeat the same passage back to back. The end-of-track claim
    // is held per occurrence, not per recording — held by id, the second lap
    // would read as already claimed and the wird would stall on it.
    const { store, finish } = setup([
      track(1, 'https://cdn.test/1.mp3', 101),
      track(1, 'https://cdn.test/1.mp3', 102),
      track(2, 'https://cdn.test/2.mp3', 103),
    ]);

    finish();

    expect(store.getState().player.queueIndex).toBe(1);
    expect(store.getState().player.currentRecording?.attachment_id).toBe(102);

    finish();

    expect(store.getState().player.queueIndex).toBe(2);
    expect(store.getState().player.currentRecording?.id).toBe(2);
  });

  it('repeats the session instead of advancing when repeat-one is on', () => {
    const { store, finish } = setup([
      track(1, 'https://cdn.test/1.mp3'),
      track(2, 'https://cdn.test/2.mp3'),
    ]);
    act(() => { store.dispatch(setRepeatOne(true)); });

    finish();

    expect(mockPlayer.seekTo).toHaveBeenCalledWith(0);
    expect(store.getState().player.queueIndex).toBe(0);
  });
});
