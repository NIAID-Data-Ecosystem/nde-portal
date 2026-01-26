import { Flex, SimpleGrid } from '@chakra-ui/react';
import { SearchState, VizConfig } from './types';
import { VisualizationCard } from './components/visualization-card';

interface SummaryGridProps {
  // Ids of visualizations are currently enabled / visible
  activeVizIds: string[];
  // Search parameters from URL
  searchParams: SearchState;
  // What happens on filter update from visualization interaction
  onFilterUpdate?: (values: string[], facet: string) => void;
  // All available visualization configs
  configs: VizConfig[];
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
            onFilterUpdate={props.onFilterUpdate}
          />
        ))}
      </SimpleGrid>
    </Flex>
  );
};

export default SummaryGrid;
