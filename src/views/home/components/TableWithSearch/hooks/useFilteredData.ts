import { useMemo } from 'react';
import { TableData } from '..';
import { useDebounceValue } from 'usehooks-ts';

export const SEARCH_FIELDS = [
  'name',
  'abstract',
  'domain',
  'conditionsOfAccess',
  'types',
] as (keyof TableData)[];

// Custom hook example (placeholder, implement according to your needs)
function useFilteredData(
  data: TableData[],
  searchTerm: string,
  filters: { name: string; value: string; property: string }[],
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

      // Organize filters by property
      const propertyGroups = filters.reduce((acc, filter) => {
        if (!acc[filter.property]) {
          acc[filter.property] = [];
        }
        acc[filter.property].push(filter.value);
        return acc;
      }, {} as Record<string, string[]>);

      // Apply additional filters with "AND" between properties and "OR" within properties
      const filtersMatch = Object.entries(propertyGroups).every(
        ([key, values]) => {
          const itemValue = item[key as keyof TableData];
          if (!itemValue) return false;
          if (Array.isArray(itemValue)) {
            // "OR" logic within properties for array values
            return itemValue.some(iv => values.includes(iv.toString()));
          }
          // "OR" logic within properties for scalar values
          return values.includes(itemValue?.toString());
        },
      );

      return searchTermMatch && filtersMatch;
    });
  }, [data, debouncedSearchTerm, filters]);

  return filteredData;
}

export default useFilteredData;
