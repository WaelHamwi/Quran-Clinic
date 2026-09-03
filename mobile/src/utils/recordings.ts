import type { Recording, RecordingType } from '@/types/recording';

/**
 * Pre-migration cached recordings have no `type`; derive it from the paid flag
 * (detailed is the paid recording, summarized the free one).
 */
export function recordingTypeOf(
  recording: Pick<Recording, 'type' | 'requires_subscription'>,
): RecordingType {
  return recording.type ?? (recording.requires_subscription ? 'detailed' : 'summarized');
}

/**
 * Identity of a session within a wird. A ruqyah may return to the same
 * recording at its beginning, middle and end, so `id` no longer picks out one
 * entry in a list — the attachment does. Pre-repeat cached payloads carry no
 * attachment, and there the id is still unique.
 */
export function occurrenceKeyOf(
  recording: Pick<Recording, 'id' | 'attachment_id'>,
): string {
  return recording.attachment_id != null ? `a${recording.attachment_id}` : `r${recording.id}`;
}

export function sortSummarizedFirst<T extends Pick<Recording, 'type' | 'requires_subscription' | 'session_number'>>(
  recordings: T[],
): T[] {
  return [...recordings].sort((a, b) => {
    const aType = recordingTypeOf(a);
    const bType = recordingTypeOf(b);
    if (aType !== bType) return aType === 'summarized' ? -1 : 1;
    return a.session_number - b.session_number;
  });
}

export type RecordingGroup<T> = {
  type: RecordingType;
  /** That type's recordings, in session order — played back-to-back as one ruqyah. */
  recordings: T[];
};

/**
 * An item may carry several summarized recordings, each with its own text — and
 * the same one more than once — but they are one الرقية المختصرة to the reader.
 * Grouping by type is what lets the screen show a single tab per type and play
 * its recordings back-to-back, so the group count — never the recording count —
 * drives the tabs.
 */
export function groupByType<
  T extends Pick<Recording, 'type' | 'requires_subscription' | 'session_number'>,
>(recordings: T[]): RecordingGroup<T>[] {
  const groups: RecordingGroup<T>[] = [];

  for (const recording of sortSummarizedFirst(recordings)) {
    const type = recordingTypeOf(recording);
    const open = groups[groups.length - 1];

    // sortSummarizedFirst keeps each type contiguous, so appending to the open
    // group is enough to collect them.
    if (open && open.type === type) open.recordings.push(recording);
    else groups.push({ type, recordings: [recording] });
  }

  return groups;
}
