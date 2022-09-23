import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  CheckboxGroup,
  Flex,
  SearchInput,
  UnorderedList,
  ListItem,
  Text,
} from 'nde-design-system';
import { formatNumber } from 'src/utils/helpers';

const FilterItem = ({
  term,
  count: termCount,
}: {
  term: string;
  count?: number;
}) => {
  // The count based on the initial query
  const [count, setCount] = useState(termCount);

  useEffect(() => {
    setCount(prev => {
      if (termCount === undefined) {
        return prev;
      }
      return termCount;
    });
  }, [termCount]);

  return (
    <Checkbox spacing={2} size='lg' value={term}>
      <Flex ml={1} fontSize='xs' lineHeight={1.5}>
        <Text fontWeight='light'>
          {term}
          {count !== undefined && (
            <Text as='span' fontWeight='semibold' ml={1}>
              {count ? `(${formatNumber(count)})` : '-'}
            </Text>
          )}
        </Text>
      </Flex>
    </Checkbox>
  );
};

type filterValue = {
  count?: number;
  term: string;
};

export interface FilterProps {
  // Formatted name of filter.
  name: string;
  // Facets terms and associated counts.
  values: filterValue[];
  // Currently selected filters
  selectedFilters: (string | number)[];
  // Fn for handling selected filters.
  handleSelectedFilters: (arg: any) => void;
}

export const Filter: React.FC<FilterProps> = ({
  name,
  values,
  selectedFilters,
  handleSelectedFilters,
}) => {
  // Term to filter the filters with.
  const [searchTerm, setSearchTerm] = useState('');

  // Sorts and filter the filter terms list based on search box.
  const NUM_ITEMS = 5;
  const [numItems, setNumItems] = useState(NUM_ITEMS);
  const { items, hasMore }: { items: filterValue[]; hasMore: boolean } = {
    items: values,
    hasMore: true,
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void =>
    setSearchTerm(e.target.value);

  // Scroll to bottom of filter values on 'show more'.
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref && ref.current) {
      ref.current.scrollTop =
        ref.current.scrollHeight - ref.current.clientHeight;
    }
  }, [numItems]);

  return (
    <>
      {/* Search through the filters */}
      <SearchInput
        ariaLabel={`Search filter ${name} terms`}
        maxW='unset'
        size='md'
        placeholder={`Search ${name.toLowerCase()} filters`}
        value={searchTerm}
        handleChange={handleSearchChange}
        colorScheme='primary'
      />
      <Box
        ref={ref}
        w='100%'
        maxH='250px'
        overflowY='auto'
        style={{ scrollBehavior: 'smooth' }}
        my={4}
      >
        {/* List of filters available */}
        <UnorderedList direction='column' ml={0} my={2}>
          <CheckboxGroup
            value={selectedFilters}
            onChange={handleSelectedFilters}
          >
            {items?.length === 0 && (
              <ListItem p={2} py={1}>
                <Text>No filters available.</Text>
              </ListItem>
            )}
            {items?.map(({ term, count }) => {
              return (
                <ListItem key={term} p={2} py={1}>
                  <FilterItem term={term} count={count} />
                </ListItem>
              );
            })}
          </CheckboxGroup>
        </UnorderedList>
      </Box>

      {hasMore && items.length !== 0 && (
        <Flex justifyContent='center' borderColor='gray.200'>
          <Button
            variant='link'
            color='link.color'
            isDisabled={!hasMore}
            size='sm'
            onClick={() => setNumItems(numItems + 5)}
          >
            (show more...)
          </Button>
        </Flex>
      )}
    </>
  );
};
