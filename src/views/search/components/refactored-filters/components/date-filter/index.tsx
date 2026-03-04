import React, { useMemo } from 'react';
import { omit } from 'lodash';
import { Box, Flex, Heading } from '@chakra-ui/react';
import { Params } from 'src/utils/api';
import { DateRange } from './hooks/useDateRangeContext';
import { useFilterQueries } from '../../hooks/useFilterQueries';
import { FILTER_CONFIGS } from '../../config';
import {
  queryFilterObject2String,
  queryFilterString2Object,
} from '../../utils/query-string';
import { HistogramSection } from './components/histogram-section';
import { DateControls } from './components/date-controls';
import { useDateFilterData } from './hooks/useDateFilterData';
import { FilterResults } from '../../types';

interface DateFilterProps {
  colorScheme: string;
  queryParams: Params;
  selectedDates: string[];
  handleSelectedFilter: (dates: string[]) => void;
  resetFilter: () => void;
  showHistogram?: boolean;
  showDateControls?: boolean;
}

/**
 * Prepares query parameters by removing the date filter.
 * This ensures we get all possible results for the histogram display.
 */
const prepareInitialParams = (
  queryParams: Params,
): { q: string; extra_filter: string } => {
  const filtersObject = queryParams.extra_filter
    ? queryFilterString2Object(queryParams.extra_filter)
    : {};

  const filtersWithoutDate = omit(filtersObject, ['date']);

  return {
    q: queryParams.q || '',
    extra_filter: queryFilterObject2String(filtersWithoutDate) || '',
  };
};

const DATE_FILTER_CONFIG = FILTER_CONFIGS.filter(
  facet => facet.property === 'date',
);

const DateFilterContent: React.FC<
  DateFilterProps & {
    results: FilterResults;
    initialResults: FilterResults;
    error: Error | null;
    isLoading: boolean;
    isUpdating: boolean;
  }
> = ({
  colorScheme,
  results,
  initialResults,
  error,
  isLoading,
  isUpdating,
  selectedDates,
  handleSelectedFilter,
  resetFilter,
  showHistogram = true,
  showDateControls = true,
}) => {
  const { selectedData, resourcesWithNoDate, hasAnyDateData } =
    useDateFilterData(
      results,
      initialResults,
      DATE_FILTER_CONFIG[0].id,
      handleSelectedFilter,
    );

  if (error) {
    return (
      <Flex p={4} bg='status.error'>
        <Heading size='sm' color='white' fontWeight='semibold'>
          Something went wrong, unable to load filters. <br />
          Try reloading the page.
        </Heading>
      </Flex>
    );
  }

  return (
    <Box w='100%' h='100%'>
      {showHistogram && (
        <HistogramSection
          data={selectedData || []}
          hasData={hasAnyDateData}
          isLoading={isLoading}
          isUpdating={isUpdating}
          onDateSelect={handleSelectedFilter}
        />
      )}

      {showDateControls && (
        <DateControls
          colorScheme={colorScheme}
          selectedDates={selectedDates}
          resourcesWithNoDate={resourcesWithNoDate}
          onDateSelect={handleSelectedFilter}
          onResetFilter={resetFilter}
        />
      )}
    </Box>
  );
};

/**
 * DateFilter Component
 *
 * Provides date-based filtering with histogram visualization and calendar controls.
 * Wraps the filter content with DateRangeContext for state management.
 */
export const DateFilter: React.FC<DateFilterProps> = props => {
  const { queryParams, selectedDates } = props;

  // Prepare params without date filter for initial data
  const initialParams = useMemo(
    () => prepareInitialParams(queryParams),
    [queryParams],
  );

  // Fetch initial data (without date filter)
  const initialQueryData = useFilterQueries({
    configs: DATE_FILTER_CONFIG,
    params: initialParams,
  });

  // Fetch updated data (with current query params)
  const updateQueryData = useFilterQueries({
    configs: DATE_FILTER_CONFIG,
    params: {
      q: queryParams.q || '',
      extra_filter: queryParams.extra_filter || '',
    },
  });

  const { results: initialResults, isLoading: initialLoading } =
    initialQueryData;
  const { results, isLoading, isUpdating, error } = updateQueryData;

  const data = useMemo(
    () => initialResults?.[DATE_FILTER_CONFIG[0].id]?.data || [],
    [initialResults],
  );

  return (
    <DateRange
      data={data}
      isLoading={initialLoading}
      selectedDates={selectedDates}
      colorScheme='secondary'
    >
      <DateFilterContent
        results={results}
        initialResults={initialResults}
        error={error}
        isLoading={isLoading || initialLoading}
        isUpdating={isUpdating}
        {...props}
      />
    </DateRange>
  );
};
