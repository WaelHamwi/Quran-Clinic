import type { Translatable } from '@/types/translatable';

/**
 * Each disease/subcategory/category owns two ordered sequences of recordings:
 * `summarized` (مختصرة — always free) and `detailed` (مطولة — subscribers).
 */
export type RecordingType = 'summarized' | 'detailed';

export interface Segment {
  /** Seconds from track start (authored in the Filament segments repeater). */
  start: number;
  /** Seconds from track start. */
  end: number;
  text_ar: string;
  text_en: string;
}

/**
 * A ruqyah recording attached to either a Disease (standard flow) or a
 * Category directly (when the category type is 'direct').
 * Distinct from `Recitation` (Quran/Mushaf audio).
 */
export interface Recording {
  id: number;
  /**
   * Identifies this OCCURRENCE rather than the recording. A ruqyah may play the
   * same recording at its beginning, middle and end, and those arrive as
   * several entries sharing one `id` — only this tells them apart. Absent in
   * pre-repeat cached payloads; resolve via `occurrenceKeyOf`.
   */
  attachment_id?: number | null;
  /** Set for disease-linked recordings; null for direct category recordings. */
  disease_id: number | null;
  /** Set for direct category recordings; null for disease-linked recordings. */
  category_id: number | null;
  /** Position in the owner's sequence, 1-based — the play order. */
  session_number: number;
  /** Absent only in pre-migration cached data — resolve via `recordingTypeOf`. */
  type?: RecordingType;
  description: Translatable | null;
  segments: Segment[] | null;
  audio_url: string | null;
  duration_seconds: number | null;
  is_general: boolean;
  is_free: boolean;
  requires_subscription: boolean;
  plays_count: number;
}

/** A `Recording` tagged with whether the current user may play it. */
export interface AccessibleRecording extends Recording {
  /** False when the recording is a paid session and the user lacks access. */
  accessible: boolean;
}
