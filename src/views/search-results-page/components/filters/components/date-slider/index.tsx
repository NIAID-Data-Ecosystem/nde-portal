import React, { useMemo } from 'react';
import { Box, Checkbox, Flex, Heading, Skeleton, Text } from '@chakra-ui/react';
import { Slider } from './components/slider';
import { DatePicker } from './components/date-picker';
import { formatNumber } from 'src/utils/helpers';
import { DateRangeSlider } from './hooks/useDateRangeContext';
import dynamic from 'next/dynamic';
import { Params } from 'src/utils/api';
import { useFilterQueries } from '../../hooks/useFilterQueries';
import { FILTER_CONFIGS } from '../../config';
import {
  queryFilterObject2String,
  queryFilterString2Object,
} from 'src/views/search-results-page/helpers';
import { omit } from 'lodash';

const Histogram = dynamic(() => import('./components/histogram'), {
  ssr: false,
});

interface FiltersDateSliderProps {
  colorScheme: string;
  queryParams: Params;
  // Selected resourcesWithDate [min, max] from router.
  selectedDates: string[];
  // fn to update filter selection
  handleSelectedFilter: (arg: string[]) => void;
  // fn to reset filter selection
  resetFilter: () => void;
}

export const FiltersDateSlider: React.FC<FiltersDateSliderProps> = ({
  colorScheme,
  queryParams,
  selectedDates,
  handleSelectedFilter,
  resetFilter,
}) => {
  const config = useMemo(
    () => FILTER_CONFIGS.filter(facet => facet.property === 'date'),
    [],
  );

  /*
  Remove date filter from filters object for initial results.
  This is necessary to get all the possible results (regardless of date filter selection),
  If we want the histogram bars to fully change whenever there's a new date selection, add back the date filter.
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

  const selectedData = results?.date || [];
  // [resourcesWithNoDate]: Data used for resources that do not have a date field.
  const resourcesWithNoDate = useMemo(
    () =>
      initialResults['date']?.filter(
        d => d.term === '-_exists_' && d.count > 0,
      ) || [],
    [initialResults],
  );

  // check if there is data with dates available to display the historgram.
  const showHistogram = selectedData?.filter(
    d => d.term !== '-_exists_' && d.count !== 0,
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
    <Box
      w='100%'
      borderRadius='base'
      border='1px solid'
      borderColor='primary.100'
    >
      <Skeleton
        className='date-slider-skeleton'
        isLoaded={!isLoading}
        w='100%'
        h={isLoading ? '404px' : 'unset'}
      >
        {!isLoading && initialResults['date']?.length === 0 && (
          <Text>No available filters.</Text>
        )}
        {!isLoading && selectedData?.length > 0 ? (
          <DateRangeSlider
            data={initialResults['date']}
            selectedDates={selectedDates}
            colorScheme='secondary'
          >
            {showHistogram.length > 0 && (
              <Flex
                w='100%'
                flexDirection='column'
                alignItems='center'
                p={4}
                px={8}
                mt={-1.5}
              >
                {/*  Histogram for resources grouped by year */}
                <Histogram
                  updatedData={selectedData}
                  handleClick={handleSelectedFilter}
                >
                  {/* Slider for choosing the date range. */}
                  <Slider onChangeEnd={handleSelectedFilter} />
                </Histogram>
              </Flex>
            )}

            {/* Calendar Inputs */}
            <Flex bg='blackAlpha.50' flexDirection='column' p={4}>
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
                  selectedDates.length === 0 ||
                  selectedDates.includes('-_exists_')
                }
                onChange={e => {
                  let updatedDates = [...selectedDates];
                  // if toggled when no selection is made, show resources with dates.
                  if (selectedDates.length === 0) {
                    updatedDates.push('_exists_');
                  }
                  // if toggled when resources with dates is showing, remove this filter.
                  else if (selectedDates.includes('_exists_')) {
                    updatedDates = selectedDates.filter(
                      d => !d.includes('_exists_'),
                    );
                  }
                  //user toggles this when dates are selected and they also want to show resources with no dates.
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
          </DateRangeSlider>
        ) : (
          <></>
        )}
      </Skeleton>
    </Box>
  );
};
