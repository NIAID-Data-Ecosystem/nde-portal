import { useMemo, useEffect } from 'react';
import { useDateRangeContext } from './useDateRangeContext';

interface FilterResults {
  [key: string]: {
    data: any[];
  };
}

/**
 * Custom hook to process date filter data
 *
 * Extracts and processes initial and selected data for the date filter,
 * separating resources with and without dates.
 * Also sets up the brush change handler for histogram interactions.
 */
export const useDateFilterData = (
  results: FilterResults | undefined,
  initialResults: FilterResults | undefined,
  filterKey: string,
  handleSelectedFilter: (dates: string[]) => void,
) => {
  const { setOnBrushChangeEnd } = useDateRangeContext();

  const selectedData = useMemo(
    () => results?.[filterKey]?.['data'],
    [filterKey, results],
  );

  const initialData = useMemo(
    () => initialResults?.[filterKey]?.['data'] || [],
    [filterKey, initialResults],
  );

  // Resources without date information - based on initial data
  // This ensures the checkbox isn't disabled when dates are filtered
  const resourcesWithNoDate = useMemo(() => {
    return (
      initialData?.filter(d => d.term === '-_exists_' && d.count > 0) || []
    );
  }, [initialData]);

  // Check if there's any date data available (not just in selected range)
  const hasAnyDateData = useMemo(() => {
    if (!selectedData) return false;
    return (
      selectedData.filter(d => d.term !== '-_exists_' && d.count !== 0).length >
      0
    );
  }, [selectedData]);

  // Set up brush change callback for histogram interactions
  useEffect(() => {
    setOnBrushChangeEnd(() => (startYear: string, endYear: string) => {
      const startDate = `${startYear}-01-01`;
      const endDate = `${endYear}-12-31`;
      handleSelectedFilter([startDate, endDate]);
    });
  }, [setOnBrushChangeEnd, handleSelectedFilter]);

  return {
    selectedData,
    resourcesWithNoDate,
    hasAnyDateData,
  };
};
