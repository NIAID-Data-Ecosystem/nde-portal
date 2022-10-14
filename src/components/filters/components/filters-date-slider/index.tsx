import React, { useMemo, useState } from 'react';
import { omit } from 'lodash';
import { Box, Flex, Heading, Skeleton, Text } from 'nde-design-system';
import { useFacetsData } from '../../hooks/useFacetsData';
import { SelectedFilterType } from '../../types';
import { Params } from 'src/utils/api';
import { queryFilterObject2String } from '../../helpers';
import { aggregateDatesByYear } from './helpers';
import { Slider } from './components/slider';
import { Histogram } from './components/histogram';
import { FacetTerm } from 'src/utils/api/types';
import { DatePicker } from './components/date-picker';
import { formatISOString } from 'src/utils/api/helpers';

interface FiltersDateSliderProps {
  // Params used in query.
  queryParams: Params;
  // fn to update filter selection
  handleSelectedFilter: (arg: string[]) => void;
  // fn to reset filter selection
  resetFilter: () => void;
  // Selected resourcesGroupedByYear [min, max] from router.
  selectedDates: string[];
  filters: SelectedFilterType;
  selectedData: FacetTerm[];
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
    [resourcesGroupedByYear] The data for the date slider updates with filters and querystring changes but we omit the date filter from updating the data for the appearance of this filter.
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

  // [resourcesWithNoDates]: Data used for N/A bar in histogram. Resources that do not have a date field.
  const resourcesWithNoDates = useMemo(
    () => data?.date?.filter(d => d.term === '-_exists_') || [],
    [data?.date],
  );

  // [resourcesWithDates]: Resources that have a date field, sorted.
  const resourcesWithDates = useMemo(
    () =>
      data?.date
        ?.filter(d => !(d.term === '-_exists_' || d.count === 0))
        .sort(
          (a, b) => new Date(a.term).valueOf() - new Date(b.term).valueOf(),
        ) || [],
    [data?.date],
  );

  // [resourcesGroupedByYear]: Grouped by year
  const resourcesGroupedByYear = useMemo(() => {
    return aggregateDatesByYear(resourcesWithDates);
  }, [resourcesWithDates]);

  /*
  HANDLE SLIDER DATE RANGE
    [activeDateRange]: Range controlled by sliders. Indices of resourcesGroupedByYear.
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
      p={4}
    >
      <Skeleton isLoaded={!isLoading} w='100%' h={isLoading ? '4rem' : 'unset'}>
        {!isLoading && data?.date?.length === 0 && (
          <Text>No available filters.</Text>
        )}

        {/* Calendar Inputs */}
        {resourcesGroupedByYear.length > 0 ? (
          <Flex mb={4}>
            <DatePicker
              min={formatISOString(resourcesWithDates[0]?.term || '')}
              max={formatISOString(
                resourcesWithDates[resourcesWithDates.length - 1]?.term || '',
              )}
              selectedDates={selectedDates}
              handleSelectedFilter={handleSelectedFilter}
              resetFilter={resetFilter}
            />
          </Flex>
        ) : (
          <></>
        )}

        <Flex w='100%' flexDirection='column' alignItems='center'>
          {data?.date?.length > 0 ? (
            // Histogram for resources grouped by year
            <Histogram
              data={[...resourcesWithNoDates, ...resourcesGroupedByYear]}
              updatedData={selectedData}
              range={[
                selectedDates.includes('-_exists_') ||
                selectedDates.length === 0
                  ? '-_exists_'
                  : '',
                ...(activeDateRange !== undefined
                  ? resourcesGroupedByYear
                      .slice(activeDateRange[0], activeDateRange[1] + 1)
                      .map(d => d.term.split('-')[0])
                  : []),
              ]}
              handleClick={year => {
                if (year === '-_exists_') {
                  handleSelectedFilter(['-_exists_']);
                } else {
                  handleSelectedFilter([`${year}-01-01`, `${year}-12-31`]);
                }
              }}
            >
              {/* Date Range Slider */}
              {resourcesGroupedByYear.length ? (
                <Box w='100%' mt={-2.5} flex={1}>
                  <Slider
                    rangeValues={activeDateRange}
                    data={resourcesGroupedByYear}
                    selectedDates={selectedDates}
                    updateRangeValues={setActiveDateRange}
                    onChangeEnd={values => {
                      setActiveDateRange(values);
                      //   update api request
                      handleSelectedFilter([
                        `${resourcesGroupedByYear[values[0]].term}-01-01`,
                        `${resourcesGroupedByYear[values[1]].term}-12-31`,
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
      </Skeleton>
    </Box>
  );
};
