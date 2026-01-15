import { ChartType, SearchFilter, SearchState, VizConfig } from '../types';
import { useAggregationQuery } from '../hooks/useAggregationQuery';
import { normalizeAggregateData } from '../helpers';
import { usePreferredChartType } from '../hooks/usePreferredChartType';
import { useEffect, useMemo } from 'react';

type VisualizationCardProps = {
  config: VizConfig;

  searchState: SearchState;

  isActive: boolean;

  onAddFilter: (filter: SearchFilter) => void;
};

export const VisualizationCard = (props: VisualizationCardProps) => {
  const { config, searchState, isActive, onAddFilter } = props;

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

  useEffect(() => {
    // If preferred chart type is no longer valid, reset to default.
    if (!config.chart.availableOptions.includes(preferredChartType)) {
      setPreferredChartType(config.chart.defaultOption);
    }
  }, [config.chart.availableOptions.join('|')]);

  // Fetch aggregation data based on the config and search state.
  const aggData = useAggregationQuery({
    property: config.property,
    searchState,
    enabled: isActive,
  });

  // Normalize the aggregation data for chart consumption.
  const facets = normalizeAggregateData(aggData.data);

  return (
    <div>
      <h2>Visualization Card</h2>
      {/* Add chart type selector */}
      {/* Add chart component */}
    </div>
  );
};
