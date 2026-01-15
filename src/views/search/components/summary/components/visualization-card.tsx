import { SearchFilter, SearchState, VizConfig } from '../types';
import { useAggregationQuery } from '../hooks/useAggregationQuery';
import { normalizeAggregateData } from '../helpers';

type VisualizationCardProps = {
  config: VizConfig;

  searchState: SearchState;

  isActive: boolean;

  onAddFilter: (filter: SearchFilter) => void;
};

export const VisualizationCard = (props: VisualizationCardProps) => {
  const { config, searchState, isActive, onAddFilter } = props;

  // Fetch aggregation data based on the config and search state.
  const aggData = useAggregationQuery({
    property: config.property,
    searchState,
    enabled: isActive,
  });

  // Normalize the aggregation data for chart consumption.
  const facets = normalizeAggregateData(aggData.data);

  return <div>Visualization Card</div>;
};
