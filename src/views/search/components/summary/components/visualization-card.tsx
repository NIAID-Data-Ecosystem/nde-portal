import {
  ChartDatum,
  ChartType,
  SearchFilter,
  SearchState,
  VizConfig,
} from '../types';
import { useAggregationQuery } from '../hooks/useAggregationQuery';
import {
  bucketSmallValues,
  chartRegistry,
  DEFAULT_MORE_PARAMS,
  MORE_ID,
  normalizeAggregateData,
} from '../helpers';
import { usePreferredChartType } from '../hooks/usePreferredChartType';
import { useEffect, useMemo, useState } from 'react';
import { ChartTypePicker } from './chart-picker';
import { Box, Button, Flex, HStack } from '@chakra-ui/react';

type VisualizationCardProps = {
  config: VizConfig;

  searchState: SearchState;

  isActive: boolean;

  onFilterUpdate?: (values: string[], facet: string) => void;
};

export const VisualizationCard = (props: VisualizationCardProps) => {
  const { config, searchState, isActive, onFilterUpdate } = props;
  // State to manage drill-down mode for "More" category.
  const [drillMode, setDrillMode] = useState<'all' | 'more'>('all');

  // Use preferred chart type hook to manage user preference.
  const [preferredChartType, setPreferredChartType] = usePreferredChartType(
    config.id,
    config.chart.defaultOption,
  );

  // Clamp preference to what's allowed (in case options changed)
  const chartType = useMemo<ChartType>(() => {
    return config.chart.availableOptions.includes(preferredChartType)
      ? preferredChartType
      : config.chart.defaultOption;
  }, [
    preferredChartType,
    config.chart.availableOptions,
    config.chart.defaultOption,
  ]);

  // Fetch aggregation data based on the config and search state.
  const aggData = useAggregationQuery({
    property: config.property,
    searchState,
    enabled: isActive,
  });

  // Normalize the aggregated data.
  const facetData =
    aggData.data && normalizeAggregateData(aggData.data, config.property);

  // Format chart data.
  const chartAdapter = chartRegistry[chartType];
  const chartData = useMemo(() => {
    return (
      facetData &&
      chartAdapter.mapFacetsToChartData(facetData, {
        formatLabel:
          config.formatting?.label ??
          ((term, count) => `${term} (${count.toLocaleString()})`),
      })
    );
  }, [facetData, chartType, config.formatting]);

  // [TO DO]: extend to other types of charts
  const prepared = useMemo(() => {
    const base = chartData ?? [];

    const maxSlices = config.chart?.pie?.maxSlices;
    const minPercent = config.chart?.pie?.minPercent;

    const { chartData: bucketedData, moreItems } = bucketSmallValues(base, {
      maxSlices,
      minPercent,
    });

    // drill mode: show only the items inside "More"
    if (drillMode === 'more') {
      return { data: moreItems, moreItems: [] as ChartDatum[] };
    }

    return { data: bucketedData, moreItems };
  }, [chartData, chartType, config.chart, drillMode]);

  // If the query/config changes, reset drill mode
  useEffect(() => {
    setDrillMode('all');
  }, [config.id, chartType, facetData?.length]);

  useEffect(() => {
    // If preferred chart type is no longer valid, reset to default.
    if (!config.chart.availableOptions.includes(preferredChartType)) {
      setPreferredChartType(config.chart.defaultOption);
    }
  }, [config.chart.availableOptions.join('|')]);

  // if (!isActive) {
  //   return <>Inactive State</>;
  // }
  // if (aggData.isError) {
  //   // refetch option + error handling can be added here
  //   return <>Error State</>;
  // }
  // if (aggData.isLoading || !facetData) {
  //   return <>Loading State</>;
  // }
  // if (facetData?.length === 0) {
  //   // No data available for the given aggregation. Empty state
  //   return <>No Data State</>;
  // }
  const ChartComponent = chartAdapter.Component;

  return (
    <Flex
      direction='column'
      p={4}
      borderColor='gray.100'
      borderWidth='1px'
      borderRadius='md'
    >
      <Flex mb={4} justify='space-between' align='center'>
        <h2>{config.label}</h2>
        <ChartTypePicker
          value={chartType}
          options={config.chart.availableOptions}
          onChange={setPreferredChartType}
          isDisabled={!isActive}
        />
      </Flex>
      {drillMode === 'more' && (
        <Flex alignItems='center' fontSize='xs'>
          <Button
            size='xs'
            variant='ghost'
            onClick={() => setDrillMode('all')}
            color='link.color'
            textDecoration='underline'
          >
            {config.label}{' '}
          </Button>{' '}
          / {DEFAULT_MORE_PARAMS.moreLabel}...
        </Flex>
      )}
      <ChartComponent
        data={prepared.data || []}
        getRoute={() => {
          return '';
        }}
        onSliceClick={(id: string) => {
          if (drillMode === 'all' && id === MORE_ID) {
            setDrillMode('more');
            return;
          } else {
            onFilterUpdate && onFilterUpdate([id], config.property);
          }
        }}
      />
    </Flex>
  );
};
