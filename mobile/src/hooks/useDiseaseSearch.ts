import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from '@/hooks/useDebounce';
import { ruqyahService } from '@/services/ruqyahService';
import { cacheKeys } from '@/utils/cacheKeys';

const MIN_QUERY = 2;
const FIVE_MIN = 1000 * 60 * 5;

/** Debounced (300 ms), synonym-tolerant disease search — Arabic + English. */
export function useDiseaseSearch() {
  const [query, setQuery] = useState('');
  const debounced = useDebounce(query, 300).trim();
  const enabled = debounced.length >= MIN_QUERY;

  const search = useQuery({
    queryKey: cacheKeys.diseaseSearch(debounced),
    queryFn: () => ruqyahService.searchDiseases(debounced),
    enabled,
    staleTime: FIVE_MIN,
  });

  return {
    query,
    setQuery,
    results: search.data ?? [],
    isSearching: enabled && search.isFetching,
    hasQuery: enabled,
    error: search.error,
  };
}
