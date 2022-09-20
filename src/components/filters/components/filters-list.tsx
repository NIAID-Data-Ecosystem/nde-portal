import React, { useState } from 'react';
import {
  Box,
  Button,
  Flex,
  SearchInput,
  UnorderedList,
  ListItem,
  CheckboxGroup,
} from 'nde-design-system';
import { FilterTerm } from '../types';
import { FilterItem } from './filters-item';

/*
[COMPONENT INFO]:
Filter list handles the number of items to show in list (expanded option).
Filter list handles the searching of filter items.
*/

interface FiltersList {
  // list of filter terms to display.
  terms: FilterTerm[];
  // Search input placeholder text -- also used for aris-label.
  searchPlaceholder: string;
  // Currently selected filters
  selectedFilters: string[];
  // fn to update filter selection
  handleSelectedFilters: (arg: string[]) => void;
  isLoading: boolean;
}

export const FiltersList: React.FC<FiltersList> = ({
  searchPlaceholder,
  selectedFilters,
  terms,
  handleSelectedFilters,
  isLoading,
}) => {
  const [checkedItems, setCheckedItems] = useState([]);
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
      ? terms.filter(t => t.term.toLowerCase().includes(searchTerm))
      : isLoading
      ? Array(NUM_ITEMS_MIN).fill('') // for loading skeleton purposes
      : [];
  return (
    <>
      {/* Search through filter terms */}
      <SearchInput
        ariaLabel={`Search filter ${searchPlaceholder} terms`}
        placeholder={`Search ${searchPlaceholder.toLowerCase()} filters`}
        maxW='unset'
        size='md'
        value={searchTerm}
        handleChange={handleSearchChange}
        colorScheme='primary'
        pr={4}
      />
      <Box w='100%' my={4}>
        <UnorderedList
          direction='column'
          ml={0}
          my={2}
          maxH={400}
          overflowY='auto'
        >
          <CheckboxGroup
            value={selectedFilters}
            onChange={handleSelectedFilters}
          >
            {/* List of filters available narrowed based on search and expansion toggle */}
            {items
              .sort((a, b) => b.count - a.count)
              .slice(0, showFullList ? items.length : 5)
              .map((item, i) => {
                return (
                  <ListItem key={i} p={2} py={0} my={0}>
                    <FilterItem
                      term={item.term}
                      count={item.count}
                      isLoading={isLoading}
                    />
                  </ListItem>
                );
              })}
          </CheckboxGroup>
        </UnorderedList>
      </Box>
      {/* Show more expansion button. */}
      {items.length > NUM_ITEMS_MIN && (
        <Flex justifyContent='flex-start' borderColor='gray.200'>
          <Button
            variant='link'
            color='link.color'
            size='sm'
            padding={2}
            onClick={() => setShowFullList(!showFullList)}
          >
            {showFullList ? 'Show Less' : 'Show All'}
          </Button>
        </Flex>
      )}
    </>
  );
};
