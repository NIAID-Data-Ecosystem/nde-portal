import React, { useEffect, useMemo, useState } from 'react';
import { ButtonProps } from 'nde-design-system';
import { FacetTerms, FilterTerm } from 'src/components/filters/types';
import { addMissingYears } from '../helpers';

export interface ContextProps {
  colorScheme: ButtonProps['colorScheme'];
  data?: FilterTerm[];
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
  data: FacetTerms;
  selectedDates: string[];
  colorScheme: ContextProps['colorScheme'];
  children: React.ReactNode;
}> = ({
  children,
  data: initialData,
  selectedDates = [],
  colorScheme = 'primary',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dateRange, setDateRange] = useState<number[]>([]);

  const data = useMemo(
    () =>
      addMissingYears(
        initialData?.date
          .filter(datum => {
            // filter out dates that exceed the current year.
            return (
              new Date(datum.term).getFullYear() < new Date().getFullYear()
            );
          })
          .filter(d => !(d.term === '-_exists_' || d.count === 0)) || [],
      ),
    [initialData?.date],
  );
  useEffect(() => {
    // This logic is added to control the state when filter tags are updated / page is refreshed.
    setDateRange(prev => {
      let arr = prev ? [...prev] : [];
      // If there's no date selected made, default to span the entire date range.
      if (!selectedDates.length || selectedDates.includes('_exists_')) {
        arr[0] = 0;
        arr[1] = data.length - 1;
      } else {
        // Otherwise, find the index value of the selection and update the state.
        const [start, end] = [
          data.findIndex(
            datum =>
              datum.term?.split('-')[0] === selectedDates[0]?.split('-')[0],
          ),
          data.findIndex(
            datum =>
              datum.term?.split('-')[0] === selectedDates[1]?.split('-')[0],
          ),
        ];

        if (arr[0] !== start) {
          arr[0] = start === -1 ? 0 : start;
        }
        if (arr[1] !== end) {
          arr[1] = end === -1 ? data.length - 1 : end;
        }
      }
      return arr;
    });
  }, [selectedDates, data]);

  const dates = useMemo(
    () => [data[dateRange[0]]?.term || null, data[dateRange[1]]?.term || null],
    [data, dateRange],
  );

  const context = {
    colorScheme,
    data,
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
