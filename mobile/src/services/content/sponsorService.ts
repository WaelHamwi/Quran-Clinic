import { apiGet } from '@/services/common/apiClient';
import type { Sponsor, SponsorScreenConfig } from '@/types/sponsor';

export const sponsorService = {
  getSponsors: (): Promise<Sponsor[]> => apiGet<Sponsor[]>('/sponsors'),

  /** Launch sponsor-screen config: enabled flag, duration, the sponsor to show. */
  getSponsorScreen: (): Promise<SponsorScreenConfig> =>
    apiGet<SponsorScreenConfig>('/sponsor-screen'),
};
