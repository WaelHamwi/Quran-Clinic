import type { AccessibleRecording } from '@/types/recording';

/**
 * Which resource a wird screen is showing:
 *  - `disease`     → a single disease's wird (route `/hospital/disease/[slug]`)
 *  - `recordings`  → a category/subcategory that owns wird directly
 *                    (route `/hospital/recordings/[slug]`, `level` distinguishes the two)
 */
export type WirdSourceKind = 'disease' | 'recordings';
export type WirdSourceLevel = 'category' | 'subcategory';

/** The normalized shape `WirdScreen` consumes, regardless of which resource backs it. */
export interface WirdScreenSource {
  title: string;
  recordings: AccessibleRecording[];
  contextId: number;
  isLoading: boolean;
  error: unknown;
  /** The backing entity (disease / node) finished loading and exists. */
  hasEntity: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  favorited: boolean;
  onToggleFavorite: () => void;
  /** Whether this resource shows the advisory alert (disease only). */
  supportsAlert: boolean;
  /** Message for the empty reading card, when this resource shows one. */
  emptyText?: string;
}

/** The transport's clock, measured across every session of the playing wird. */
export interface QueueTimeline {
  /** Elapsed since the wird began, not since the current session began. */
  position: number;
  /** Every queued session's length added together. */
  duration: number;
  /**
   * False when the times cover the current session only — a lone session, or one
   * whose siblings have no `duration_seconds` to add up.
   */
  spansQueue: boolean;
  /** Seeks by whole-wird position, switching session when the target is in another. */
  seekTimeline: (millis: number) => void;
}
