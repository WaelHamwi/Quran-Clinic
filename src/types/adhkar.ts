import type { Translatable } from '@/types/translatable';

export type AdhkarTime = 'morning' | 'evening' | 'sleep' | 'waking';

export interface AdhkarCategory {
  id: number;
  name: Translatable;
  slug: string;
  /** Absolute URL to the uploaded icon (SVG/PNG), or null. */
  icon?: string | null;
  day_number: number;
  display_order: number;
  items_count?: number;
  /** Nested sub-sections, each carrying its own items + randomization flag. */
  sections?: AdhkarSection[];
  /** Items that belong directly to the category (no section). */
  items?: AdhkarItem[];
}

export interface AdhkarSection {
  id: number;
  category_id: number;
  name: Translatable;
  /** When true, this section's items are shuffled every time it is viewed. */
  order_randomly: boolean;
  display_order: number;
  items?: AdhkarItem[];
}

export interface AdhkarItem {
  id: number;
  category_id: number;
  section_id: number | null;
  text: Translatable;
  /** Absolute URL to an uploaded image, or null. An item may be text, image, or both. */
  image?: string | null;
  repetitions: number;
  hint: Translatable;
  daleel: Translatable;
  display_order: number;
}
