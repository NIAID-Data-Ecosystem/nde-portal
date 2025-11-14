import React, { useEffect, useMemo, useState } from 'react';
import { addMissingYears, getYear } from '../helpers';
import { FacetTermWithDetails, FilterItem } from '../../../types';

export interface ContextProps {
  colorScheme: string;
  allData: FacetTermWithDetails[]; // All data from complete dataset
  filteredData: FacetTermWithDetails[]; // Data within selected date range
  data?: FacetTermWithDetails[]; // Legacy
  dates: (string | null)[];
  dateRange: number[];
  setDateRange: React.Dispatch<React.SetStateAction<ContextProps['dateRange']>>;
  isDragging: boolean;
  setIsDragging: React.Dispatch<
    React.SetStateAction<ContextProps['isDragging']>
  >;
  onBrushChangeEnd: ((startYear: string, endYear: string) => void) | null;
  setOnBrushChangeEnd: React.Dispatch<
    React.SetStateAction<((startYear: string, endYear: string) => void) | null>
  >;
}

export const defaultContext: ContextProps = {
  colorScheme: 'primary',
  allData: [],
  filteredData: [],
  data: [],
  dates: ['', ''],
  dateRange: [],
  setDateRange: () => {},
  isDragging: false,
  setIsDragging: () => {},
  onBrushChangeEnd: null,
  setOnBrushChangeEnd: () => {},
};

const DateRangeContext = React.createContext({
  ...defaultContext,
});
DateRangeContext.displayName = 'DateRangeContext';

/*
  HANDLE DATE RANGE
  [DateRange]: Range controlled by brush. Indices of resourcesWithDate.
*/
export const DateRange: React.FC<{
  data: FilterItem[];
  isLoading: boolean;
  selectedDates: string[];
  colorScheme: ContextProps['colorScheme'];
  children: React.ReactNode;
}> = ({
  children,
  data: datesData,
  isLoading,
  selectedDates = [],
  colorScheme = 'primary',
}) => {
  const [initialData, setInitialData] = useState<FilterItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dateRange, setDateRange] = useState<number[]>([]);
  const [onBrushChangeEnd, setOnBrushChangeEnd] = useState<
    ((startYear: string, endYear: string) => void) | null
  >(null);

  useEffect(() => {
    if (!isLoading) {
      setInitialData(datesData);
    }
  }, [datesData, isLoading]);

  // Get current year for all filtering operations
  const currentYear = new Date().getFullYear();

  // All available data
  // Cap at current year to prevent future dates
  const allData = useMemo(() => {
    const filtered = (initialData ?? []).filter(d => {
      if (!d || d.term === '-_exists_' || d.count === 0) return false;
      const y = getYear(d.term);
      return y !== null && y <= currentYear;
    });

    return addMissingYears(filtered, {
      endYear: currentYear,
      makeLabel: y => String(y),
    });
  }, [initialData, currentYear]);

  // Filtered data based on selected date range
  const filteredData = useMemo(() => {
    // If no date filter or _exists_ filter, show ALL data (already capped at current year by allData)
    if (!selectedDates.length || selectedDates.includes('_exists_')) {
      return allData;
    }

    const [start, end] = selectedDates;
    const startYear = start ? parseInt(start.split('-')[0], 10) : null;
    const endYear = end ? parseInt(end.split('-')[0], 10) : null;

    if (!startYear || !endYear) {
      return allData;
    }

    // Cap end year at current year
    const cappedEndYear = Math.min(endYear, currentYear);

    return allData.filter(d => {
      const year = parseInt(d.term.split('-')[0], 10);
      return year >= startYear && year <= cappedEndYear;
    });
  }, [allData, selectedDates, currentYear]);

  useEffect(() => {
    setDateRange(prev => {
      let arr = prev ? [...prev] : [];

      // Map selected dates to indices in allData (not filteredData)
      if (!selectedDates.length || selectedDates.includes('_exists_')) {
        // No filter: show entire range
        arr[0] = 0;
        arr[1] = allData.length - 1;
      } else {
        // Find indices in allData for the selected dates
        const [start, end] = [
          allData.findIndex(
            datum =>
              datum.term?.split('-')[0] === selectedDates[0]?.split('-')[0],
          ),
          allData.findIndex(
            datum =>
              datum.term?.split('-')[0] === selectedDates[1]?.split('-')[0],
          ),
        ];

        if (arr[0] !== start) {
          arr[0] = start === -1 ? 0 : start;
        }
        if (arr[1] !== end) {
          arr[1] = end === -1 ? allData.length - 1 : end;
        }
      }
      return arr;
    });
  }, [selectedDates, allData]);

  // Dates are based on allData indices (slider operates on full dataset)
  const dates = useMemo(
    () => [
      allData[dateRange[0]]?.term || null,
      allData[dateRange[1]]?.term || null,
    ],
    [allData, dateRange],
  );

  const context = {
    colorScheme,
    allData,
    filteredData,
    data: filteredData, // Legacy
    dates,
    // index values of data.
    dateRange,
    setDateRange,
    isDragging,
    setIsDragging,
    onBrushChangeEnd,
    setOnBrushChangeEnd,
  };

  return (
    <DateRangeContext.Provider value={context}>
      {children}
    </DateRangeContext.Provider>
  );
};

export const useDateRangeContext = () => {
  const context = React.useContext(DateRangeContext);
  if (context === undefined) {
    throw new Error('useDateRangeContext must be wrapped with <DateRange/>');
  }
  return context;
};
