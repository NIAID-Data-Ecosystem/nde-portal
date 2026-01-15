import { SearchFilter, SearchState, VizConfig } from '../types';
import { useAggregationQuery } from '../hooks/useAggregationQuery';

type VisualizationCardProps = {
  config: VizConfig;

  searchState: SearchState;

  isActive: boolean;

  onAddFilter: (filter: SearchFilter) => void;
};

export const VisualizationCard = (props: VisualizationCardProps) => {
  const { config, searchState, isActive, onAddFilter } = props;

  // Fetch aggregation data based on the config and search state.
  const agg = useAggregationQuery({
    property: config.property,
    searchState,
    enabled: isActive,
  });

  return <div>Visualization Card</div>;
};
