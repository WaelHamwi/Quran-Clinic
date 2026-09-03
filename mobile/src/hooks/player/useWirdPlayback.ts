import { useCallback, useEffect, useMemo } from 'react';
import { router } from 'expo-router';
import { usePlayer } from '@/hooks/player/usePlayer';
import { useGeneralRuqyah } from '@/hooks/player/useGeneralRuqyah';
import { useDownloadManager } from '@/hooks/common/useDownloadManager';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  selectPlayerDiseaseId,
  setPlaybackOrigin,
  setQueue,
  setQueueIndex,
} from '@/store/slices/playerSlice';
import { enqueue } from '@/store/slices/offlineQueueSlice';
import { ruqyahService } from '@/services/content/ruqyahService';
import { groupByType, occurrenceKeyOf, recordingTypeOf } from '@/utils/recordings';
import type { AccessibleRecording } from '@/types/recording';

export function useWirdPlayback(
  recordings: AccessibleRecording[],
  contextId: number,
  /** Route back to this screen, recorded so the mini player can return here. */
  originRoute?: string,
) {
  const dispatch = useAppDispatch();
  const player = usePlayer();
  const { stop: playerStop } = player;
  const { isQueueActive } = useGeneralRuqyah();
  const playerDiseaseId = useAppSelector(selectPlayerDiseaseId);
  const { getLocalUri } = useDownloadManager();

  // This screen owns the LIVE player only when playback was started here (the
  // context matches) AND no foreign queue (general ruqyah / favorites) owns the
  // engine. Our own `wird` queue is not foreign — see useGeneralRuqyah.
  const isOwnPlayer = playerDiseaseId === contextId;
  const ownsLivePlayback = isOwnPlayer && !isQueueActive;

  // Tabs are per type, not per recording: several summarized recordings are one
  // ruqyah to the reader, played back-to-back behind a single tab.
  const groups = useMemo(() => groupByType(recordings), [recordings]);

  // Matched on the occurrence, not the recording: a wird that returns to its
  // opening passage holds that recording at more than one position, and an id
  // match would always resolve to the first of them — the reader would
  // highlight the wrong block and next/previous would walk from the wrong spot.
  const playingKey = player.currentRecording
    ? occurrenceKeyOf(player.currentRecording)
    : undefined;

  const playingRecording = useMemo(
    () => recordings.find((r) => occurrenceKeyOf(r) === playingKey),
    [recordings, playingKey],
  );

  const displayIndex = useMemo(() => {
    if (!playingRecording) return 0;
    const idx = groups.findIndex((g) => g.type === recordingTypeOf(playingRecording));
    return idx >= 0 ? idx : 0;
  }, [groups, playingRecording]);

  const activeGroup = groups[displayIndex];

  // A session with no audio is still readable, so it stays in the tab and in
  // the queue — but nothing can load it, so every move through the group has to
  // step over it rather than stop on it.
  const isPlayable = useCallback(
    (recording: AccessibleRecording) => !!(getLocalUri(recording.id) ?? recording.audio_url),
    [getLocalUri],
  );

  // The reader follows the recording actually playing, so its text changes as
  // the group advances; before anything plays, the group's first recording.
  const displayed = playingRecording ?? activeGroup?.recordings[0];
  const viewedLocked = !!displayed && !displayed.accessible;

  const positionInGroup = useMemo(() => {
    if (!activeGroup || !playingRecording) return -1;
    return activeGroup.recordings.findIndex((r) => occurrenceKeyOf(r) === playingKey);
  }, [activeGroup, playingRecording, playingKey]);

  const startGroup = useCallback(
    (groupRecordings: AccessibleRecording[], startAt: number) => {
      let index = startAt;
      while (index < groupRecordings.length && !isPlayable(groupRecordings[index])) index++;

      const recording = groupRecordings[index];
      if (!recording) return;

      // The queue is what PlayerContext auto-advances on `didJustFinish`, so
      // setting it is what makes the group play as one continuous ruqyah. The
      // whole group is queued — including the sessions before `index` — so the
      // footer can still step back over them.
      dispatch(setQueue({ recordings: groupRecordings, index, kind: 'wird', contextId }));
      dispatch(setPlaybackOrigin(originRoute ?? null));
      player.loadQueued(recording, contextId, getLocalUri(recording.id));
      ruqyahService.incrementPlayCount(recording.id).catch(() => {
        dispatch(enqueue({ type: 'playCount', payload: { recordingId: recording.id } }));
      });
    },
    [dispatch, player, getLocalUri, contextId, isPlayable, originRoute],
  );

  const handlePlay = useCallback(
    (recording: AccessibleRecording) => {
      if (!recording.accessible) {
        router.push('/hospital/disease/subscription');
        return;
      }
      // Only pause/resume when this screen already owns the live playback AND
      // the tap landed on the very session that is playing — tapping a later
      // repeat of the same recording is a request to jump there, not to pause.
      if (occurrenceKeyOf(recording) === playingKey && ownsLivePlayback) {
        player.togglePlay();
        return;
      }

      const group = groups.find((g) => g.type === recordingTypeOf(recording));
      if (!group) return;

      const startAt = Math.max(
        0,
        group.recordings.findIndex((r) => occurrenceKeyOf(r) === occurrenceKeyOf(recording)),
      );
      startGroup(group.recordings, startAt);
    },
    [player, playingKey, ownsLivePlayback, groups, startGroup],
  );

  const goToWird = useCallback(
    (idx: number) => {
      const first = groups[idx]?.recordings[0];
      if (first) handlePlay(first);
    },
    [groups, handlePlay],
  );

  // Previous/next step WITHIN the playing group, so the footer walks the
  // sessions of one ruqyah rather than jumping between the free and paid ones.
  const nextPlayableIndex = useCallback(
    (delta: number) => {
      if (!activeGroup || positionInGroup < 0) return -1;
      for (
        let i = positionInGroup + delta;
        i >= 0 && i < activeGroup.recordings.length;
        i += delta
      ) {
        if (isPlayable(activeGroup.recordings[i])) return i;
      }
      return -1;
    },
    [activeGroup, positionInGroup, isPlayable],
  );

  const hasPrevious = nextPlayableIndex(-1) >= 0;
  const hasNext = nextPlayableIndex(1) >= 0;

  const step = useCallback(
    (delta: number) => {
      const target = nextPlayableIndex(delta);
      const recording = target >= 0 ? activeGroup?.recordings[target] : undefined;
      if (!recording) return;

      // Keep the queue cursor in step, or auto-advance would resume from the
      // track the user just skipped past.
      dispatch(setQueueIndex(target));
      player.loadQueued(recording, contextId, getLocalUri(recording.id));
    },
    [activeGroup, nextPlayableIndex, dispatch, player, contextId, getLocalUri],
  );

  const handlePrevious = useCallback(() => step(-1), [step]);
  const handleNext = useCallback(() => step(1), [step]);

  // When the admin overrides the free session, the cached data refreshes every 30 s.
  // If the currently-playing recording just became locked, switch immediately to the
  // free group (groups[0] — summarized first).
  useEffect(() => {
    if (isQueueActive || recordings.length === 0 || !playingRecording) return;
    if (playingRecording.accessible) return;

    const freeRecording = groups[0]?.recordings[0];
    if (freeRecording?.accessible) handlePlay(freeRecording);
    else playerStop();
  }, [recordings, groups, playingRecording, handlePlay, playerStop, isQueueActive]);

  return {
    player,
    isQueueActive,
    groups,
    displayIndex,
    /** Every session behind the open tab — the reader stacks all of their texts. */
    sessions: activeGroup?.recordings ?? [],
    displayed,
    viewedLocked,
    handlePlay,
    goToWird,
    handlePrevious,
    handleNext,
    hasPrevious,
    hasNext,
    isOwnPlayer,
  };
}
