import { useMemo } from 'react';
import { useDebounceValue } from 'usehooks-ts';
import {
  REPOSITORY_MATCHER_COLUMNS,
  RepositoryMatcherColumn,
} from 'src/views/repository-matcher/table-config';
import { RepositoryMatcherRow } from './useRepositoryMatcherData';

/**
 * Default fallback for columns that don't define `getSearchValue`. Handles
 * primitive display values so most columns don't have to opt in explicitly.
 * Columns whose display value is a richer shape must define `getSearchValue`
 * themselves.
 */
const defaultSearchValue = (value: unknown): string | string[] | null => {
  if (value == null) return null;
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  if (
    Array.isArray(value) &&
    value.every(v => typeof v === 'string' || typeof v === 'number')
  ) {
    return value.map(String);
  }
  return null;
};

const matches = (haystack: string | string[] | null, needle: string) => {
  if (haystack == null) return false;
  const lower = needle.toLowerCase();
  if (Array.isArray(haystack)) {
    return haystack.some(s => s.toLowerCase().includes(lower));
  }
  return haystack.toLowerCase().includes(lower);
};

/**
 * Filters rows by a free-text search term. Every column in
 * REPOSITORY_MATCHER_COLUMNS participates regardless of whether it's
 * currently displayed — toggling column visibility is a render concern, not
 * a data-presence one, so hidden columns can still produce matches.
 */
export function useSearchedData(
  data: RepositoryMatcherRow[] | undefined,
  searchTerm: string,
  debounceMs: number = 250,
) {
  const [debouncedSearchTerm] = useDebounceValue(searchTerm, debounceMs);

  return useMemo(() => {
    if (!data?.length) return data ?? [];
    const term = debouncedSearchTerm.trim();
    if (!term) return data;

    return data.filter(row =>
      REPOSITORY_MATCHER_COLUMNS.some((col: RepositoryMatcherColumn<any>) => {
        const displayValue = row[col.id];
        const searchValue = col.getSearchValue
          ? col.getSearchValue(displayValue)
          : defaultSearchValue(displayValue);
        return matches(searchValue, term);
      }),
    );
  }, [data, debouncedSearchTerm]);
}
