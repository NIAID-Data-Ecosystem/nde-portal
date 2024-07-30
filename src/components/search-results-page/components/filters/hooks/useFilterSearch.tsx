import { useMemo, useState, useCallback } from 'react';
import { FilterTerm } from 'src/components/search-results-page/components/filters/types';

// Define the props interface for the useFilterSearch hook
interface useFilterSearchProps {
  terms: FilterTerm[];
  searchTerm: string;
  isLoading: boolean;
  selectedFilters: string[];
  disableToggle: boolean;
}

// Custom hook to handle the filtering and display logic for filter terms
export const useFilterSearch = ({
  terms,
  searchTerm,
  isLoading,
  selectedFilters,
  disableToggle = false,
}: useFilterSearchProps) => {
  const NUM_ITEMS_MIN = 5; // Minimum number of items to display when the list is minimized
  const [showFullList, setShowFullList] = useState(() =>
    disableToggle ? true : false,
  ); // State to manage whether the full list of terms is shown or not

  /**
   * Memoized computation of the filtered and sorted terms based on the search term.
   * - Filters the terms array to only include terms that match the search term (case-insensitive).
   * - Sorts the terms as per the specified criteria.
   * - If the terms array is empty and data is loading, returns a placeholder array for skeleton loading.
   * - If no terms and not loading, returns an empty array.
   * The useMemo hook ensures this computation is only re-run when terms, searchTerm, isLoading, or selectedFilters change.
   */
  const filteredTerms: FilterTerm[] = useMemo(() => {
    if (isLoading) {
      return Array(NUM_ITEMS_MIN).fill(''); // Placeholder for loading skeleton purposes
    }

    if (!terms?.length) {
      return [];
    }

    const filtered = terms.filter(t =>
      t.label.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    filtered.sort((a, b) => {
      // 1. Terms -_exists_(labelled as Not Specified) is always first followed by _exists_(labelled as Any Specified) - no matter the count.
      if (a.term.includes('_exists_') && !b.term.includes('_exists_'))
        return -1;
      if (!a.term.includes('_exists_') && b.term.includes('_exists_')) return 1;
      // 2. Sort by count in descending order
      if (a.count !== b.count) return b.count - a.count;
      // 3. Sort based on selected filters - selected filters should appear first.
      if (selectedFilters.includes(a.term) && !selectedFilters.includes(b.term))
        return -1;
      if (!selectedFilters.includes(a.term) && selectedFilters.includes(b.term))
        return 1;
      // 4. Sort alphabetically if count is the same
      return a.label.toLowerCase().localeCompare(b.label.toLowerCase());
    });

    return filtered;
  }, [terms, searchTerm, isLoading, selectedFilters]);

  /**
   * Toggle the state to show the full list or the minimized list.
   * The useCallback hook ensures this function is only re-created when setShowFullList changes.
   */
  const toggleShowFullList = useCallback(() => {
    !disableToggle && setShowFullList(prev => !prev); // Toggle the value of showFullList
  }, [disableToggle]);

  // Return the filtered terms and the state management functions
  return {
    filteredTerms, // The filtered and sorted list of terms
    showFullList, // Boolean indicating if the full list is shown
    toggleShowFullList, // Function to toggle the full list display
    disableToggle, // Boolean indicating if the toggle should be disabled
  };
};
