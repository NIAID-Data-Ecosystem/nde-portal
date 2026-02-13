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
} from '../../utils/query-builders';
import { HistogramSection } from './components/histogram-section';
import { DateControls } from './components/date-controls';
import { useDateFilterData } from './hooks/useDateFilterData';

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
const prepareInitialParams = (queryParams: Params): Params => {
  const filtersObject = queryParams.extra_filter
    ? queryFilterString2Object(queryParams.extra_filter)
    : {};

  const filtersWithoutDate = omit(filtersObject, ['date']);

  return {
    ...queryParams,
    extra_filter: queryFilterObject2String(filtersWithoutDate) || '',
  };
};

const DATE_FILTER_CONFIG = FILTER_CONFIGS.filter(
  facet => facet.property === 'date',
);

const DateFilterContent: React.FC<
  DateFilterProps & {
    initialQueryData: ReturnType<typeof useFilterQueries>;
  }
> = ({
  colorScheme,
  initialQueryData,
  selectedDates,
  handleSelectedFilter,
  resetFilter,
  showHistogram = true,
  showDateControls = true,
}) => {
  const { results, initialResults, error, isLoading, isUpdating } =
    initialQueryData;

  const { selectedData, resourcesWithNoDate, hasAnyDateData } =
    useDateFilterData(
      results,
      initialResults,
      DATE_FILTER_CONFIG[0]._id,
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

  const initialParams = useMemo(
    () => prepareInitialParams(queryParams),
    [queryParams],
  );

  const initialQueryData = useFilterQueries({
    initialParams,
    updateParams: queryParams,
    config: DATE_FILTER_CONFIG,
  });

  const { initialResults, isLoading } = initialQueryData;
  const data = useMemo(
    () => initialResults?.[DATE_FILTER_CONFIG[0]._id]?.['data'] || [],
    [initialResults],
  );

  return (
    <DateRange
      data={data}
      isLoading={isLoading}
      selectedDates={selectedDates}
      colorScheme='secondary'
    >
      <DateFilterContent initialQueryData={initialQueryData} {...props} />
    </DateRange>
  );
};
