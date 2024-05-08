import { useMemo } from 'react';
import { TableData } from '..';
import { useDebounceValue } from 'usehooks-ts';

export const SEARCH_FIELDS = [
  'name',
  'abstract',
  'dataType',
  'conditionsOfAccess',
  'type',
] as (keyof TableData)[];

// Custom hook example (placeholder, implement according to your needs)
function useFilteredData(
  data: TableData[],
  searchTerm: string,
  filters: {} | Record<keyof TableData, string[]>,
) {
  // Debounce the search term to reduce the number of times filtering is applied as the user types
  const [debouncedSearchTerm] = useDebounceValue(searchTerm, 250);

  const filteredData = useMemo(() => {
    return data.filter(item => {
      // Apply search term filter
      const searchTermMatch = SEARCH_FIELDS.some(field => {
        const value = item[field];
        if (Array.isArray(value)) {
          return value.some(v =>
            v.toLowerCase().includes(debouncedSearchTerm.toLowerCase()),
          );
        }
        return value
          ?.toString()
          .toLowerCase()
          .includes(debouncedSearchTerm.toLowerCase());
      });

      // Apply additional filters
      const filtersMatch = Object.entries(filters).every(([key, values]) => {
        if (!values.length) return true; // No filter selected for this category
        const itemValue = item[key as keyof TableData];
        if (Array.isArray(itemValue)) {
          return itemValue.some(iv => values.includes(iv));
        }
        return itemValue ? values.includes(itemValue) : false;
      });

      return searchTermMatch && filtersMatch;
    });
  }, [data, debouncedSearchTerm, filters]);

  return filteredData;
}

export default useFilteredData;
