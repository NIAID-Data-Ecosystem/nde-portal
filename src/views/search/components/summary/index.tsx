import { Accordion, Flex, Icon, SimpleGrid, Text } from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';
import { FaMinus, FaPlus } from 'react-icons/fa6';
import { InfoLabel } from 'src/components/info-label';
import { FiltersDisclaimer } from 'src/views/search/components/filters/components/filters-chart-toggle';

import { FilterConfig } from '../filters';
import { SelectedFilterType } from '../filters/types';
import { SelectedFilterValueType } from '../filters/types';
import { VisualizationCard } from './components/visualization-card';
import { SearchState } from './types';

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
const STORAGE_KEY = 'nde-visual-summary-open';
const DEFAULT_OPEN = 'item-0';
const getStoredAccordionState = (): string[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      return JSON.parse(stored);
    }
  } catch {}
  return [DEFAULT_OPEN];
};

const SummaryGrid = (props: SummaryGridProps) => {
  const [accordionIndex, setAccordionIndex] = useState<string[]>(
    getStoredAccordionState,
  );
  const prevVizIdsLength = useRef(props.activeVizIds.length);

  // Open the accordion when a new chart is added
  useEffect(() => {
    if (props.activeVizIds.length > prevVizIdsLength.current) {
      setAccordionIndex([DEFAULT_OPEN]);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([DEFAULT_OPEN]));
      } catch {}
    }
    prevVizIdsLength.current = props.activeVizIds.length;
  }, [props.activeVizIds]);

  const handleAccordionChange = (index: string | string[]) => {
    const next = typeof index === 'string' ? [index] : index;
    setAccordionIndex(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
  };

  return (
    <Flex direction='column' width='100%' bg='white' p={4} gap={1}>
      {props.activeVizIds.length > 0 && (
        <Accordion.Root
          collapsible
          value={accordionIndex}
          onValueChange={({ value: value }) => handleAccordionChange(value)}
        >
          <Accordion.Item border='none' value='item-0'>
            <Accordion.ItemContext>
              {/* Section header with tooltip */}
              {({ expanded }) => (
                <>
                  <h2>
                    <Accordion.ItemTrigger
                      px={0}
                      _hover={{ bg: 'transparent' }}
                    >
                      <Flex
                        flexDirection='column'
                        width='100%'
                        alignItems='flex-start'
                        px={1}
                      >
                        <InfoLabel
                          tooltipProps={{
                            content: (
                              <Flex direction='column' gap={2}>
                                <Text>
                                  A visual summary of your search results.
                                  Interact with the charts and/or the filters
                                  list on the left to filter your results.
                                </Text>
                                <Text>
                                  The visual summary charts are based on the{' '}
                                  <Text as='span' fontWeight='bold'>
                                    top 100 facet values
                                  </Text>{' '}
                                  (e.g., sources, pathogen species) in your
                                  search and may not reflect the full
                                  distribution of your search results.
                                </Text>
                              </Flex>
                            ),
                          }}
                          fontSize='sm'
                          fontWeight='semibold'
                        >
                          Visual Summary
                        </InfoLabel>
                        <FiltersDisclaimer />
                      </Flex>
                      <Icon
                        as={expanded ? FaMinus : FaPlus}
                        fontSize='xs'
                        aria-label={expanded ? 'Collapse' : 'Expand'}
                      />
                    </Accordion.ItemTrigger>
                  </h2>

                  <Accordion.ItemContent px={0} animation='none'>
                    <Accordion.ItemBody>
                      <SimpleGrid
                        templateColumns={{
                          base: 'repeat(auto-fill, minmax(325px, 1fr))',
                          '2xl': 'repeat(3, minmax(325px, 1fr))',
                        }}
                        gap={4}
                        mt={2}
                      >
                        {/* Map over config to render visualizations - only for configs with chart config */}
                        {props.configs
                          .filter(config => !!config.chart)
                          .map(config => {
                            // Use filterProperty if provided, otherwise fall back to property
                            const filterKey =
                              config.filterProperty || config.property;
                            return (
                              <VisualizationCard
                                key={config.id}
                                config={config}
                                searchState={props.searchParams}
                                isActive={props.activeVizIds.includes(
                                  config.id,
                                )}
                                removeActiveVizId={props.removeActiveVizId}
                                onFilterUpdate={props.onFilterUpdate}
                                selectedFilters={
                                  props.selectedFilters[filterKey] || []
                                }
                              />
                            );
                          })}
                      </SimpleGrid>
                    </Accordion.ItemBody>
                  </Accordion.ItemContent>
                </>
              )}
            </Accordion.ItemContext>
          </Accordion.Item>
        </Accordion.Root>
      )}
    </Flex>
  );
};

export default SummaryGrid;
