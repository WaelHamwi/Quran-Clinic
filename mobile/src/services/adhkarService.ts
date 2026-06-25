import { apiGet } from '@/services/apiClient';
import type { AdhkarCategory, AdhkarItem } from '@/types/adhkar';

/** Adhkar API. Categories carry the time-of-day grouping; items have repeats + daleel. */
export const adhkarService = {
  getCategories: (): Promise<AdhkarCategory[]> =>
    apiGet<AdhkarCategory[]>('/adhkar/categories'),

  getItems: (slug: string): Promise<AdhkarCategory> =>
    apiGet<AdhkarCategory>(`/adhkar/categories/${slug}/items`),

  getToday: (): Promise<AdhkarCategory[]> => apiGet<AdhkarCategory[]>('/adhkar/today'),

  getWaking: (): Promise<AdhkarItem[]> => apiGet<AdhkarItem[]>('/adhkar/waking'),
};
