import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { useAudioPlayer, useAudioPlayerStatus, setAudioModeAsync, type AudioMetadata } from 'expo-audio';
import { LOCK_SCREEN_OPTIONS } from '@/constants/lockScreen';
import { claimAudioFocus, registerAudioEngine } from '@/services/player/audioFocus';
import { useLanguage } from '@/context/LanguageContext';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  setProgress,
  play as playAction,
  pause as pauseAction,
  setLoading,
  setLoadError,
  setRecording,
  setQueueIndex,
  clearQueue,
  selectCurrentRecording,
  selectQueue,
  selectQueueIndex,
  selectQueueContextId,
  selectPlayerLoading,
  selectRepeatOne,
} from '@/store/slices/playerSlice';
import { selectCompletedDownloads } from '@/store/slices/downloadsSlice';
import { occurrenceKeyOf, recordingTypeOf } from '@/utils/recordings';
import type { Recording } from '@/types/recording';

/**
 * Single shared `expo-audio` engine for ruqyah recordings. Holds the
 * non-serializable player object (which cannot live in Redux); playback STATE
 * is mirrored into `playerSlice`. Completely separate from the Mushaf
 * `useAudio` engine — the two never share a player (RULE_42).
 *
 * Also owns queue auto-advance: when a track ends (playing → idle/ended),
 * this context loads the next track in the general ruqyah queue so it works
 * regardless of which screen the user is currently on.
 */
export interface PlayerEngine {
  /** `startAtMillis` resumes mid-session — used when a whole-wird seek lands on
   *  a session other than the one playing. */
  load: (uri: string, startAtMillis?: number) => void;
  play: () => void;
  pause: () => void;
  seek: (millis: number) => void;
}

const PlayerContext = createContext<PlayerEngine | null>(null);
const PROGRESS_THROTTLE_MS = 250;

/** How close to the end counts as ended when the engine skips `didJustFinish`. */
const END_OF_TRACK_EPSILON_SEC = 0.75;


export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const player = useAudioPlayer(null);
  const status = useAudioPlayerStatus(player);
  const lastTickRef = useRef(0);
  const hasSourceRef = useRef(false);
  const pendingPlayRef = useRef(false);
  const pendingSeekRef = useRef<number | null>(null);
  const isLoadedRef = useRef(false);
  const prevFinishedRef = useRef(false);
  const wasPlayingRef = useRef(false);
  /**
   * The session whose end has already been acted on — see advanceQueue(). Held
   * as an occurrence key, not a recording id: a wird may play the same
   * recording twice in a row, and an id would still read as claimed when the
   * second of them ends, stalling the queue there.
   */
  const endedForRef = useRef<string | null>(null);
  /** Whether the CURRENT source has been seen playing somewhere before its end. */
  const sawMidTrackRef = useRef(false);

  // Keep queue in refs so the playbackState effect never has stale values
  // without re-creating the effect on every queue update.
  const queue = useAppSelector(selectQueue);
  const queueIndex = useAppSelector(selectQueueIndex);
  const queueContextId = useAppSelector(selectQueueContextId);
  const queueRef = useRef<Recording[]>(queue);
  const queueIndexRef = useRef<number>(queueIndex);
  const queueContextIdRef = useRef<number | null>(queueContextId);
  useEffect(() => { queueRef.current = queue; }, [queue]);
  useEffect(() => { queueIndexRef.current = queueIndex; }, [queueIndex]);
  useEffect(() => { queueContextIdRef.current = queueContextId; }, [queueContextId]);

  const repeatOne = useAppSelector(selectRepeatOne);
  const repeatOneRef = useRef(repeatOne);
  useEffect(() => { repeatOneRef.current = repeatOne; }, [repeatOne]);

  // Auto-advance must reach for a downloaded file the same way a tapped session
  // does, or a queue that plays offline from track 1 dies at track 2.
  const downloads = useAppSelector(selectCompletedDownloads);
  const downloadsRef = useRef(downloads);
  useEffect(() => { downloadsRef.current = downloads; }, [downloads]);

  useEffect(() => {
    setAudioModeAsync({
      allowsRecording: false,
      playsInSilentMode: true,
      shouldPlayInBackground: true,
    }).catch(() => {});
  }, []);

  // Lock screen / notification media controls. Only one player app-wide may own
  // them (the Mushaf engine is the other contender) — claimed on each play so
  // the last-played engine wins.
  const { t } = useLanguage();
  const currentRecording = useAppSelector(selectCurrentRecording);
  const currentRecordingRef = useRef<Recording | null>(currentRecording);
  useEffect(() => {
    // Releasing the end-of-track claim here rather than in load() keeps it held
    // for the whole commit in which the swap is dispatched, so the two end
    // signals cannot both step the queue on the same status tick.
    const previous = currentRecordingRef.current;
    const swapped =
      (previous ? occurrenceKeyOf(previous) : null) !==
      (currentRecording ? occurrenceKeyOf(currentRecording) : null);
    if (swapped) endedForRef.current = null;
    currentRecordingRef.current = currentRecording;
  }, [currentRecording]);
  const lockScreenMetadata = useMemo<AudioMetadata | null>(() => {
    if (!currentRecording) return null;
    const title = currentRecording.is_general
      ? t.hospital.generalRuqyah
      : recordingTypeOf(currentRecording) === 'detailed'
        ? t.disease.typeDetailed
        : t.disease.typeSummarized;
    return { title, artist: t.more.appName, albumTitle: t.more.appName };
  }, [currentRecording, t]);
  const lockScreenMetadataRef = useRef<AudioMetadata | null>(null);
  const lockScreenActiveRef = useRef(false);

  useEffect(() => {
    lockScreenMetadataRef.current = lockScreenMetadata;
    if (!lockScreenActiveRef.current) return;
    try {
      if (lockScreenMetadata) {
        player.updateLockScreenMetadata(lockScreenMetadata);
      } else {
        player.clearLockScreenControls();
        lockScreenActiveRef.current = false;
      }
    } catch {}
  }, [lockScreenMetadata, player]);

  useEffect(() => {
    if (status.playing && lockScreenMetadataRef.current) {
      try {
        player.setActiveForLockScreen(true, lockScreenMetadataRef.current, LOCK_SCREEN_OPTIONS);
        lockScreenActiveRef.current = true;
      } catch {}
    }
  }, [status.playing, player]);

  // Throttle high-frequency progress updates into Redux (~4/sec).
  useEffect(() => {
    const now = Date.now();
    if (now - lastTickRef.current >= PROGRESS_THROTTLE_MS) {
      lastTickRef.current = now;
      dispatch(
        setProgress({
          position: (status.currentTime ?? 0) * 1000,
          duration: (status.duration ?? 0) * 1000,
        }),
      );
    }
  }, [status.currentTime, status.duration, dispatch]);

  useEffect(() => {
    dispatch(status.playing ? playAction() : pauseAction());
  }, [status.playing, dispatch]);

  // Keep isLoaded ref fresh so play() can check it without a stale closure.
  // Auto-play as soon as the source is ready when a play was requested.
  useEffect(() => {
    isLoadedRef.current = status.isLoaded;
    if (status.isLoaded) {
      const seekMillis = pendingSeekRef.current;
      if (seekMillis !== null) {
        pendingSeekRef.current = null;
        void player.seekTo(seekMillis / 1000).catch(() => {});
      }
      if (pendingPlayRef.current) {
        pendingPlayRef.current = false;
        player.play();
      }
    }
  }, [status.isLoaded, player]);

  // Loading = a source is attached but not ready yet. A track is "ready" once it
  // is playing OR has progressed past 0 — a fast local (downloaded) source can
  // finish loading without `isLoaded`/`playing` ever re-toggling, which would
  // otherwise leave the play-button spinner running forever. Keying off
  // `currentTime` (which advances for the new track) re-checks every tick; we
  // only dispatch on an actual change to avoid churn.
  const loadingActive = useAppSelector(selectPlayerLoading);
  useEffect(() => {
    const ready = status.playing || (status.currentTime ?? 0) > 0;
    const next = hasSourceRef.current && !status.isLoaded && !ready;
    if (next !== loadingActive) dispatch(setLoading(next));
  }, [status.isLoaded, status.playing, status.currentTime, loadingActive, dispatch]);

  // AVPlayer (iOS) reports 'failed'; ExoPlayer (Android) may surface similar.
  useEffect(() => {
    if (hasSourceRef.current && status.playbackState === 'failed') {
      dispatch(setLoadError(true));
    }
  }, [status.playbackState, dispatch]);

  const load = useCallback(
    (uri: string, startAtMillis?: number) => {
      // load() auto-plays once ready — take over from the Mushaf engine now.
      claimAudioFocus('ruqyah');
      hasSourceRef.current = true;
      pendingPlayRef.current = true;
      pendingSeekRef.current = startAtMillis && startAtMillis > 0 ? startAtMillis : null;
      // The clock a fresh source reports stays the previous track's until the
      // swap lands, so the end-of-track check has to see this one running first.
      sawMidTrackRef.current = false;
      dispatch(setLoadError(false));
      // The ngrok header is only meaningful for the remote tunnel (so it serves
      // the file instead of its browser-warning page). Sending HTTP headers with
      // a downloaded `file://` source can stall the load — omit them locally.
      const isRemote = /^https?:/i.test(uri);
      player.replace(
        isRemote ? { uri, headers: { 'ngrok-skip-browser-warning': 'true' } } : { uri },
      );
    },
    [player, dispatch],
  );
  const play = useCallback(() => {
    claimAudioFocus('ruqyah');
    if (isLoadedRef.current) {
      player.play();
    } else {
      // Source not ready yet — auto-play once isLoaded fires.
      pendingPlayRef.current = true;
    }
  }, [player]);
  const pause = useCallback(() => {
    pendingPlayRef.current = false; // cancel any pending auto-play
    player.pause();
  }, [player]);
  const seek = useCallback(
    (millis: number) => {
      player.seekTo(millis / 1000);
    },
    [player],
  );
  useEffect(() => registerAudioEngine('ruqyah', pause), [pause]);

  const sourceFor = useCallback(
    (recording: Recording | undefined): string | null =>
      recording ? downloadsRef.current[recording.id]?.localPath ?? recording.audio_url ?? null : null,
    [],
  );

  const advanceQueue = useCallback(() => {
    if (!hasSourceRef.current) return;

    // Two end-of-track signals feed this (see below); whichever arrives first
    // claims the track so the other cannot advance a second time.
    const endedKey = endedForRef.current;
    const current = currentRecordingRef.current;
    const currentKey = current ? occurrenceKeyOf(current) : null;
    if (currentKey === null || endedKey === currentKey) return;
    endedForRef.current = currentKey;

    // Repeat wins over queue advance — the track restarts and the queue
    // position is left untouched, so skip/next still resume from where it is.
    if (repeatOneRef.current) {
      void player
        .seekTo(0)
        .then(() => {
          // The same track plays again, so it has to be claimable again or the
          // second lap would never loop.
          endedForRef.current = null;
          player.play();
        })
        .catch(() => {});
      return;
    }

    const q = queueRef.current;
    if (q.length === 0) return;

    // A session may be text only (the admin attached a ruqyah with no audio):
    // its text still stacks in the reader, but the queue has to step over it
    // instead of stopping dead on a track that can never load.
    let nextIdx = queueIndexRef.current + 1;
    while (nextIdx < q.length && !sourceFor(q[nextIdx])) nextIdx++;

    const next = q[nextIdx];
    const uri = sourceFor(next);
    if (!uri) {
      // Reached the end of the queue — clear it.
      dispatch(clearQueue());
      return;
    }

    dispatch(setQueueIndex(nextIdx));
    dispatch(
      setRecording({
        recording: next,
        // Recordings attached straight to a category/subcategory carry no
        // disease_id, so the queue's own context is the only way the wird
        // screen keeps recognising this as its playback.
        diseaseId: queueContextIdRef.current ?? next.disease_id,
        source: uri === next.audio_url ? 'stream' : 'local',
      }),
    );
    // Same load-then-play pair a tapped session uses. The explicit play() is
    // what makes the chain survive a source that swaps in without `isLoaded`
    // re-toggling: the pending-play effect never fires for those, so a
    // replace() on its own leaves the next session loaded but silent.
    load(uri);
    play();
  }, [dispatch, player, sourceFor, load, play]);

  // Signal 1 — rising edge of `didJustFinish`, the engine's own end-of-track
  // event (a user pause never sets it). The old playing → idle/ended
  // `playbackState` check could never match on Android: ExoPlayer reports
  // ready/buffering/idle/ended, never 'playing' (that string lives in
  // `timeControlStatus`).
  useEffect(() => {
    const finished = status.didJustFinish ?? false;
    const wasFinished = prevFinishedRef.current;
    prevFinishedRef.current = finished;

    if (finished && !wasFinished) advanceQueue();
  }, [status.didJustFinish, advanceQueue]);

  // Signal 2 — the position reached the end. `didJustFinish` is not emitted
  // reliably for a long streamed session, and missing it strands a multi-session
  // wird on its first recording, so the queue also advances on the clock. The
  // per-track claim in advanceQueue() is what keeps the two signals from
  // double-stepping when both do arrive.
  useEffect(() => {
    const duration = status.duration ?? 0;
    const position = status.currentTime ?? 0;
    const playing = status.playing ?? false;
    const wasPlaying = wasPlayingRef.current;
    wasPlayingRef.current = playing;

    if (duration <= 0 || position <= 0) return;

    if (position < duration - END_OF_TRACK_EPSILON_SEC) {
      sawMidTrackRef.current = true;
      return;
    }

    // Right after a swap the engine still reports the finished track's clock.
    // Requiring the new source to have been seen mid-track first is what stops
    // that stale reading from ending a session that has not begun.
    if (!sawMidTrackRef.current) return;

    // `playing` can flip false in the same tick the track ends, so a track that
    // was running a moment ago still counts — but one the user parked near the
    // end while paused does not.
    if (!playing && !wasPlaying) return;

    advanceQueue();
  }, [status.currentTime, status.duration, status.playing, advanceQueue]);

  const value = useMemo<PlayerEngine>(
    () => ({ load, play, pause, seek }),
    [load, play, pause, seek],
  );

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

/** Internal — the imperative engine handle. Screens use `usePlayer` instead. */
export function useRuqyahEngine(): PlayerEngine {
  const ctx = useContext(PlayerContext);
  if (!ctx) {
    throw new Error('useRuqyahEngine must be used within a PlayerProvider');
  }
  return ctx;
}
