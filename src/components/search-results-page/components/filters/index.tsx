import React from 'react';
import {useQuery} from 'react-query';
import {
  Facet,
  FacetTerm,
  FetchSearchResultsResponse,
} from 'src/utils/api/types';
import {
  Accordion,
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Flex,
  Heading,
  useDisclosure,
  useBreakpointValue,
  Icon,
} from 'nde-design-system';
import LoadingSpinner from 'src/components/loading';
import {Filter} from './components/filter';
import {fetchSearchResults} from 'src/utils/api';
import {FaFilter} from 'react-icons/fa';
import {NAV_HEIGHT} from 'src/components/page-container';

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
  };
} = {
  '@type': {name: 'Type'},
  'includedInDataCatalog.name': {name: 'Source'},
  keywords: {name: 'Keywords'},
  'measurementTechnique.name': {
    name: 'Measurement Technique',
  },
  variableMeasured: {name: 'Variable Measured'},
};

export type SelectedFilterType = {
  [key: string]: (string | number)[];
};

interface Filters {
  // Search query term
  searchTerm: string;
  // Facets that update as the filters are selected
  facets?: {isLoading: boolean; data?: Facet};
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
  const {isOpen, onOpen, onClose} = useDisclosure();
  const btnRef = React.useRef(null);
  const screenSize = useBreakpointValue({
    base: 'mobile',
    sm: 'tablet',
    md: 'desktop',
  });

  /*
    Filters are created based on the query string and only the counts update only when different filters are selected.
  */
  const {isLoading, data, error} = useQuery<
    FetchSearchResultsResponse | undefined,
    Error
  >(
    ['search-filters', {q: searchTerm}],
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
    {refetchOnWindowFocus: false},
  );

  // Fn for updating the filter items count when a filter checkbox is toggled.
  const updateFilterValues = (
    items: FacetTerm[],
    facets: {data?: FacetTerm[]; isLoading?: boolean},
  ) => {
    return items?.map(({term, count}) => {
      let updatedCount;
      if (!facets?.isLoading && facets?.data) {
        const updated = facets?.data.find(f => f.term === term);
        updatedCount = updated ? updated?.count || count : 0;
      }

      return {count: updatedCount, term};
    });
  };

  const content = (
    <>
      <Flex justifyContent='space-between' px={4} py={4} alignItems='center'>
        <Heading size='md' fontWeight='semibold' py={[4, 4, 0]}>
          Filters
        </Heading>

        {/* Clear all currently selected filters */}
        <Button
          colorScheme='secondary'
          variant='outline'
          size='sm'
          onClick={removeAllFilters}
          isDisabled={!!removeAllFilters}
        >
          clear all
        </Button>
      </Flex>
      {error ? (
        // Error message.
        <Flex p={4} bg={'status.error'}>
          <Heading size={'sm'} color='white' fontWeight='semibold'>
            Something went wrong, unable to load filters. <br />
            Try reloading the page.
          </Heading>
        </Flex>
      ) : (
        <Accordion bg={'white'} allowMultiple defaultIndex={[0]}>
          {data?.facets ? (
            Object.keys(filtersConfig).map(prop => {
              if (!data.facets[prop]) {
                return null;
              }
              return (
                <Filter
                  key={prop}
                  name={filtersConfig[prop].name}
                  values={updateFilterValues(data.facets[prop].terms, {
                    isLoading: facetsData?.isLoading,
                    data: facetsData?.data?.[prop].terms,
                  })}
                  selectedFilters={selectedFilters[prop]}
                  handleSelectedFilters={v =>
                    handleSelectedFilters({[prop]: v})
                  }
                />
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
        display='block'
        bg='accent.bg'
        onClick={onOpen}
        position='fixed'
        zIndex={50}
        bottom={50}
        boxShadow='high'
        w='3.5rem'
        h='3.5rem'
        p={0}
        transition='0.3s ease-in-out !important'
        overflow='hidden'
        justifyContent={'start'}
        _hover={{
          display: 'inline-flex',
          width: '12rem',
          overflow: 'visible',
          transition: '0.3s ease-in-out !important',
        }}
      >
        <Flex
          w='3.5rem'
          minW='3.5rem'
          h='3.5rem'
          alignItems='center'
          justifyContent='center'
        >
          <Icon as={FaFilter} boxSize={5} mx={2} />
        </Flex>
        <Heading pl={3} size='h6' color='white' fontWeight='semibold'>
          Show filters
        </Heading>
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
