import type { Translatable } from './translatable';

export interface Surah {
  id: number;
  name: Translatable;
  transliteration: string;
  type: 'meccan' | 'medinan';
  total_verses: number;
}

export interface SurahWithVerses extends Surah {
  verses: import('./verse').Verse[];
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
