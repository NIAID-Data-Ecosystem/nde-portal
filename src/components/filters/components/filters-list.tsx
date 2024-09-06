import React, { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Flex,
  Icon,
  keyframes,
  UnorderedList,
  ListItem,
  CheckboxGroup,
  Text,
  usePrefersReducedMotion,
} from '@chakra-ui/react';
import { SearchInput } from 'src/components/search-input';
import { FilterTerm } from '../types';
import { FiltersCheckbox } from './filters-checkbox';
import { FaArrowDown } from 'react-icons/fa6';
import { ScrollContainer } from 'src/components/scroll-container';
import { useRepoData } from 'src/hooks/api/useRepoData';
import { Domain } from 'src/utils/api/types';

/*
[COMPONENT INFO]:
Filter list handles the number of items to show in list (expanded option).
Filter list handles the searching of filter items.
*/

interface FiltersList {
  colorScheme: string;
  // list of filter terms to display.
  terms: FilterTerm[];
  // Search input placeholder text -- also used for aris-label.
  searchPlaceholder: string;
  // Currently selected filters
  selectedFilters: string[];
  // fn to update filter selection
  handleSelectedFilters: (arg: string[]) => void;
  // data loading states
  isLoading: boolean;
  isUpdating?: boolean;
  property: string;
  filterName: string;
}
const bounce = keyframes`
  0%, 20%, 50%, 80%, 100% {
      transform: translateY(0);
  }
  40% {
      transform: translateY(-10px);
  }
  60% {
      transform: translateY(-5px);
  }
`;
export const FiltersList: React.FC<FiltersList> = React.memo(
  ({
    colorScheme,
    searchPlaceholder,
    selectedFilters,
    terms,
    handleSelectedFilters,
    filterName,
    isLoading,
    isUpdating,
    property,
  }) => {
    const { data: repositories } = useRepoData({
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      enable: property === 'includedInDataCatalog',
    });

    const prefersReducedMotion = usePrefersReducedMotion();

    const animation = prefersReducedMotion
      ? undefined
      : `${bounce} 1 1.5s ease-in-out`;
    /****** Limit List Items ******/
    // Toggle number of items to show from reduced view to "all" view.
    const NUM_ITEMS_MIN = 5;
    const [showFullList, setShowFullList] = useState(false);

    /****** Search handling ******/
    // Term to filter the filters with.
    const [searchTerm, setSearchTerm] = useState('');
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void =>
      setSearchTerm(e.target.value);

    const items: FilterTerm[] = useMemo(
      () =>
        terms?.length > 0
          ? terms.filter(t =>
              t.displayAs.toLowerCase().includes(searchTerm.toLowerCase()),
            )
          : isLoading
          ? Array(NUM_ITEMS_MIN).fill('') // for loading skeleton purposes
          : [],
      [terms, searchTerm, isLoading],
    );

    /****** Special case for sources where items are grouped by their domain ******/
    const sources = useMemo(
      () =>
        items.reduce((acc, item) => {
          if (item.term === '_exists_') {
            return acc;
          }
          const domain =
            repositories?.find(r => r._id === item.term)?.domain ||
            'Generalist';

          if (!acc[domain]) {
            acc[domain] = [];
          }
          acc[domain].push(item);
          return acc;
        }, {} as { [key in Domain]: FilterTerm[] }),
      [items, repositories],
    );

    return (
      <>
        {/* Search through filter terms */}

        <Box>
          <SearchInput
            ariaLabel={`Search filter ${searchPlaceholder} terms`}
            placeholder={searchPlaceholder}
            maxW='unset'
            size='sm'
            value={searchTerm}
            handleChange={handleSearchChange}
            colorScheme={colorScheme}
            onClose={() => setSearchTerm('')}
          />
        </Box>
        <Box w='100%' my={4}>
          {/* List of filters available narrowed based on search and expansion toggle */}
          <ScrollContainer
            flexDirection='column'
            ml={0}
            my={2}
            maxH={showFullList ? 460 : 400}
            overflowY='auto'
          >
            {!isLoading && !isUpdating && !items.length && (
              <Box p={2}>No available filters.</Box>
            )}
            <CheckboxGroup
              value={selectedFilters}
              onChange={handleSelectedFilters}
            >
              {property === 'includedInDataCatalog' ? (
                <Box>
                  {Object.entries(sources)
                    ?.sort((a, b) => {
                      // IID should always be first, NIAID request
                      if (a[0] == 'IID') return -1;
                      if (b[0] == 'IID') return 1;
                      return a[0].localeCompare(b[0]);
                    })

                    .map(([domain, repos]) => {
                      const label =
                        domain === 'iid'
                          ? 'IID Domain Repositories'
                          : domain.charAt(0).toUpperCase() +
                            domain.slice(1) +
                            ' Repositories';
                      return (
                        <React.Fragment key={domain}>
                          <Text fontSize='sm' fontWeight='semibold' my={1}>
                            {label}
                          </Text>
                          <UnorderedList ml={0}>
                            {repos
                              .sort((a, b) => b.count - a.count)
                              .map((item, i) => {
                                return (
                                  <ListItem
                                    key={item.term}
                                    p={2}
                                    py={0}
                                    my={0}
                                    _hover={{ bg: `${colorScheme}.50` }}
                                  >
                                    <FiltersCheckbox
                                      value={item.term}
                                      displayTerm={item.displayAs}
                                      count={item.count}
                                      isLoading={isLoading}
                                      isCountUpdating={isUpdating}
                                      filterName={filterName}
                                    />
                                  </ListItem>
                                );
                              })}
                          </UnorderedList>
                        </React.Fragment>
                      );
                    })}
                </Box>
              ) : (
                <UnorderedList ml={0}>
                  {items
                    .sort((a, b) => b.count - a.count)
                    .slice(0, showFullList ? items.length : 5)
                    .map((item, i) => {
                      return (
                        <ListItem
                          key={i}
                          p={2}
                          py={0}
                          my={0}
                          _hover={{ bg: `${colorScheme}.50` }}
                        >
                          <FiltersCheckbox
                            value={item.term}
                            displayTerm={item.displayAs}
                            count={item.count}
                            isLoading={isLoading}
                            isCountUpdating={isUpdating}
                            property={property}
                            filterName={filterName}
                          />
                        </ListItem>
                      );
                    })}
                </UnorderedList>
              )}
            </CheckboxGroup>
          </ScrollContainer>
        </Box>
        {/* Show more expansion button. */}
        {items.length > NUM_ITEMS_MIN &&
          property !== 'includedInDataCatalog' && (
            <Flex
              w='100%'
              justifyContent='space-between'
              borderColor='gray.200'
              alignItems='center'
            >
              <Button
                variant='link'
                color='link.color'
                size='sm'
                padding={2}
                onClick={() => setShowFullList(!showFullList)}
              >
                {showFullList ? 'Show less' : 'Show all'}
              </Button>
              <Icon
                as={FaArrowDown}
                animation={showFullList ? animation : undefined}
                color={showFullList ? 'gray.800' : 'gray.400'}
              />
            </Flex>
          )}
      </>
    );
  },
);
