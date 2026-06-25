import type { Translatable } from './translatable';

export interface Reciter {
  id: number;
  name: Translatable;
  bio: Translatable | null;
  photo_path: string | null;
  is_active: boolean;
}
