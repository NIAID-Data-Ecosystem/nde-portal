import { useMemo } from 'react';
import { useDebounceValue } from 'usehooks-ts';

/**
 * Filters rows by a free-text search term against the prebuilt `_search`
 * blob on each row (see useRepositoryMatcherData). Every column contributes
 * to that blob regardless of whether it's currently displayed — toggling
 * column visibility is a render concern, not a data-presence one.
 */
export function useSearchedData<T extends { _search: string }>(
  data: T[] | undefined,
  searchTerm: string,
  debounceMs: number = 150,
) {
  const [debouncedSearchTerm] = useDebounceValue(searchTerm, debounceMs);

  return useMemo(() => {
    if (!data?.length) return data ?? [];
    const term = debouncedSearchTerm.trim().toLowerCase();
    if (!term) return data;
    return data.filter(row => row._search.includes(term));
  }, [data, debouncedSearchTerm]);
}
