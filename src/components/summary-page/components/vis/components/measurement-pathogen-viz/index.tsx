import React, { useMemo } from 'react';
import * as d3 from 'd3';
import { useRouter } from 'next/router';
import { Box, Button, Flex, Heading, Text } from 'nde-design-system';
import { SelectedFilterType } from 'src/components/summary-page';
import { useHasMounted } from 'src/hooks/useHasMounted';
import { queryFilterObject2String } from 'src/components/filter';
import { fetchSearchResults } from 'src/utils/api';
import { FetchSearchResultsResponse, FacetTerm } from 'src/utils/api/types';
import { useQuery } from 'react-query';
import { Error } from 'src/components/error';
import { BarChart } from './components/bar-chart';
import { SummaryQueryResponse } from 'src/pages/summary';
import { FilterTags } from 'src/components/search-results-page/components/filters/components/tags';
import { Data, Datum, parameters } from '../network/components/chart';
import { options } from '../network';
import { a } from 'react-spring';

interface MeasurementPathogenViz {
  //[primary, secondary] group keys
  keys: string[];
  // Unfiltered data
  data: Data[];
  // Filters object
  filters: SelectedFilterType;
  // HandlerFn for updating filters
  updateFilters: (updatedFilters: SelectedFilterType) => void;
  // HandlerFn for hover
  setHovered: (node: Datum | null) => void;
}

export const MeasurementPathogenViz: React.FC<MeasurementPathogenViz> = ({
  data,
  keys,
  updateFilters,
  setHovered,
}) => {
  const [primaryKey, secondaryKey] = keys;
  const primaryData = useMemo(
    () =>
      data
        .map(d => d3.group(d.children, d => d.type).get(primaryKey) || [])
        .flat(),
    [data, primaryKey],
  );

  const secondaryData = useMemo(
    () =>
      Object.values(
        data
          .map(d => d3.group(d.children, d => d.type).get(secondaryKey) || [])
          .flat()
          .reduce((r, d, i) => {
            if (!r[d.name]) {
              r[d.name] = {
                id: d.name,
                name: d.name,
                count: d.count,
                fill: parameters.secondary.fill,
                primary: null,
                type: d.type,
              };
            } else {
              r[d.name]['count'] += d.count;
            }
            return r;
          }, {} as { [key: string]: any }),
      ).sort((a, b) => {
        return b.count - a.count;
      }),
    [data, secondaryKey],
  );

  if (
    !primaryData.length &&
    !secondaryData.length &&
    primaryKey &&
    secondaryKey
  ) {
    return (
      <Text color='white'>
        No data for grouping {options[secondaryKey].name} by{' '}
        {options[primaryKey].name} <br />
        [TO DO]: group values that have no &quot;grouped by&quot; into n/a or
        Other?
      </Text>
    );
  }
  return (
    <>
      {/* Primary bar graph */}
      {primaryData.length > 0 && primaryKey && (
        <Box my={8}>
          <Heading as='h2' size='sm' color='#fff'>
            {options[primaryKey]['name']}
          </Heading>
          <BarChart
            data={primaryData}
            updateFilters={updateFilters}
            setHovered={setHovered}
          />
        </Box>
      )}

      {/* Secondary bar graph */}

      {secondaryData.length > 0 && secondaryKey && (
        <Box my={8}>
          <Heading as='h2' size='sm' color='#fff'>
            {options[secondaryKey]['name']}
          </Heading>
          <BarChart
            data={secondaryData}
            updateFilters={updateFilters}
            setHovered={setHovered}
          />
        </Box>
      )}
    </>
  );
};

export default MeasurementPathogenViz;
