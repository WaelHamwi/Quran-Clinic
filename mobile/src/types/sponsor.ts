import type { Translatable } from '@/types/translatable';

export interface Sponsor {
  id: number;
  name: Translatable;
  logo_url: string | null;
  website_url: string | null;
  /** When true, the sponsor shows to every user regardless of country. */
  target_all_countries: boolean;
  /** Country names this sponsor targets (used only when not all-countries). */
  target_countries: string[];
  is_featured: boolean;
  display_on_launch: boolean;
  display_order: number;
}

export interface SponsorScreenConfig {
  is_enabled: boolean;
  display_duration_seconds: number;
  sponsor: Sponsor | null;
}
