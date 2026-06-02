import type { Translatable } from '@/types/translatable';

export interface Sponsor {
  id: number;
  name: Translatable;
  logo_url: string | null;
  website_url: string | null;
  is_featured: boolean;
  display_on_launch: boolean;
  display_order: number;
}

export interface SponsorScreenConfig {
  is_enabled: boolean;
  display_duration_seconds: number;
  sponsor: Sponsor | null;
}
