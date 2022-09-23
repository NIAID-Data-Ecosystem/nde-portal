import React from 'react';
import { Box, Heading, Text } from 'nde-design-system';
import { SelectedFilterType } from 'src/components/filters/types';
import { BarChart } from './components/bar-chart';
import {
  Data,
  Datum,
  parameters as chartParameters,
} from '../network/components/chart';
import { options } from '../network';
import { FetchSearchResultsResponse } from 'src/utils/api/types';

interface MeasurementPathogenViz {
  //[primary, secondary] group keys
  keys: string[];
  // Unfiltered data
  data: FetchSearchResultsResponse;
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

  const primaryData = data?.facets[primaryKey].terms;
  const secondaryData = data?.facets[secondaryKey].terms;

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
            data={primaryData.map((d, i) => ({
              ...d,
              fill:
                chartParameters.primary.getColor(i) ||
                chartParameters.primary.fill,
            }))}
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
            data={secondaryData.map((d, i) => ({
              ...d,
              fill: chartParameters.secondary.fill,
            }))}
            updateFilters={updateFilters}
            setHovered={setHovered}
          />
        </Box>
      )}
    </>
  );
};

export default MeasurementPathogenViz;
