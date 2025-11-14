import React, { useMemo, useEffect } from 'react';
import { omit } from 'lodash';
import dynamic from 'next/dynamic';
import { Box, Checkbox, Flex, Heading, Spinner, Text } from '@chakra-ui/react';
import { DatePicker } from './components/date-picker';
import { formatNumber } from 'src/utils/helpers';
import { DateRange, useDateRangeContext } from './hooks/useDateRangeContext';
import { Params } from 'src/utils/api';
import { useFilterQueries } from '../../hooks/useFilterQueries';
import { FILTER_CONFIGS } from '../../config';
import {
  queryFilterObject2String,
  queryFilterString2Object,
} from '../../utils/query-builders';

const Histogram = dynamic(() => import('./components/histogram'), {
  ssr: false,
});

interface DateFilterProps {
  colorScheme: string;
  queryParams: Params;
  // Selected resourcesWithDate [min, max] from router.
  selectedDates: string[];
  // fn to update filter selection
  handleSelectedFilter: (arg: string[]) => void;
  // fn to reset filter selection
  resetFilter: () => void;
}

// Inner component that has access to context
const DateFilterInner: React.FC<DateFilterProps> = ({
  colorScheme,
  queryParams,
  selectedDates,
  handleSelectedFilter,
  resetFilter,
}) => {
  const { setOnBrushChangeEnd, allData } = useDateRangeContext();

  const config = useMemo(
    () => FILTER_CONFIGS.filter(facet => facet.property === 'date'),
    [],
  );
  const key = config[0]._id;

  /*
  Remove date filter from filters object for initial results.
  This is necessary to get all the possible results (regardless of date filter selection).
  */
  const initialParams = useMemo(() => {
    const filtersString2Object = queryParams.extra_filter
      ? queryFilterString2Object(queryParams.extra_filter)
      : '';
    const filters = omit(filtersString2Object, ['date']);
    return {
      ...queryParams,
      extra_filter: queryFilterObject2String(filters) || '',
    };
  }, [queryParams]);

  const { results, initialResults, error, isLoading, isUpdating } =
    useFilterQueries({
      initialParams,
      updateParams: queryParams,
      config,
    });

  const initialData = useMemo(
    () => initialResults?.[key]?.['data'] || [],
    [key, initialResults],
  );

  const selectedData = useMemo(() => results?.[key]?.['data'], [key, results]);

  // [resourcesWithNoDate]: Data used for resources that do not have a date field.
  const resourcesWithNoDate = useMemo(
    () => initialData?.filter(d => d.term === '-_exists_' && d.count > 0) || [],
    [initialData],
  );

  // [showHistogram]: Data used for resources that have a date field.
  const showHistogram =
    selectedData?.filter(d => d.term !== '-_exists_' && d.count !== 0).length >
    0;

  // Set up the brush change end callback
  useEffect(() => {
    setOnBrushChangeEnd(() => (startYear: string, endYear: string) => {
      const startDate = `${startYear}-01-01`;
      const endDate = `${endYear}-12-31`;
      handleSelectedFilter([startDate, endDate]);
    });
  }, [setOnBrushChangeEnd, handleSelectedFilter]);

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
    <Box
      w='100%'
      borderRadius='base'
      border='1px solid'
      borderColor='primary.100'
    >
      <Flex
        w='100%'
        flexDirection='column'
        alignItems='center'
        p={4}
        px={10}
        mt={-1.5}
        position='relative'
        minHeight='180px'
      >
        {(isLoading || isUpdating) && (
          <Flex
            position='absolute'
            top={0}
            width='100%'
            height='100%'
            bg='whiteAlpha.600'
            zIndex={1000}
            alignItems='center'
            justifyContent='center'
          >
            <Spinner
              color='accent.600'
              emptyColor='white'
              position='absolute'
              size='md'
              thickness='2px'
            />
          </Flex>
        )}
        {showHistogram ? (
          // Histogram for resources grouped by year with embedded brush control
          <Histogram
            updatedData={selectedData}
            handleClick={handleSelectedFilter}
          />
        ) : (
          !isLoading &&
          !isUpdating &&
          selectedData?.length === 0 && (
            <Text fontStyle='italic' color='gray.800' mt={1}>
              No results with date information.
            </Text>
          )
        )}
      </Flex>
      {/* Calendar Inputs */}
      <Flex bg='blackAlpha.50' flexDirection='column' px={4} py={2}>
        <DatePicker
          colorScheme={colorScheme}
          selectedDates={selectedDates}
          handleSelectedFilter={handleSelectedFilter}
          resetFilter={resetFilter}
        />
        {/* Checkbox to toggle items with/without dates. Default is to show all resources (including those without the date field). */}
        <Checkbox
          mt={4}
          isChecked={
            selectedDates.length === 0 || selectedDates.includes('-_exists_')
          }
          onChange={e => {
            let updatedDates = [...selectedDates];
            // if toggled when no selection is made, show resources with dates.
            if (selectedDates.length === 0) {
              updatedDates.push('_exists_');
            }
            // if toggled when resources with dates is showing, remove this filter.
            else if (selectedDates.includes('_exists_')) {
              updatedDates = selectedDates.filter(d => !d.includes('_exists_'));
            }
            // user toggles this when dates are selected and they also want to show resources with no dates.
            else {
              if (updatedDates.includes('-_exists_')) {
                updatedDates = selectedDates.filter(
                  d => !d.includes('-_exists_'),
                );
              } else {
                updatedDates.push('-_exists_');
              }
            }
            handleSelectedFilter(updatedDates);
          }}
          isDisabled={!resourcesWithNoDate.length}
        >
          <Text fontSize='sm' fontWeight='medium' lineHeight='shorter'>
            Include{' '}
            {resourcesWithNoDate.length && resourcesWithNoDate[0].count
              ? `${formatNumber(resourcesWithNoDate[0].count)}`
              : ''}{' '}
            resources with no date information.{' '}
          </Text>
        </Checkbox>
      </Flex>
    </Box>
  );
};

export const DateFilter: React.FC<DateFilterProps> = props => {
  const { queryParams, selectedDates } = props;

  const config = useMemo(
    () => FILTER_CONFIGS.filter(facet => facet.property === 'date'),
    [],
  );
  const key = config[0]._id;

  const initialParams = useMemo(() => {
    const filtersString2Object = queryParams.extra_filter
      ? queryFilterString2Object(queryParams.extra_filter)
      : '';
    const filters = omit(filtersString2Object, ['date']);
    return {
      ...queryParams,
      extra_filter: queryFilterObject2String(filters) || '',
    };
  }, [queryParams]);

  const { initialResults, isLoading } = useFilterQueries({
    initialParams,
    updateParams: queryParams,
    config,
  });

  const initialData = useMemo(
    () => initialResults?.[key]?.['data'] || [],
    [key, initialResults],
  );

  return (
    <DateRange
      data={initialData}
      isLoading={isLoading}
      selectedDates={selectedDates}
      colorScheme='secondary'
    >
      <DateFilterInner {...props} />
    </DateRange>
  );
};
