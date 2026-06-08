import type { Translatable } from '@/types/translatable';

export interface Segment {
  start: number;
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
  /** Set for disease-linked recordings; null for direct category recordings. */
  disease_id: number | null;
  /** Set for direct category recordings; null for disease-linked recordings. */
  category_id: number | null;
  session_number: number;
  description: Translatable | null;
  segments: Segment[] | null;
  audio_url: string | null;
  duration_seconds: number | null;
  is_general: boolean;
  is_free: boolean;
  requires_subscription: boolean;
  plays_count: number;
}
