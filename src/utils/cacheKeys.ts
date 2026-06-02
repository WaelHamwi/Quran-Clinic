/**
 * Centralized React Query cache keys (RULE_23).
 * Every server-state hook must source its key from here.
 */
export const cacheKeys = {
  categories: ['categories'] as const,
  category: (slug: string) => ['category', slug] as const,
  subcategory: (slug: string) => ['subcategory', slug] as const,
  diseases: (subcategoryId?: number) => ['diseases', subcategoryId ?? 'all'] as const,
  diseaseSearch: (query: string) => ['diseaseSearch', query] as const,
  disease: (slug: string) => ['disease', slug] as const,
  recordings: (diseaseId: number) => ['recordings', diseaseId] as const,
  generalRuqyah: ['generalRuqyah'] as const,

  adhkarCategories: ['adhkarCategories'] as const,
  adhkarItems: (slug: string) => ['adhkarItems', slug] as const,
  adhkarToday: ['adhkarToday'] as const,
  adhkarWaking: ['adhkarWaking'] as const,

  tahsinatCategories: ['tahsinatCategories'] as const,
  tahsinatItems: (slug: string) => ['tahsinatItems', slug] as const,

  courses: ['courses'] as const,
  sponsors: ['sponsors'] as const,
  sponsorScreen: ['sponsorScreen'] as const,
  features: ['features'] as const,
  favorites: ['favorites'] as const,
} as const;
