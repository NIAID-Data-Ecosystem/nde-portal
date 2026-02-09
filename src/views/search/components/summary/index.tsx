import { Flex, SimpleGrid } from '@chakra-ui/react';
import { SearchState, VizConfig } from './types';
import { VisualizationCard } from './components/visualization-card';
import { SelectedFilterType } from '../filters/types';

interface SummaryGridProps {
  // Ids of visualizations are currently enabled / visible
  activeVizIds: string[];
  // Id of visualizations to be removed from display
  removeActiveVizId: (vizId: string) => void;
  // Search parameters from URL
  searchParams: SearchState;
  // What happens on filter update from visualization interaction
  onFilterUpdate?: (values: string[], facet: string) => void;
  // All available visualization configs
  configs: VizConfig[];
  // Currently selected filters
  selectedFilters: SelectedFilterType;
}
const SummaryGrid = (props: SummaryGridProps) => {
  return (
    <Flex direction='column' width='100%' bg='white'>
      <SimpleGrid minChildWidth='300px' spacing={4} p={4}>
        {/* Map over config to render visualizations.*/}
        {props.configs.map(config => (
          <VisualizationCard
            key={config.id}
            config={config}
            searchState={props.searchParams}
            isActive={props.activeVizIds.includes(config.id)}
            removeActiveVizId={props.removeActiveVizId}
            onFilterUpdate={props.onFilterUpdate}
            selectedFilters={props.selectedFilters[config.property] || []}
          />
        ))}
      </SimpleGrid>
    </Flex>
  );
};

export default SummaryGrid;
