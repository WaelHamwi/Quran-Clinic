import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from '@/hooks/common/useDebounce';
import { ruqyahService } from '@/services/content/ruqyahService';
import { cacheKeys } from '@/utils/cacheKeys';
import { categoryRoute, subcategoryRoute } from '@/utils/hospital';
import type { Category } from '@/types/category';
import type { Translatable } from '@/types/translatable';

const MIN_QUERY = 2;
const FIVE_MIN = 1000 * 60 * 5;

export type HospitalResultKind = 'category' | 'subcategory' | 'disease';

export interface HospitalSearchResult {
  key: string;
  kind: HospitalResultKind;
  name: Translatable;
  icon?: string | null;
  route: string;
}

/**
 * Whole-hospital search for the home screen. The home page only shows
 * categories, so a disease-only search felt "inaccurate" — typing a category
 * or subcategory name (e.g. "العظام") returned nothing. This searches all three
 * levels at once: categories + subcategories are filtered locally from the
 * already-loaded grid data, diseases come from the (debounced) API endpoint.
 * Matches on either language so an Arabic or English query both work.
 */
export function useHospitalSearch(categories: Category[]) {
  const [query, setQuery] = useState('');
  const debounced = useDebounce(query, 300).trim();
  const enabled = debounced.length >= MIN_QUERY;

  const diseaseQuery = useQuery({
    queryKey: cacheKeys.diseaseSearch(debounced),
    queryFn: () => ruqyahService.searchDiseasesOfflineFirst(debounced),
    enabled,
    staleTime: FIVE_MIN,
  });

  const results = useMemo<HospitalSearchResult[]>(() => {
    if (!enabled) return [];
    const q = debounced.toLowerCase();
    const matches = (t: Translatable) =>
      (t.ar ?? '').toLowerCase().includes(q) || (t.en ?? '').toLowerCase().includes(q);

    const cats: HospitalSearchResult[] = [];
    const subs: HospitalSearchResult[] = [];
    for (const c of categories) {
      if (matches(c.name)) {
        cats.push({ key: `c-${c.id}`, kind: 'category', name: c.name, icon: c.icon, route: categoryRoute(c) });
      }
      for (const s of c.subcategories ?? []) {
        if (matches(s.name)) {
          subs.push({ key: `s-${s.id}`, kind: 'subcategory', name: s.name, icon: s.icon, route: subcategoryRoute(s) });
        }
      }
    }

    const diseases: HospitalSearchResult[] = (diseaseQuery.data ?? []).map((d) => ({
      key: `d-${d.id}`,
      kind: 'disease',
      name: d.name,
      icon: d.icon,
      route: `/hospital/disease/${d.slug}`,
    }));

    // Most specific first: diseases, then subcategories, then categories.
    return [...diseases, ...subs, ...cats];
  }, [enabled, debounced, categories, diseaseQuery.data]);

  return {
    query,
    setQuery,
    results,
    // Only block on a spinner while nothing is showing yet; local matches render instantly.
    isSearching: enabled && diseaseQuery.isFetching && results.length === 0,
    hasQuery: enabled,
  };
}
