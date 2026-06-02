import type { Translatable } from '@/types/translatable';

/**
 * A ruqyah recording attached to a Disease (1st / 2nd / 3rd session).
 * Distinct from `Recitation` (Quran/Mushaf audio).
 */
export interface Recording {
  id: number;
  disease_id: number;
  session_number: number;
  title: Translatable;
  audio_url: string | null;
  duration_seconds: number | null;
  is_general: boolean;
  is_free: boolean;
  requires_subscription: boolean;
  plays_count: number;
}
