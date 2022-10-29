import React, { useMemo, useState } from 'react';
import { omit } from 'lodash';
import {
  Box,
  ButtonProps,
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
import { addMissingYears } from './helpers';
import { Slider } from './components/slider';
import { Histogram } from './components/histogram';
import { FacetTerm } from 'src/utils/api/types';
import { DatePicker } from './components/date-picker';
import { formatISOString } from 'src/utils/api/helpers';
import { formatNumber } from 'src/utils/helpers';

interface FiltersDateSliderProps {
  colorScheme: ButtonProps['colorScheme'];
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
  // Initial data. Not impacted by date selection, used for background bars in histogram.
  const [{ data, error, isLoading, isUpdating }] = useFacetsData({
    queryParams,
    facets: ['date'],
  });

  // [resourcesWithNoDate]: Data used for N/A bar in histogram. Resources that do not have a date field.
  const resourcesWithNoDate = useMemo(
    () => data?.date?.filter(d => d.term === '-_exists_' && d.count > 0) || [],
    [data?.date],
  );

  // [resourcesWithDates]: Resources that have a date field, sorted.
  const resourcesWithDate = useMemo(
    () =>
      addMissingYears(
        data?.date?.filter(d => !(d.term === '-_exists_' || d.count === 0)) ||
          [],
      ),
    [data?.date],
  );

  /*
  HANDLE SLIDER DATE RANGE
    [activeDateRange]: Range controlled by sliders. Indices of resourcesWithDate.
  */
  const [activeDateRange, setActiveDateRange] = useState<number[]>([0, 0]);

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
        <Flex w='100%' flexDirection='column' alignItems='center' p={4}>
          {!isLoading && data?.date?.length === 0 && (
            <Text>No available filters.</Text>
          )}
          {!isLoading && data?.date?.length > 0 ? (
            // Histogram for resources grouped by year
            <Histogram
              data={resourcesWithDate}
              updatedData={selectedData}
              range={activeDateRange}
              handleClick={term => {
                const year = term.split('-')[0];
                handleSelectedFilter([`${year}-01-01`, `${year}-12-31`]);
              }}
            >
              {/* Date Range Slider */}

              {resourcesWithDate.length > 0 ? (
                <Box w='100%' mt={-2.5} flex={1}>
                  <Slider
                    // rangeValues={activeDateRange}
                    data={resourcesWithDate}
                    selectedDates={selectedDates}
                    updateRangeValues={setActiveDateRange}
                    onChangeEnd={values => {
                      const startYear =
                        resourcesWithDate[values[0]].term.split('-')[0];
                      const endYear =
                        resourcesWithDate[values[1]].term.split('-')[0];
                      // only update if dates have changed
                      if (
                        selectedDates[0]?.split('-')[0] !== startYear ||
                        selectedDates[1]?.split('-')[0] !== endYear
                      ) {
                        //   update api request
                        handleSelectedFilter([
                          `${startYear}-01-01`,
                          `${endYear}-12-31`,
                        ]);
                      }
                    }}
                  />
                </Box>
              ) : (
                <></>
              )}
            </Histogram>
          ) : (
            <></>
          )}
        </Flex>

        {/* Calendar Inputs */}
        <Flex bg='blackAlpha.50' flexDirection='column' p={4}>
          <DatePicker
            colorScheme='secondary'
            min={formatISOString(resourcesWithDate[0]?.term || '')}
            max={formatISOString(
              resourcesWithDate[resourcesWithDate.length - 1]?.term || '',
            )}
            selectedDates={selectedDates}
            handleSelectedFilter={handleSelectedFilter}
            resetFilter={resetFilter}
            isLoading={isLoading || isUpdating}
            isDisabled={!resourcesWithDate.length}
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
      </Skeleton>
    </Box>
  );
};
