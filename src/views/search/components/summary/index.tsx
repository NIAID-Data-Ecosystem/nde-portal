import { SimpleGrid } from '@chakra-ui/react';
import { SearchState, VizConfig } from './types';
import { VisualizationCard } from './components/visualization-card';

interface SummaryGridProps {
  // Ids of visualizations are currently enabled / visible
  activeVizIds: string[];
  // Search parameters from URL
  searchParams: SearchState;
  // What happens on filter update from visualization interaction
  onFilterUpdate?: (update: Record<string, any>) => void;
  // All available visualization configs
  configs: VizConfig[];
}
const SummaryGrid = (props: SummaryGridProps) => {
  return (
    <>
      <div>Summary Grid</div>
      <SimpleGrid columns={3} spacing={8}>
        {/* Map over config to render visualizations.*/}
        {props.configs.map(config => (
          <VisualizationCard
            key={config.id}
            config={config}
            searchState={props.searchParams}
            isActive={props.activeVizIds.includes(config.id)}
            onAddFilter={filter => {}}
          />
        ))}
      </SimpleGrid>
    </>
  );
};

export default SummaryGrid;
