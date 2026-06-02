import { apiGet, apiGetPaginated, apiPost } from '@/services/apiClient';
import type { Category, Subcategory } from '@/types/category';
import type { Disease } from '@/types/disease';
import type { Recording } from '@/types/recording';
import type { Paginated } from '@/types/api';

/** Hospital / Ruqyah API. Categories → Subcategories → Diseases → Recordings. */
export const ruqyahService = {
  getCategories: (): Promise<Category[]> => apiGet<Category[]>('/categories'),

  /** One category with its subcategories. */
  getCategory: (slug: string): Promise<Category> => apiGet<Category>(`/categories/${slug}`),

  /** One subcategory with its diseases. */
  getSubcategory: (slug: string): Promise<Subcategory> =>
    apiGet<Subcategory>(`/subcategories/${slug}`),

  getDiseases: (perPage = 50): Promise<Paginated<Disease>> =>
    apiGetPaginated<Disease>('/diseases', { params: { per_page: perPage } }),

  searchDiseases: (query: string): Promise<Disease[]> =>
    apiGet<Disease[]>('/diseases/search', { params: { q: query } }),

  getDisease: (slug: string): Promise<Disease> => apiGet<Disease>(`/diseases/${slug}`),

  /** Recordings flagged `is_general` — power the General Ruqyah playlist. */
  getGeneralRuqyah: (): Promise<Recording[]> => apiGet<Recording[]>('/general-ruqyah'),

  getRecordings: (diseaseId: number): Promise<Recording[]> =>
    apiGet<Recording[]>('/recordings', { params: { disease_id: diseaseId } }),

  /** Fire-and-forget analytics ping. */
  incrementPlayCount: (recordingId: number): Promise<{ plays_count: number }> =>
    apiPost<{ plays_count: number }>(`/recordings/${recordingId}/play`),
};
