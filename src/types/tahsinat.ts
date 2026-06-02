import type { Translatable } from '@/types/translatable';

export interface TahsinatCategory {
  id: number;
  name: Translatable;
  slug: string;
  is_self: boolean;
  is_for_others: boolean;
  random_order: boolean;
  display_order: number;
  items_count?: number;
  items?: TahsinatItem[];
}

export interface TahsinatItem {
  id: number;
  category_id: number;
  label: Translatable;
  text: Translatable;
  repetitions: number;
  hint: Translatable;
  display_order: number;
}
