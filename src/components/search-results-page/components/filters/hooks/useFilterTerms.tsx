import { useMemo, useState, useCallback } from 'react';
import { FilterTerm } from 'src/components/search-results-page/components/filters/types';

// Define the props interface for the useFilterTerms hook
interface UseFilterTermsProps {
  terms: FilterTerm[];
  searchTerm: string;
  isLoading: boolean;
}

// Custom hook to handle the filtering and display logic for filter terms
export const useFilterTerms = ({
  terms,
  searchTerm,
  isLoading,
}: UseFilterTermsProps) => {
  const NUM_ITEMS_MIN = 5; // Minimum number of items to display when the list is minimized
  const [showFullList, setShowFullList] = useState(false); // State to manage whether the full list of terms is shown or not

  /**
   * Memoized computation of the filtered terms based on the search term.
   * - Filters the terms array to only include terms that match the search term (case-insensitive).
   * - If the terms array is empty and data is loading, returns a placeholder array for skeleton loading.
   * - If no terms and not loading, returns an empty array.
   * The useMemo hook ensures this computation is only re-run when terms, searchTerm, or isLoading change.
   */
  const filteredTerms: FilterTerm[] = useMemo(
    () =>
      terms?.length > 0
        ? terms.filter(t =>
            t.label.toLowerCase().includes(searchTerm.toLowerCase()),
          )
        : isLoading
        ? Array(NUM_ITEMS_MIN).fill('') // Placeholder for loading skeleton purposes
        : [],
    [terms, searchTerm, isLoading], // Dependencies for useMemo
  );

  /**
   * Toggle the state to show the full list or the minimized list.
   * The useCallback hook ensures this function is only re-created when setShowFullList changes.
   */
  const toggleShowFullList = useCallback(() => {
    setShowFullList(prev => !prev); // Toggle the value of showFullList
  }, []);

  // Return the filtered terms and the state management functions
  return {
    filteredTerms, // The filtered list of terms
    showFullList, // Boolean indicating if the full list is shown
    toggleShowFullList, // Function to toggle the full list display
  };
};
