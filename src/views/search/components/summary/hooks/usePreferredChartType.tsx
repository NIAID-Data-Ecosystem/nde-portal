import { useCallback, useState } from 'react';
import { ChartType } from '../types';

/**
 * Persistent chart type preference hook.
 * Stores user preferred chart type for a given visualization ID in localStorage.
 * Retrieves stored preference on initialization.
 * Potentially use url instead depending on use case.
 *
 * Replace with:
 * - User account preferences (if logged in / future potential feature)
 */
export const usePreferredChartType = (
  vizId: string,
  defaultChartType: ChartType,
): [ChartType, (next: ChartType) => void] => {
  const key = `vizPref.chartType.${vizId}`;

  // If no stored value for prefered chart type for given property, use default
  const [value, setValue] = useState<ChartType>(() => {
    if (typeof window === 'undefined') return defaultChartType;
    const stored = window.localStorage.getItem(key) as ChartType | null;
    return stored ?? defaultChartType;
  });

  const setAndPersist = useCallback(
    (next: ChartType) => {
      setValue(next);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, next);
      }
    },
    [key],
  );

  return [value, setAndPersist];
};
