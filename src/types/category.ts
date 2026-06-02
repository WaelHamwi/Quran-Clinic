import type { Translatable } from '@/types/translatable';
import type { Disease } from '@/types/disease';

export interface Category {
  id: number;
  name: Translatable;
  slug: string;
  icon: string | null;
  /** Optional short blurb shown under the title on the homepage list.
   *  Backend may or may not populate it; rendering is guarded. */
  description?: Translatable | null;
  /** Optional hex (e.g. "#8B5CF6") for the icon bubble background.
   *  When absent the card falls back to a deterministic per-id colour. */
  color?: string | null;
  display_order: number;
  subcategories?: Subcategory[];
}

export interface Subcategory {
  id: number;
  category_id: number;
  name: Translatable;
  slug: string;
  display_order: number;
  category?: Category;
  diseases?: Disease[];
  diseases_count?: number;
}
