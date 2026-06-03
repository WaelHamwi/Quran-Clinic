import type { Translatable } from '@/types/translatable';

/** Whom an item fortifies: oneself, others, or both. */
export type TahsinatApplicability = 'self' | 'others' | 'both';

export interface TahsinatCategory {
  id: number;
  name: Translatable;
  slug: string;
  display_order: number;
  items_count?: number;
  /** Nested sub-sections, each carrying its own items + randomization flag. */
  sections?: TahsinatSection[];
  /** Items that belong directly to the category (no section). */
  items?: TahsinatItem[];
}

export interface TahsinatSection {
  id: number;
  category_id: number;
  name: Translatable;
  /** When true, this section's items are shuffled every time it is viewed. */
  order_randomly: boolean;
  display_order: number;
  items?: TahsinatItem[];
}

export interface TahsinatItem {
  id: number;
  category_id: number;
  section_id: number | null;
  label: Translatable;
  text: Translatable;
  image_url: string | null;
  repetitions: number;
  hint: Translatable;
  applicability: TahsinatApplicability;
  display_order: number;
}
