import React, { useEffect, useMemo, useState } from 'react';
import { addMissingYears } from '../helpers';
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
};

const DateRangeContext = React.createContext({
  ...defaultContext,
});
DateRangeContext.displayName = 'DateRangeContext';

/*
  HANDLE SLIDER DATE RANGE
  [DateRangeSlider]: Range controlled by sliders. Indices of resourcesWithDate.
*/
export const DateRangeSlider: React.FC<{
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

  useEffect(() => {
    if (!isLoading) {
      setInitialData(datesData);
    }
  }, [datesData, isLoading]);

  // All available data (complete dataset) - this represents the full slider range
  const allData = useMemo(
    () =>
      addMissingYears(
        initialData
          .filter(datum => {
            // Filter to current year as max
            return (
              new Date(datum.term).getFullYear() <= new Date().getFullYear()
            );
          })
          .filter(d => !(d.term === '-_exists_' || d.count === 0)) || [],
      ),
    [initialData],
  );

  // Filtered data based on selected date range - this is what the histogram displays
  const filteredData = useMemo(() => {
    // If no date filter or _exists_ filter, show ALL data
    if (!selectedDates.length || selectedDates.includes('_exists_')) {
      return allData;
    }

    const [start, end] = selectedDates;
    const startYear = start ? parseInt(start.split('-')[0]) : null;
    const endYear = end ? parseInt(end.split('-')[0]) : null;

    if (!startYear || !endYear) {
      return allData;
    }

    return allData.filter(d => {
      const year = parseInt(d.term.split('-')[0]);
      return year >= startYear && year <= endYear;
    });
  }, [allData, selectedDates]);

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
    throw new Error(
      'useDateRangeContext must be wrapped with <DateRangeSlider/>',
    );
  }
  return context;
};

// // src/views/search/utils/update-route.ts
// import { NextRouter } from 'next/router';

// // Given a query object, update the route to reflect the change.
// export const updateRoute = (router: NextRouter, update: {}) => {
//   return router.push(
//     {
//       query: {
//         ...router.query,
//         ...update,
//       },
//     },
//     undefined,
//     {
//       shallow: true,
//     },
//   );
// };
