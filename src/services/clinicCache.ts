import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Category, Subcategory } from '@/types/category';
import type { Disease } from '@/types/disease';
import type { Recording } from '@/types/recording';
import type { Paginated } from '@/types/api';

/** AsyncStorage key namespace for clinic/hospital data — v1 prefix allows future cache-busting. */
export const CLINIC_KEYS = {
  categories: 'clinic:v1:categories',
  category: (slug: string) => `clinic:v1:category:${slug}`,
  subcategory: (slug: string) => `clinic:v1:subcategory:${slug}`,
  disease: (slug: string) => `clinic:v1:disease:${slug}`,
  recordings: (diseaseId: number) => `clinic:v1:recordings:${diseaseId}`,
  diseases: 'clinic:v1:diseases',
  generalRuqyah: 'clinic:v1:generalRuqyah',
} as const;

async function cacheSet<T>(key: string, data: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch {
    // Write failure is non-fatal — app continues without caching
  }
}

async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export const clinicCache = {
  saveCategories: (data: Category[]) => cacheSet(CLINIC_KEYS.categories, data),
  getCategories: () => cacheGet<Category[]>(CLINIC_KEYS.categories),

  saveCategory: (slug: string, data: Category) => cacheSet(CLINIC_KEYS.category(slug), data),
  getCategory: (slug: string) => cacheGet<Category>(CLINIC_KEYS.category(slug)),

  saveSubcategory: (slug: string, data: Subcategory) => cacheSet(CLINIC_KEYS.subcategory(slug), data),
  getSubcategory: (slug: string) => cacheGet<Subcategory>(CLINIC_KEYS.subcategory(slug)),

  saveDisease: (slug: string, data: Disease) => cacheSet(CLINIC_KEYS.disease(slug), data),
  getDisease: (slug: string) => cacheGet<Disease>(CLINIC_KEYS.disease(slug)),

  saveRecordings: (diseaseId: number, data: Recording[]) => cacheSet(CLINIC_KEYS.recordings(diseaseId), data),
  getRecordings: (diseaseId: number) => cacheGet<Recording[]>(CLINIC_KEYS.recordings(diseaseId)),

  saveDiseases: (data: Paginated<Disease>) => cacheSet(CLINIC_KEYS.diseases, data),
  getDiseases: () => cacheGet<Paginated<Disease>>(CLINIC_KEYS.diseases),

  saveGeneralRuqyah: (data: Recording[]) => cacheSet(CLINIC_KEYS.generalRuqyah, data),
  getGeneralRuqyah: () => cacheGet<Recording[]>(CLINIC_KEYS.generalRuqyah),
};
