import { ChartDatum, ChartType, SearchState, VizConfig } from '../types';
import { useAggregationQuery } from '../hooks/useAggregationQuery';
import {
  bucketSmallValues,
  chartRegistry,
  DEFAULT_MORE_PARAMS,
  isMoreSlice,
  normalizeAggregateData,
} from '../helpers';
import { usePreferredChartType } from '../hooks/usePreferredChartType';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChartTypePicker } from './chart-picker';
import { Button, Flex, Heading, Icon, Text } from '@chakra-ui/react';
import { FaArrowLeft } from 'react-icons/fa6';

type VisualizationCardProps = {
  config: VizConfig;

  searchState: SearchState;

  isActive: boolean;

  onFilterUpdate?: (values: string[], facet: string) => void;
};

export const VisualizationCard = (props: VisualizationCardProps) => {
  const { config, searchState, isActive, onFilterUpdate } = props;
  // Drill stack to manage "More" drill-downs.
  const [drillStack, setDrillStack] = useState<ChartDatum[][]>([]);

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

  // Minimum percent threshold for bucketing into "More"
  const minPercent = config.chart?.pie?.minPercent ?? 0.01;

  // Current level data based on drill stack.
  const currentLevelData = useMemo(() => {
    return drillStack.length ? drillStack[drillStack.length - 1] : chartData;
  }, [chartData, drillStack]);

  // Bucket small values into "More"
  const { bucketedData, tail } = useMemo(() => {
    const { data, tail } = bucketSmallValues(currentLevelData || [], {
      minPercent,
      moreLabel: DEFAULT_MORE_PARAMS.moreLabel,
    });

    return { bucketedData: data, tail };
  }, [currentLevelData, minPercent]);

  // If the query/config changes, reset drill mode
  useEffect(() => {
    setDrillStack([]);
  }, [config.id, config.property, chartType, facetData?.length, minPercent]);

  useEffect(() => {
    // If preferred chart type is no longer valid, reset to default.
    if (!config.chart.availableOptions.includes(preferredChartType)) {
      setPreferredChartType(config.chart.defaultOption);
    }
  }, [config.chart.availableOptions.join('|')]);

  // Handler for back navigation in drill stack.
  const handleBack = useCallback(() => {
    setDrillStack(stack => stack.slice(0, -1));
  }, []);

  // Handler for slice clicks in the chart.
  const handleSliceClick = useCallback(
    (id: string) => {
      if (isMoreSlice(id)) {
        if (tail.length > 0) {
          setDrillStack(stack => [...stack, tail]);
        }
        return;
      }
      onFilterUpdate?.([id], config.property);
    },
    [tail, onFilterUpdate, config.property],
  );

  if (!isActive) {
    return <></>;
  }

  // [TO DO]: Add loading, error, and empty states.
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
        <Heading as='h2' fontSize='xs' noOfLines={1}>
          {config.label}
        </Heading>
        <ChartTypePicker
          value={chartType}
          options={config.chart.availableOptions}
          onChange={setPreferredChartType}
          isDisabled={!isActive}
        />
      </Flex>
      {drillStack.length > 0 && (
        <Flex alignItems='center' fontSize='xs'>
          <Button
            size='xs'
            variant='ghost'
            onClick={handleBack}
            color='link.color'
            textDecoration='underline'
            mr={2}
          >
            <Icon as={FaArrowLeft} boxSize={3} mr={1} />
            Back
          </Button>
          <Text noOfLines={1}>
            {config.label} / {DEFAULT_MORE_PARAMS.moreLabel}...
          </Text>
        </Flex>
      )}
      <Flex h='clamp(180px, 30vh, 250px)'>
        <ChartComponent
          data={bucketedData || []}
          onSliceClick={handleSliceClick}
        />
      </Flex>
    </Flex>
  );
};
