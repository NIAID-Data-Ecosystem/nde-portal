import { Flex, SimpleGrid, Text } from '@chakra-ui/react';
import { SearchState } from './types';
import { FilterConfig } from '../filters';
import { VisualizationCard } from './components/visualization-card';
import { SelectedFilterType } from '../filters/types';
import { InfoLabel } from 'src/components/info-label';
import { SelectedFilterValueType } from '../filters/types';
import { FiltersDisclaimer } from 'src/views/search/components/filters/components/filters-chart-toggle';

interface SummaryGridProps {
  // Ids of visualizations are currently enabled / visible
  activeVizIds: string[];
  // Id of visualizations to be removed from display
  removeActiveVizId: (vizId: string) => void;
  // Search parameters from URL
  searchParams: SearchState;
  // What happens on filter update from visualization interaction
  onFilterUpdate?: (values: SelectedFilterValueType[], facet: string) => void;
  // All available visualization configs
  configs: FilterConfig[];
  // Currently selected filters
  selectedFilters: SelectedFilterType;
}
const SummaryGrid = (props: SummaryGridProps) => {
  return (
    <Flex direction='column' width='100%' bg='white' p={4} gap={1}>
      {/* Section header with tooltip */}
      <Flex>
        <InfoLabel
          title='Visual Summary'
          tooltipText={
            <Flex direction='column' gap={2}>
              <Text>
                A visual summary of your search results. Interact with the
                charts and/or the filters list on the left to filter your
                results.
              </Text>
              <Text>
                The visual summary charts are based on the{' '}
                <Text as='span' fontWeight='bold'>
                  top 100 facet values
                </Text>{' '}
                (e.g., sources, pathogen species) in your search and may not
                reflect the full distribution of your search results.
              </Text>
            </Flex>
          }
          textProps={{ fontSize: 'sm', fontWeight: 'semibold' }}
          tooltipProps={{ hasArrow: true }}
        />
      </Flex>
      <FiltersDisclaimer />

      {props.activeVizIds.length > 0 && (
        <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={4} mt={2}>
          {/* Map over config to render visualizations - only for configs with chart config */}
          {props.configs
            .filter(config => !!config.chart)
            .map(config => {
              // Use filterProperty if provided, otherwise fall back to property
              const filterKey = config.filterProperty || config.property;
              return (
                <VisualizationCard
                  key={config.id}
                  config={config}
                  searchState={props.searchParams}
                  isActive={props.activeVizIds.includes(config.id)}
                  removeActiveVizId={props.removeActiveVizId}
                  onFilterUpdate={props.onFilterUpdate}
                  selectedFilters={props.selectedFilters[filterKey] || []}
                />
              );
            })}
        </SimpleGrid>
      )}
    </Flex>
  );
};

export default SummaryGrid;
