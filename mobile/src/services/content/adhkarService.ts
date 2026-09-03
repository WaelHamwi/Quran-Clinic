import { apiGet } from '@/services/common/apiClient';
import type { AdhkarCategory, AdhkarItem } from '@/types/adhkar';

/** Adhkar API. Categories carry the time-of-day grouping; items have repeats + daleel. */
export const adhkarService = {
  getCategories: (): Promise<AdhkarCategory[]> =>
    apiGet<AdhkarCategory[]>('/adhkar/categories'),

  // Categories added from the CMS can carry an Arabic slug with spaces, which
  // must be percent-encoded or the request URL is malformed.
  getItems: (slug: string): Promise<AdhkarCategory> =>
    apiGet<AdhkarCategory>(`/adhkar/categories/${encodeURIComponent(slug)}/items`),

  getToday: (): Promise<AdhkarCategory[]> => apiGet<AdhkarCategory[]>('/adhkar/today'),

  getWaking: (): Promise<AdhkarItem[]> => apiGet<AdhkarItem[]>('/adhkar/waking'),
};
