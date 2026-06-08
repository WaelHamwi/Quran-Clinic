import type { Translatable } from '@/types/translatable';
import type { Category, Subcategory } from '@/types/category';
import type { Recording } from '@/types/recording';

export interface Disease {
  id: number;
  subcategory_id: number | null;
  category_id: number | null;
  name: Translatable;
  slug: string;
  icon?: string | null;
  description: Translatable;
  display_order: number;
  recordings_count?: number;
  subcategory?: Subcategory;
  category?: Category;
  recordings?: Recording[];
  aliases?: Translatable[];
}
