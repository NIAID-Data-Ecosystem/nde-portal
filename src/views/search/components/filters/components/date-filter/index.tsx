import React, { useEffect, useMemo } from 'react';
import { omit } from 'lodash';
import { Box, Flex, Heading } from '@chakra-ui/react';
import { DateRange } from './hooks/useDateRangeContext';
import { FILTER_CONFIGS } from '../../config';
import {
  queryFilterObject2String,
  queryFilterString2Object,
} from '../../utils/query-string';
import { HistogramSection } from './components/histogram-section';
import { DateControls } from './components/date-controls';
import { useDateFilterData } from './hooks/useDateFilterData';

import {
  useFilterQueries,
  UseFilterQueriesResult,
} from '../../hooks/useFilterQueries';
import { FilterResults } from '../../types';
import { SearchQueryParams } from 'src/views/search/types';

interface DateFilterProps {
  colorScheme: string;
  queryParams: SearchQueryParams;
  selectedDates: string[];
  handleSelectedFilter: (dates: string[]) => void;
  resetFilter: () => void;
  showHistogram?: boolean;
  showDateControls?: boolean;
  enabled: boolean;
  updatedAggregateQueryData: UseFilterQueriesResult;
}

/**
 * Prepares query parameters by removing the date filter.
 * This ensures we get all possible results for the histogram display.
 */
const prepareInitialParams = (queryParams: SearchQueryParams) => {
  const filtersObject = queryParams.extra_filter
    ? queryFilterString2Object(queryParams.extra_filter)
    : {};

  const filtersWithoutDateFilter = omit(filtersObject, ['date']);

  return {
    q: queryParams.q || '',
    extra_filter: queryFilterObject2String(filtersWithoutDateFilter) || '',
    use_ai_search: queryParams?.use_ai_search ?? 'false',
  };
};

export const DATE_FILTER_CONFIG = FILTER_CONFIGS.filter(
  facet => facet.property === 'date',
);

const DateFilterContent: React.FC<
  DateFilterProps & {
    results?: FilterResults;
    initialResults?: FilterResults;
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
 * Uses the shared aggregation query for filtered data (cache hit with main filters)
 * and a separate aggregation query for initial (unfiltered) date data.
 */
export const DateFilter: React.FC<DateFilterProps> = props => {
  const { queryParams, selectedDates, updatedAggregateQueryData } = props;
  // Prepare params without date filter for initial data
  const initialParams = useMemo(
    () => prepareInitialParams(queryParams),
    [queryParams],
  );

  // Build aggregation params for initial query (without date filter) - separate API call
  const initialAggParams = useMemo(
    () => ({
      ...initialParams,
      hist: 'date',
    }),
    [initialParams],
  );

  // Initial data (without date filter) - separate API call
  const initialAggQuery = useFilterQueries({
    configs: DATE_FILTER_CONFIG,
    enabled: props.enabled,
    params: initialAggParams,
  });

  const initialResults = useMemo(
    () => initialAggQuery?.results,
    [initialAggQuery?.results],
  );
  const updatedResults = useMemo(
    () => updatedAggregateQueryData?.results,
    [updatedAggregateQueryData?.results],
  );
  const initialLoading = initialAggQuery?.isLoading;
  const isLoading = updatedAggregateQueryData?.isLoading;
  const isUpdating =
    (!isLoading && updatedAggregateQueryData?.isUpdating) || false;
  const error = (updatedAggregateQueryData?.error as Error) || null;

  return (
    <DateRange
      data={initialResults?.date?.terms || []}
      isLoading={initialLoading}
      selectedDates={selectedDates}
      colorScheme='secondary'
    >
      <DateFilterContent
        results={updatedResults}
        initialResults={initialResults}
        error={error}
        isLoading={isLoading || initialLoading}
        isUpdating={isUpdating}
        {...props}
      />
    </DateRange>
  );
};
