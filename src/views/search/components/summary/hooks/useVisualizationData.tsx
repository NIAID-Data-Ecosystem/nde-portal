import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChartDatum, ChartType, SearchState, VizConfig } from '../types';
import { useAggregationQuery } from './useAggregationQuery';
import { usePreferredChartType } from './usePreferredChartType';
import {
  bucketSmallValues,
  chartRegistry,
  DEFAULT_MORE_PARAMS,
  isMoreSlice,
  normalizeAggregateData,
} from '../helpers';
import { SelectedFilterTypeValue } from '../../filters/types';

interface UseVisualizationDataParams {
  config: VizConfig;
  searchState: SearchState;
  isActive: boolean;
  selectedFilters: SelectedFilterTypeValue[];
  onFilterUpdate?: (values: SelectedFilterTypeValue[], facet: string) => void;
}

export const useVisualizationData = ({
  config,
  searchState,
  isActive,
  selectedFilters,
  onFilterUpdate,
}: UseVisualizationDataParams) => {
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
        transformData: config.transformData,
      })
    );
  }, [facetData, chartType, config.formatting, config.transformData]);

  // Current level data based on drill stack.
  const currentLevelData = useMemo(() => {
    return drillStack.length ? drillStack[drillStack.length - 1] : chartData;
  }, [chartData, drillStack]);

  // Bucket small values into "More"
  const { bucketedData, tail } = useMemo(() => {
    const { data, tail } = bucketSmallValues(currentLevelData || [], {
      ...config.chart?.[chartType],
      moreLabel: DEFAULT_MORE_PARAMS.moreLabel,
    });

    return { bucketedData: data, tail };
  }, [currentLevelData, config, chartType]);

  // If the query/config changes, reset drill mode
  useEffect(() => {
    setDrillStack([]);
  }, [config.id, config.property, chartType, facetData?.length, config.chart]);

  useEffect(() => {
    // If preferred chart type is no longer valid, reset to default.
    if (!config.chart.availableOptions.includes(preferredChartType)) {
      setPreferredChartType(config.chart.defaultOption);
    }
  }, [
    config.chart.availableOptions.join('|'),
    preferredChartType,
    setPreferredChartType,
  ]);

  // Handler for back navigation in drill stack.
  const handleBack = useCallback(() => {
    setDrillStack(stack => stack.slice(0, -1));
  }, []);

  // Helper function to check if a slice is selected
  const isSliceSelected = useCallback(
    (id: string) => {
      return selectedFilters.some(filter => {
        if (typeof filter === 'string') {
          return filter === id;
        }
        return false;
      });
    },
    [selectedFilters],
  );

  // Handler for slice clicks in the chart.
  const handleSliceClick = useCallback(
    (id: string) => {
      if (isMoreSlice(id)) {
        if (tail.length > 0) {
          setDrillStack(stack => [...stack, tail]);
        }
        return;
      }

      // If slice is already selected, remove it; otherwise add it
      const isSelected = isSliceSelected(id);
      const filterProperty = config.filterProperty || config.property;

      if (isSelected) {
        // Remove the filter - filter out this id from the existing filters
        const newFilters = selectedFilters.filter(filter =>
          typeof filter === 'string' ? filter !== id : true,
        );

        onFilterUpdate?.(newFilters, filterProperty);
      } else {
        // Add the filter
        const newFilters = Array.from(new Set([...selectedFilters, id]));
        onFilterUpdate?.(newFilters, filterProperty);
      }
    },
    [
      tail,
      onFilterUpdate,
      config.property,
      config.filterProperty,
      isSliceSelected,
      selectedFilters,
    ],
  );

  return {
    aggData,
    chartType,
    chartAdapter,
    bucketedData,
    drillStack,
    facetData,
    hasEmptyData: facetData?.length === 0,
    handleBack,
    handleSliceClick,
    isSliceSelected,
    setPreferredChartType,
  };
};
