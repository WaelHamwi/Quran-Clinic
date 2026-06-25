import { apiGet } from '@/services/apiClient';
import type { TahsinatCategory } from '@/types/tahsinat';

/** Tahsinat (fortification) API. */
export const tahsinatService = {
  getCategories: (): Promise<TahsinatCategory[]> =>
    apiGet<TahsinatCategory[]>('/tahsinat/categories'),

  getItems: (slug: string): Promise<TahsinatCategory> =>
    apiGet<TahsinatCategory>(`/tahsinat/categories/${slug}/items`),
};
