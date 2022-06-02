import React, { useEffect, useRef, useState } from 'react';
import {
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  Box,
  Button,
  Checkbox,
  CheckboxGroup,
  Flex,
  Heading,
  SearchInput,
  UnorderedList,
  ListItem,
  Text,
} from 'nde-design-system';
import { filterFilterList } from '../helpers';
import { formatNumber } from 'src/utils/helpers';
import { FaMinus, FaPlus } from 'react-icons/fa';

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
        <Text fontWeight='light' wordBreak='break-word'>
          {term.charAt(0).toUpperCase() + term.slice(1)}
          <Text as='span' fontWeight='semibold' ml={1}>
            {count ? `(${formatNumber(count)})` : '-'}
          </Text>
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
  const { items, hasMore }: { items: filterValue[]; hasMore: boolean } =
    filterFilterList(values, searchTerm, numItems);

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
    <AccordionItem borderColor={'page.alt'} borderTopWidth='2px'>
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
              <Box flex='1' textAlign='left'>
                <Heading size='sm' fontWeight='semibold'>
                  {name}
                </Heading>
              </Box>
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
            pb={0}
            borderLeft='4px solid'
            borderColor='accent.bg'
          >
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
              mt={4}
            >
              {/* List of filters available */}
              <UnorderedList
                direction='column'
                ml={0}
                my={2}
                borderLeft='1px solid'
                borderColor='gray.200'
              >
                <CheckboxGroup
                  value={selectedFilters}
                  onChange={handleSelectedFilters}
                >
                  {items?.length === 0 && (
                    <ListItem p={2} py={1}>
                      <Text>No filters available.</Text>
                    </ListItem>
                  )}
                  {items?.map(({ term, count }, i) => {
                    return (
                      <ListItem
                        key={term}
                        p={2}
                        py={2}
                        my={1}
                        bg={i % 2 ? 'blackAlpha.50' : 'white'}
                        d='flex'
                        alignItems='center'
                      >
                        <FilterItem term={term} count={count} />
                      </ListItem>
                    );
                  })}
                </CheckboxGroup>
              </UnorderedList>
            </Box>

            {hasMore && items.length !== 0 && (
              <ListItem d='flex' justifyContent='center' borderColor='gray.200'>
                <Button
                  variant='link'
                  color='link.color'
                  isDisabled={!hasMore}
                  size='sm'
                  onClick={() => setNumItems(numItems + 5)}
                  w='100%'
                  p={4}
                >
                  (show more...)
                </Button>
              </ListItem>
            )}
          </AccordionPanel>
        </>
      )}
    </AccordionItem>
  );
};
