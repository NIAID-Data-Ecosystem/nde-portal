import { useMemo } from 'react';
import { useDebounceValue } from 'usehooks-ts';
import { RepositoryMatcherRow } from './useRepositoryMatcherData';

/**
 * Filters rows by a free-text search term against the prebuilt `_search`
 * blob on each row (see useRepositoryMatcherData). Every column contributes
 * to that blob regardless of whether it's currently displayed — toggling
 * column visibility is a render concern, not a data-presence one.
 */
export function useSearchedData(
  data: RepositoryMatcherRow[] | undefined,
  searchTerm: string,
  debounceMs: number = 250,
) {
  const [debouncedSearchTerm] = useDebounceValue(searchTerm, debounceMs);

  return useMemo(() => {
    if (!data?.length) return data ?? [];
    const term = debouncedSearchTerm.trim().toLowerCase();
    if (!term) return data;
    return data.filter(row => row._search.includes(term));
  }, [data, debouncedSearchTerm]);
}
