import React, { useMemo } from 'react';
import { omit } from 'lodash';
import {
  Box,
  Checkbox,
  Flex,
  Heading,
  Skeleton,
  Text,
} from 'nde-design-system';
import { useFacetsData } from '../../hooks/useFacetsData';
import { SelectedFilterType } from '../../types';
import { Params } from 'src/utils/api';
import { queryFilterObject2String } from '../../helpers';
import { Slider } from './components/slider';
import { FacetTerm } from 'src/utils/api/types';
import { DatePicker } from './components/date-picker';
import { formatNumber } from 'src/utils/helpers';
import { DateRangeSlider } from './hooks/useDateRangeContext';
import dynamic from 'next/dynamic';

const Histogram = dynamic(() => import('./components/histogram'), {
  ssr: false,
});

interface FiltersDateSliderProps {
  colorScheme: string;
  // Params used in query.
  queryParams: Params;
  // Selected resourcesWithDate [min, max] from router.
  selectedDates: string[];
  filters: SelectedFilterType;
  selectedData: FacetTerm[];
  // fn to update filter selection
  handleSelectedFilter: (arg: string[]) => void;
  // fn to reset filter selection
  resetFilter: () => void;
}

export const FiltersDateSlider: React.FC<FiltersDateSliderProps> = ({
  colorScheme,
  queryParams: params,
  filters,
  selectedDates,
  selectedData,
  handleSelectedFilter,
  resetFilter,
}) => {
  /*
  RETRIEVE DATES DATA
    [resourcesWithDate] The data for the date slider updates with filters and querystring changes but we omit the date filter from updating the data for the appearance of this filter.
  */
  const queryParams = {
    ...params,
    extra_filter: queryFilterObject2String(omit(filters, ['date'])) ?? '',
  };
  // Initial data. Not impacted by date selection, used for default state of bars, input and slider.
  const [{ data, error, isLoading, isUpdating }] = useFacetsData({
    queryParams,
    facets: ['date'],
  });

  // [resourcesWithNoDate]: Data used for resources that do not have a date field.
  const resourcesWithNoDate = useMemo(
    () => data?.date?.filter(d => d.term === '-_exists_' && d.count > 0) || [],
    [data?.date],
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
      <Skeleton isLoaded={!isLoading} w='100%' h={isLoading ? '4rem' : 'unset'}>
        {!isLoading && data?.date?.length === 0 && (
          <Text>No available filters.</Text>
        )}
        {!isLoading && !isUpdating && data?.date?.length > 0 ? (
          <DateRangeSlider
            data={data}
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
                flex={1}
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
