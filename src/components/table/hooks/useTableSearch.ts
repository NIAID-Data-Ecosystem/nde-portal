import { useMemo } from 'react';
import { useDebounceValue } from 'usehooks-ts';

/**
 * Filters rows by a free-text search term against each row's prebuilt,
 * lowercased `_search` text (built once when the rows are created, from every
 * column, hidden or not). Debounced so typing doesn't re-filter per keystroke.
 *
 * Moved from the repository matcher (`useSearchedData`), which the saved page
 * also used.
 */
export function useTableSearch<T extends { _search: string }>(
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
