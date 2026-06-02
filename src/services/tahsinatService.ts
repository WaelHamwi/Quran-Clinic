import { apiGet } from '@/services/apiClient';
import type { TahsinatCategory, TahsinatItem } from '@/types/tahsinat';

/** Tahsinat (fortification) API. */
export const tahsinatService = {
  getCategories: (): Promise<TahsinatCategory[]> =>
    apiGet<TahsinatCategory[]>('/tahsinat/categories'),

  getItems: (slug: string): Promise<TahsinatItem[]> =>
    apiGet<TahsinatItem[]>(`/tahsinat/categories/${slug}/items`),
};
