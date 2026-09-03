import { apiGet, apiGetPaginated, apiPost } from '@/services/common/apiClient';
import { cachedFetch, contentCache } from '@/services/common/contentCache';
import type { Category, Subcategory } from '@/types/category';
import type { Disease } from '@/types/disease';
import type { Recording } from '@/types/recording';
import type { Paginated } from '@/types/api';

const DISEASES_CACHE_KEY = 'clinic_diseases';

function matchesQuery(disease: Disease, q: string): boolean {
  return (disease.name.ar ?? '').toLowerCase().includes(q)
    || (disease.name.en ?? '').toLowerCase().includes(q)
    || (disease.aliases ?? []).some(
      (a) => (a.ar ?? '').toLowerCase().includes(q) || (a.en ?? '').toLowerCase().includes(q),
    );
}

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

  /**
   * Offline-first variant used by the search hooks (FR-16.1). The server search is
   * synonym-aware and always preferred when reachable, and opportunistically warms
   * a flat-list cache in the background; on failure that cached list is filtered
   * client-side instead, so a cold offline session still returns something.
   */
  async searchDiseasesOfflineFirst(query: string): Promise<Disease[]> {
    try {
      const results = await apiGet<Disease[]>('/diseases/search', { params: { q: query } });
      void cachedFetch(DISEASES_CACHE_KEY, () => apiGetPaginated<Disease>('/diseases', { params: { per_page: 100 } }));
      return results;
    } catch (error) {
      const cached = await contentCache.getItem<Paginated<Disease>>(DISEASES_CACHE_KEY);
      if (!cached?.items) throw error;
      const q = query.trim().toLowerCase();
      return cached.items.filter((d) => matchesQuery(d, q));
    }
  },

  getDisease: (slug: string): Promise<Disease> => apiGet<Disease>(`/diseases/${slug}`),

  /** Recordings flagged `is_general` — power the General Ruqyah playlist. */
  getGeneralRuqyah: (): Promise<Recording[]> => apiGet<Recording[]>('/general-ruqyah'),

  getRecordings: (diseaseId: number): Promise<Recording[]> =>
    apiGet<Recording[]>('/recordings', { params: { disease_id: diseaseId } }),

  /** Fire-and-forget analytics ping. */
  incrementPlayCount: (recordingId: number): Promise<{ plays_count: number }> =>
    apiPost<{ plays_count: number }>(`/recordings/${recordingId}/play`),
};
