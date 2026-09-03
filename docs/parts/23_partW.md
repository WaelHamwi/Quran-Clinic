
# 58. Annotated Walkthrough — Mobile State & the Audio Player

> This chapter reads the device-state layer line by line: the Redux `playerSlice` (shape, reducers, selectors), the `usePlayer` hook (memoization discipline), and `useDownloadManager` (resumable downloads). It shows how Redux Toolkit, Immer, selectors, and React memoization connect into a render-efficient whole.

## 58.1 The slice state shape (the data structure)

```ts
interface PlayerState {
  currentRecording: Recording | null;
  diseaseId: number | null;
  source: 'stream' | 'local';
  isPlaying: boolean;
  isLoading: boolean;
  positionMillis: number;
  durationMillis: number;
  playbackRate: number;
  textColor: string;        // user display prefs (session-scoped)
  fontSize: number;
  isDarkMode: boolean;
  queue: Recording[];       // shuffled "general ruqyah" playlist
  queueIndex: number;       // -1 when no queue
}
```

* **A single flat object** — the entire player's runtime state. Flat (not deeply nested) so selectors can read any field with a single property access and reference-compare it cheaply (§38.5).
* **Discriminated fields** — `source: 'stream' | 'local'` is a *union type*; the value tells the player whether to stream from a URL or play a downloaded file.
* **`queue` / `queueIndex`** — a list + cursor implement the "general ruqyah" sequential playlist; `queueIndex = -1` is the sentinel "no active queue."

## 58.2 The slice — reducers with Immer

```ts
const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    setRecording(state, action: PayloadAction<{ recording: Recording; diseaseId: number | null; source: PlayerSource }>) {
      state.currentRecording = action.payload.recording;     // looks like mutation…
      state.diseaseId = action.payload.diseaseId;
      state.source = action.payload.source;
      state.positionMillis = 0;
      state.isLoading = true;
      state.miniPlayerVisible = true;
    },
    play(state)  { state.isPlaying = true; },
    pause(state) { state.isPlaying = false; },
    stop()       { return initialState; },                    // wholesale reset
    setProgress(state, action: PayloadAction<{ position: number; duration: number }>) {
      state.positionMillis = action.payload.position;
      if (action.payload.duration > 0) state.durationMillis = action.payload.duration;
    },
  },
});
export const { setRecording, play, pause, stop, setProgress, /* … */ } = playerSlice.actions;
export default playerSlice.reducer;
```

* **`createSlice`** — Redux Toolkit's factory: from a name + initial state + reducer map it **auto-generates action creators** (`setRecording(...)`, `play()`, …) and the reducer. No hand-written action-type constants or switch statements (the classic Redux boilerplate is eliminated).
* **"Mutating" reducers** — `state.isPlaying = true` *appears* to mutate, but RTK runs reducers inside **Immer**, which hands you a `Proxy` draft, records the writes, and produces a brand-new immutable state with **structural sharing** (untouched slices keep their old references, §38.5). So the code is simple *and* the state stays immutable.
* **`PayloadAction<T>`** — types the action's `payload`, so `action.payload.recording` is type-checked.
* **`stop() { return initialState; }`** — a reducer that *returns* a value replaces the whole slice state — a clean full reset (Immer treats a returned value as the next state).
* **`setProgress`** fires ~4×/second during playback; it touches only `positionMillis`/`durationMillis`, so only those selectors' subscribers re-render (§58.3).

## 58.3 Selectors — the re-render firewall

```ts
export const selectIsPlaying      = (s: RootState): boolean => s.player.isPlaying;
export const selectPlayerPosition = (s: RootState): number  => s.player.positionMillis;
export const selectMiniPlayerVisible = (s: RootState): boolean =>
  s.player.miniPlayerVisible && s.player.currentRecording !== null;   // derived
```

* **Atomic selectors** — each returns one primitive. `react-redux`'s `useSelector` re-renders a component only when its selector's return value changes by `===`. Because `setProgress` changes only `positionMillis`, a component subscribed to `selectIsPlaying` does **not** re-render on the 4 Hz tick — only the progress bar (subscribed to `selectPlayerPosition`) does. This is the rendering-performance foundation (§19).
* **One derived selector** — `selectMiniPlayerVisible` encodes the rule "show the mini-player only if visible *and* something is loaded," so no component re-implements it (DRY at the selector level).

## 58.4 `usePlayer` — bridging Redux, the engine, and memoization

```ts
export function usePlayer() {
  const engine = useRuqyahEngine();             // imperative audio engine (Context)
  const dispatch = useAppDispatch();
  const isPlaying = useAppSelector(selectIsPlaying);   // … + other atomic selectors

  const loadAndPlay = useCallback((recording, diseaseId, localUri) => {
    const uri = localUri ?? recording.audio_url;
    if (!uri) return;
    dispatch(clearQueue());
    dispatch(setRecording({ recording, diseaseId, source: localUri ? 'local' : 'stream' }));
    engine.load(uri);
    engine.play();
  }, [dispatch, engine]);

  const togglePlay = useCallback(() => {
    if (isPlaying) engine.pause(); else engine.play();
  }, [isPlaying, engine]);

  return useMemo(() => ({
    currentRecording, isPlaying, isLoading, position, duration, playbackRate,
    loadAndPlay, play, pause, seekTo, stop, togglePlay, setRate, isCurrent,
  }), [/* exhaustive deps */]);
}
```

* **Two state worlds bridged** — Redux holds *declarative* player state (what's playing, position); the `engine` (a Context-provided imperative object wrapping `expo-av`) does the *actual* audio I/O. `usePlayer` keeps them in sync: every action both calls the engine **and** dispatches to Redux (so the UI reflects it).
* **`useCallback(fn, deps)`** — memoizes each handler so its identity is stable across renders; a child wrapped in `React.memo` receiving `togglePlay` won't re-render just because the parent re-rendered (§22). The dep array lists every value the closure reads (`isPlaying`, `engine`) so it's recreated only when those change.
* **`useMemo(() => ({...}), deps)`** — returns a *stable object* of the whole API, so consumers don't re-render on unrelated parent renders (§21). Without it, `usePlayer()` would return a new object literal every render, defeating every consumer's memoization.
* **`localUri ?? recording.audio_url`** — nullish-coalescing chooses the downloaded file if present, else the stream URL; `source` is set accordingly. This single line is the stream-vs-download decision.

## 58.5 `useDownloadManager` — resumable downloads, line by line

```ts
const runDownload = useCallback(async (params: RunParams) => {
  const { recordingId, audioUrl, diseaseId, title, sessionNumber, resumeData } = params;
  try {
    const { uri, size } = await audioService.downloadRecording(
      audioUrl, recordingId,
      (progress, totalBytes) => dispatch(updateProgress({ recordingId, progress, totalBytes })),  // [1] progress
      resumeData,                                                                                  // [2] resume token in
      (token) => dispatch(saveResumeData({ recordingId, resumeData: token })),                     // [3] resume token out
    );
    dispatch(completeTask({ recordingId, diseaseId, title, sessionNumber, localPath: uri, size, downloadedAt: Date.now() }));
  } catch (e) {
    dispatch(failTask({ recordingId, error: (e as Error).message ?? 'failed' }));                  // [4] keep resumable
  }
}, [dispatch]);
```

* **[1] Progress callback** — `audioService` calls back with bytes-so-far; each call dispatches `updateProgress`, updating a progress bar. (These dispatches are frequent — which is why `redux-persist` is throttled to 1 write/s, §23.)
* **[2]–[3] Resume tokens** — `expo-file-system`'s resumable download yields an opaque resume token as it proceeds; `saveResumeData` persists it to the store. If the app is killed mid-download, the token (persisted by `downloadsTransform`) lets the next launch continue from where it stopped rather than restarting.
* **[4]** On failure, `failTask` records the error but **keeps the task resumable** — graceful degradation (§48.4).

```ts
const resumeIncomplete = useCallback(async () => {
  const state = store.getState();                         // [5] read live store, not a render closure
  const pending = selectResumableTasks(state);
  if (pending.length === 0) return;
  if (state.downloads.wifiOnly) {
    const net = await NetInfo.fetch();
    if (net.type !== 'wifi') return;                      // [6] respect Wi-Fi-only
  }
  for (const t of pending) {
    if (t.recordingId in state.downloads.completed) continue;
    void runDownload({ ...t, audioUrl: t.downloadUrl, resumeData: t.resumeData });  // [7] resume each
  }
}, [runDownload]);
```

* **[5]** Reads `store.getState()` *directly* rather than a `useSelector` value — deliberately, so it sees the **just-rehydrated** tasks (from `redux-persist`) rather than a stale render-time closure. This avoids a classic stale-closure bug and keeps the dep array minimal (`[runDownload]`).
* **[6]** Honors the `wifiOnly` preference via a live `NetInfo` check before resuming.
* **[7]** Resumes each unfinished task; `void` fires them concurrently without awaiting. Already-completed tasks are skipped.
* **Connection:** `DownloadResumer` (a mounted component) calls `resumeIncomplete()` on app foreground — so interrupted downloads self-heal across app restarts.

## 58.6 The whole device-state picture

```mermaid
flowchart TB
    UI["Component"] -->|useAppSelector(atomic)| Sel["selectors"]
    Sel --> Store["Redux store (Immer immutable tree)"]
    UI -->|usePlayer / useDownloadManager| Hooks["memoized hooks"]
    Hooks -->|dispatch| Store
    Hooks -->|imperative| Engine["audio engine / audioService / FileSystem"]
    Store -->|redux-persist (throttled, transformed)| AS[("AsyncStorage")]
    Store -->|"401 handler"| Clear["clearAuth"]
```

The pattern, end to end: **components read atomic selectors and call memoized hooks; hooks dispatch to an Immer-immutable store and drive imperative device APIs; a throttled, transformed slice of the store persists to disk.** Granular selectors + `useCallback`/`useMemo` discipline are what keep a 4 Hz audio tick and many-per-second download-progress events from melting the render tree.

---
