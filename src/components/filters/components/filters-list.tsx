import React, { useState } from 'react';
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
import REPOS from 'configs/repositories.json';
import { FaArrowDown } from 'react-icons/fa';
import { ScrollContainer } from 'src/components/scroll-container';

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
    isLoading,
    isUpdating,
    property,
  }) => {
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

    const items: FilterTerm[] =
      terms?.length > 0
        ? terms.filter(t =>
            t.displayAs.toLowerCase().includes(searchTerm.toLowerCase()),
          )
        : isLoading
        ? Array(NUM_ITEMS_MIN).fill('') // for loading skeleton purposes
        : [];

    const iid_sources =
      property === 'includedInDataCatalog'
        ? items
            .filter(item => {
              const repo = REPOS.repositories.find(r => r.id === item.term);
              return repo && repo.type === 'iid';
            })
            .sort((a, b) => a.displayAs.localeCompare(b.displayAs))
            .sort((a, b) => b.count - a.count)
        : [];

    const generalist_sources =
      property === 'includedInDataCatalog'
        ? items
            .filter(item => {
              const repo = REPOS.repositories.find(r => r.id === item.term);
              return repo && repo.type === 'generalist';
            })
            .sort((a, b) => a.displayAs.localeCompare(b.displayAs))
            .sort((a, b) => b.count - a.count)
        : [];
    return (
      <>
        {/* Search through filter terms */}

        <Box>
          <SearchInput
            ariaLabel={`Search filter ${searchPlaceholder} terms`}
            placeholder={searchPlaceholder}
            maxW='unset'
            size='md'
            value={searchTerm}
            handleChange={handleSearchChange}
            colorScheme={colorScheme}
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
                <>
                  {/* IID repos */}
                  {iid_sources.length > 0 && (
                    <Box>
                      <Text fontSize='sm' fontWeight='semibold' my={1}>
                        {
                          REPOS.repositoryTypes.find(
                            repo => repo.type === 'iid',
                          )?.label
                        }
                      </Text>
                      <UnorderedList>
                        {iid_sources.map((item, i) => {
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
                              />
                            </ListItem>
                          );
                        })}
                      </UnorderedList>
                    </Box>
                  )}
                  {generalist_sources.length > 0 && (
                    <>
                      <Text fontSize='sm' fontWeight='semibold' my={1}>
                        {
                          REPOS.repositoryTypes.find(
                            repo => repo.type === 'generalist',
                          )?.label
                        }
                      </Text>
                      <UnorderedList>
                        {generalist_sources
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
                                />
                              </ListItem>
                            );
                          })}
                      </UnorderedList>
                    </>
                  )}
                </>
              ) : (
                <>
                  <UnorderedList>
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
                            />
                          </ListItem>
                        );
                      })}
                  </UnorderedList>
                </>
              )}
            </CheckboxGroup>
          </ScrollContainer>
        </Box>
        {/* Show more expansion button. */}
        {items.length > NUM_ITEMS_MIN && (
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
