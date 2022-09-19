import React, { useMemo } from 'react';
import { useQuery } from 'react-query';
import {
  Facet,
  FacetTerm,
  FetchSearchResultsResponse,
} from 'src/utils/api/types';
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Flex,
  Heading,
  Text,
  useDisclosure,
  useBreakpointValue,
  Icon,
} from 'nde-design-system';
import LoadingSpinner from 'src/components/loading';
import { Filter } from 'src/components/filter';
import { fetchSearchResults } from 'src/utils/api';
import { FaFilter } from 'react-icons/fa';
import { NAV_HEIGHT } from 'src/components/page-container';
import { formatDate, formatType } from 'src/utils/api/helpers';
import { FaMinus, FaPlus } from 'react-icons/fa';
import { MetadataIcon, MetadataToolTip } from 'src/components/icon';
import { getMetadataColor } from 'src/components/icon/helpers';

/*
[COMPONENT INFO]:
  Fetches all filters based on initial query string.
  Note: only the counts are updated when the user toggles a filter.
*/

// Default facet size
export const FACET_SIZE = 1000;

// Config for the naming/text of a filter.
export const filtersConfig: {
  [key: string]: {
    name: string;
    glyph?: string;
    property?: string;
  };
} = {
  '@type': { name: 'Type' },
  'includedInDataCatalog.name': { name: 'Source' },
  date: { name: 'Date ', glyph: 'date', property: 'date' },
  keywords: { name: 'Keywords' },
  'measurementTechnique.name': {
    name: 'Measurement Technique',
    glyph: 'measurementTechnique',
    property: 'measurementTechnique',
  },
  variableMeasured: {
    name: 'Variable Measured',
    glyph: 'variableMeasured',
    property: 'variableMeasured',
  },
  'funding.funder.name': {
    name: 'Funding',
    glyph: 'funding',
    property: 'funding',
  },
  'healthCondition.name': {
    name: 'Health Condition',
    glyph: 'healthCondition',
    property: 'healthCondition',
  },
  'infectiousAgent.name': {
    name: 'Pathogen',
    glyph: 'infectiousAgent',
    property: 'infectiousAgent',
  },
  'species.name': { name: 'Species', glyph: 'species', property: 'species' },
};

export type SelectedFilterType = {
  [key: string]: string[];
};

interface Filters {
  // Search query term
  searchTerm: string;
  // Facets that update as the filters are selected
  facets?: { isLoading: boolean; data?: Facet };
  // Currently selected filters
  selectedFilters: SelectedFilterType;
  // fn to remove all selected filters
  removeAllFilters?: () => void;
  // fn to update filter selection
  handleSelectedFilters: (arg: SelectedFilterType) => void;
}

export const Filters: React.FC<Filters> = ({
  searchTerm,
  removeAllFilters,
  facets: facetsData,
  selectedFilters,
  handleSelectedFilters,
}) => {
  // In mobile view, the filters are in a drawer.
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = React.useRef(null);
  const screenSize = useBreakpointValue({
    base: 'mobile',
    sm: 'tablet',
    md: 'desktop',
  });

  const { isLoading, data, error } = useQuery<
    FetchSearchResultsResponse | undefined,
    Error
  >(
    ['search-filters', { q: searchTerm }],
    () => {
      if (typeof searchTerm !== 'string' && !searchTerm) {
        return;
      }

      return fetchSearchResults({
        q: searchTerm,
        facet_size: FACET_SIZE,
        facets: Object.keys(filtersConfig).join(','),
      });
    },
    // Don't refresh everytime window is touched.
    { refetchOnWindowFocus: false },
  );

  // Format term for display purposes
  const formatTerm = (prop: keyof Facet, term: string) => {
    if (prop === '@type') {
      return formatType(term);
    } else if (prop === 'date') {
      return formatDate(term);
    }
    return term;
  };
  // Fn for updating the filter items count when a filter checkbox is toggled.
  const updateFilterValues = (
    prop: keyof Facet,
    items: FacetTerm[],
    facets: { data?: FacetTerm[]; isLoading?: boolean },
  ) => {
    return items
      .map(({ term, count }) => {
        let updatedCount;
        if (!facets?.isLoading && facets?.data) {
          const updated = facets?.data.find(f => f.term === term);
          updatedCount = updated ? updated?.count || count : 0;
        }

        return {
          count: updatedCount,
          term: formatTerm(prop, term) || '',
        };
      })
      .sort((a, b) => {
        return (b?.count || 0) - (a?.count || 0);
      });
  };

  // on mount open the accordion where the selected filter resides
  const openAccordionIndex = useMemo(() => {
    let selectedKeys = Object.entries(selectedFilters)
      .filter(([_, v]) => v.length > 0)
      .map(o => Object.keys(filtersConfig).indexOf(o[0]));
    return selectedKeys.length > 0 ? selectedKeys : [0];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const content = (
    <>
      <Flex justifyContent='space-between' px={4} py={4} alignItems='center'>
        <Heading size='sm' fontWeight='semibold' py={[4, 4, 0]}>
          Filters
        </Heading>

        {/* Clear all currently selected filters */}
        <Button
          colorScheme='secondary'
          variant='outline'
          size='md'
          onClick={removeAllFilters}
          isDisabled={!removeAllFilters}
        >
          Clear All
        </Button>
      </Flex>
      {error ? (
        // Error message.
        <Flex p={4} bg='status.error'>
          <Heading size='sm' color='white' fontWeight='semibold'>
            Something went wrong, unable to load filters. <br />
            Try reloading the page.
          </Heading>
        </Flex>
      ) : (
        <Accordion bg='white' allowMultiple defaultIndex={openAccordionIndex}>
          {data?.facets ? (
            Object.keys(filtersConfig).map((prop, i) => {
              if (!data.facets[prop]) {
                return null;
              }
              return (
                <AccordionItem
                  key={prop}
                  borderColor='page.alt'
                  borderTopWidth='2px'
                >
                  {({ isExpanded }) => (
                    <>
                      <h2>
                        <AccordionButton
                          borderLeft='4px solid'
                          borderColor='gray.200'
                          py={4}
                          transition='all 0.2s linear'
                          _expanded={{
                            borderColor: 'accent.bg',
                            py: 2,
                            transition: 'all 0.2s linear',
                          }}
                        >
                          {/* Filter Name */}
                          <Flex
                            flex='1'
                            textAlign='left'
                            justifyContent='space-between'
                            alignItems='center'
                          >
                            <Heading size='sm' fontWeight='semibold'>
                              {filtersConfig[prop].name}
                            </Heading>
                            <MetadataToolTip
                              propertyName={filtersConfig[prop].property}
                              recordType='Dataset' // [NOTE]: Choosing dataset for general definition.
                            >
                              <MetadataIcon
                                id={`filter-${filtersConfig[prop].glyph}-${i}`}
                                mx={2}
                                glyph={filtersConfig[prop].glyph}
                                fill={getMetadataColor(
                                  filtersConfig[prop].glyph,
                                )}
                                boxSize={6}
                              ></MetadataIcon>
                            </MetadataToolTip>
                          </Flex>
                          {isExpanded ? (
                            <FaMinus fontSize='12px' />
                          ) : (
                            <FaPlus fontSize='12px' />
                          )}
                        </AccordionButton>
                      </h2>

                      <AccordionPanel
                        px={2}
                        py={4}
                        borderLeft='4px solid'
                        borderColor='accent.bg'
                      >
                        <Filter
                          key={prop}
                          name={filtersConfig[prop].name}
                          values={
                            updateFilterValues(prop, data.facets[prop].terms, {
                              isLoading: facetsData?.isLoading,
                              data: facetsData?.data?.[prop].terms,
                            }) || []
                          }
                          selectedFilters={selectedFilters[prop]}
                          handleSelectedFilters={v =>
                            handleSelectedFilters({ [prop]: v })
                          }
                        />
                      </AccordionPanel>
                    </>
                  )}
                </AccordionItem>
              );
            })
          ) : (
            <LoadingSpinner isLoading={isLoading}></LoadingSpinner>
          )}
        </Accordion>
      )}
    </>
  );

  return screenSize !== 'desktop' ? (
    <>
      {/* Styles of floating button from niaid design specs: https://designsystem.niaid.nih.gov/components/atoms */}
      <Button
        ref={btnRef}
        variant='solid'
        bg='accent.bg'
        onClick={onOpen}
        position='fixed'
        zIndex={50}
        left={4}
        bottom={50}
        boxShadow='high'
        w='3.5rem'
        h='3.5rem'
        p={0}
        transition='0.3s ease-in-out !important'
        overflow='hidden'
        justifyContent='flex-start'
        _hover={{
          width: '12rem',
        }}
      >
        <Flex
          w='3.5rem'
          minW='3.5rem'
          h='3.5rem'
          alignItems='center'
          justifyContent='center'
        >
          <Icon as={FaFilter} boxSize={5} ml={1} mr={2} />
        </Flex>
        <Text pl={2} color='white' fontWeight='semibold' fontSize='lg'>
          Filters
        </Text>
      </Button>
      <Drawer
        isOpen={isOpen}
        placement='left'
        onClose={onClose}
        finalFocusRef={btnRef}
        size={screenSize === 'mobile' ? 'full' : 'md'}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerBody px={[2, 4]} py={8}>
            {content}
          </DrawerBody>

          <DrawerFooter>
            <Button
              w='100%'
              variant='solid'
              m={3}
              onClick={onClose}
              colorScheme='secondary'
            >
              Close
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  ) : (
    <Box
      flex={1}
      minW='270px'
      maxW='400px'
      h='95vh'
      position='sticky'
      top={NAV_HEIGHT}
      boxShadow='base'
      background='white'
      borderRadius='semi'
      overflowY='auto'
    >
      {content}
    </Box>
  );
};
