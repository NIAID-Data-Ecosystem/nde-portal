import { SimpleGrid } from '@chakra-ui/react';
import { DefaultSearchQueryParams } from '../../config/defaultQuery';
import { VizConfig } from './types';

interface SummaryGridProps {
  // Ids of visualizations are currently enabled / visible
  activeVizIds: string[];
  // Search parameters from URL
  searchParams: DefaultSearchQueryParams;
  // What happens on filter update from visualization interaction
  onFilterUpdate?: (update: Record<string, any>) => void;
  // All available visualization configs
  configs: VizConfig[];
}
const SummaryGrid = (props: SummaryGridProps) => {
  return (
    <SimpleGrid columns={3} spacing={8}>
      Summary Grid
      {/* Map over config to render visualizations. Displaying the current component based on selection. */}
      {props.configs.map(config => (
        <div key={config.id}>{config.label}</div>
      ))}
    </SimpleGrid>
  );
};

export default SummaryGrid;
