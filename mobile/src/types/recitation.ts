import type { Reciter } from '@/types/reciter';
import type { Surah } from '@/types/surah';

export interface Recitation {
  id: number;
  reciter_id: number;
  surah_id: number;
  audio_path: string;
  audio_url: string;
  duration_seconds: number | null;
  reciter?: Reciter;
  surah?: Surah;
}
