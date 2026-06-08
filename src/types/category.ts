import type { Translatable } from '@/types/translatable';
import type { Disease } from '@/types/disease';
import type { Recording } from '@/types/recording';

export interface Category {
  id: number;
  name: Translatable;
  slug: string;
  icon: string | null;
  /**
   * `'standard'`      — Category → Subcategory → Disease flow.
   * `'disease_direct'`— Diseases attach directly (no subcategory layer).
   * `'direct'`        — Recordings attach directly (no diseases or subcategories).
   */
  type: 'standard' | 'direct' | 'disease_direct';
  description?: Translatable | null;
  color?: string | null;
  display_order: number;
  subcategories?: Subcategory[];
  /** Populated only for `type === 'disease_direct'` categories. */
  direct_diseases?: Disease[];
  /** Populated only for `type === 'direct'` categories. */
  recordings?: Recording[];
}

export interface Subcategory {
  id: number;
  category_id: number;
  name: Translatable;
  slug: string;
  icon?: string | null;
  display_order: number;
  category?: Category;
  diseases?: Disease[];
  diseases_count?: number;
  /** Recordings attached directly to this subcategory (no diseases). */
  recordings?: Recording[];
  recordings_count?: number;
}
