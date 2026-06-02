import type { Translatable } from '@/types/translatable';
import type { Subcategory } from '@/types/category';
import type { Recording } from '@/types/recording';

export interface Disease {
  id: number;
  subcategory_id: number | null;
  name: Translatable;
  slug: string;
  description: Translatable;
  display_order: number;
  recordings_count?: number;
  subcategory?: Subcategory;
  recordings?: Recording[];
  aliases?: Translatable[];
}
