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
  const [{ data, error, isLoading }] = useFacetsData({
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
        {!isLoading && data?.date?.length === 0 && (
          <Text>No available filters.</Text>
        )}

        <Flex w='100%' flexDirection='column' alignItems='center' p={4}>
          {data?.date?.length > 0 ? (
            // Histogram for resources grouped by year
            <Histogram
              data={[...resourcesWithDate]}
              updatedData={selectedData}
              range={[
                selectedDates.includes('-_exists_') ||
                selectedDates.length === 0
                  ? '-_exists_'
                  : '',
                ...(activeDateRange !== undefined
                  ? resourcesWithDate
                      .slice(activeDateRange[0], activeDateRange[1] + 1)
                      .map(d => d.term)
                  : []),
              ]}
              handleClick={term => {
                if (term === '-_exists_') {
                  handleSelectedFilter(['-_exists_']);
                } else {
                  const year = term.split('-')[0];
                  handleSelectedFilter([`${year}-01-01`, `${year}-12-31`]);
                }
              }}
            >
              {/* Date Range Slider */}
              {/* activeDateRange?.[0] !== undefined ? (
                <Text w='100%' textAlign='right'>
                  {resourcesWithDate[activeDateRange[0]].term}
                </Text>
              )  */}
              {resourcesWithDate.length > 0 ? (
                <Box w='100%' mt={-2.5} flex={1}>
                  <Slider
                    rangeValues={activeDateRange}
                    data={resourcesWithDate}
                    selectedDates={selectedDates}
                    updateRangeValues={setActiveDateRange}
                    onChangeEnd={values => {
                      setActiveDateRange(values);
                      //   update api request
                      handleSelectedFilter([
                        `${
                          resourcesWithDate[values[0]].term.split('-')[0]
                        }-01-01`,
                        `${
                          resourcesWithDate[values[1]].term.split('-')[0]
                        }-12-31`,
                      ]);
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
        {resourcesWithDate.length > 0 ? (
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
                  updatedDates.push('-_exists_');
                }
                handleSelectedFilter(updatedDates);
              }}
              isDisabled={!resourcesWithNoDate.length}
            >
              <Text fontSize='sm' fontWeight='medium' lineHeight='shorter'>
                Include resources with no date information .
              </Text>
            </Checkbox>
          </Flex>
        ) : (
          <></>
        )}
      </Skeleton>
    </Box>
  );
};
