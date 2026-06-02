import type { Translatable } from './translatable';

export interface Verse {
  id: number;
  surah_id: number;
  verse_number: number;
  text: Translatable;
}
