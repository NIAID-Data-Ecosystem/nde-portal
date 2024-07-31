import { useMemo, useState, useCallback } from 'react';
import { FilterItem } from 'src/components/search-results-page/components/filters/types';

// Define the props interface for the useFilterSearch hook
interface useFilterSearchProps {
  terms: FilterItem[];
  searchTerm: string;
  disableToggle: boolean;
}

// Custom hook to handle the filtering and display logic for filter terms
export const useFilterSearch = ({
  terms,
  searchTerm,
  disableToggle = false,
}: useFilterSearchProps) => {
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
  const filteredTerms: FilterItem[] = useMemo(() => {
    if (!terms?.length) {
      return [];
    }

    return terms.filter(t =>
      t.label.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [terms, searchTerm]);

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
