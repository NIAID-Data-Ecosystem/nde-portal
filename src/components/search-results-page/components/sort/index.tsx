import React from 'react';
import { Box, Flex, Select } from 'nde-design-system';
import { SortOptionsInterface } from 'src/components/search-results-page';

/*
 [COMPONENT INFO]: SortResults
 Handles sorting("sort by" and sort order) for search results.
 Handles number of items to display per page.
*/

interface SortResultsProps {
  // Number of items to display in a page
  selectedPerPage: number;
  // Sort by options
  sortOptions: readonly SortOptionsInterface[];
  // Sort order of results
  sortOrder: string;
  // Handler fn for items per page.
  handleSelectedPerPage: (pageNumber: number) => void;
  // Handler fn for updating sort order
  handleSortOrder: (sort: string) => void;
}

export const SortResults: React.FC<SortResultsProps> = ({
  selectedPerPage,
  handleSelectedPerPage,
  sortOrder,
  sortOptions,
  handleSortOrder,
}) => {
  const showPerPageOptions = [10, 50, 100];
  /*
  Tooltip describing the sort by option as requested:
  https://github.com/NIAID-Data-Ecosystem/nde-portal/issues/90
  */
  const getTooltip = (sortBy: SortOptionsInterface['sortBy']) => {
    if (sortBy === '_score') {
      return 'Sort by relevancy.';
    } else if (sortBy === 'date') {
      return 'Sort by most recent activity (created, published or modified).';
    } else if (sortBy === 'name') {
      return 'Sort alphabetically by title.';
    }
    return '';
  };
  return (
    <Flex flexDirection={['column', 'row']} flex={1} bg='white'>
      {/* Sort Order dropdown. */}
      <Box mr={[0, 2]}>
        <label htmlFor='sorting-order-select' title='Sort order'></label>
        <Select
          id='sorting-order-select'
          aria-label='Select sort order'
          borderRadius='semi'
          bg='white'
          value={sortOrder}
          cursor='pointer'
          my={1}
          _hover={{ boxShadow: 'low' }}
          onChange={e => handleSortOrder(e.target.value)}
          size='md'
        >
          {sortOptions.map(option => {
            return (
              <option
                title={getTooltip(option.sortBy)}
                key={`${option.sortBy}-${option.orderBy}`}
                value={`${option.orderBy === 'desc' ? '-' : ''}${
                  option.sortBy
                }`}
              >
                {option.name}
              </option>
            );
          })}
        </Select>
      </Box>

      {/* Show Per Page dropdown. */}
      <Box>
        <label htmlFor='show-per-page-select' title='Show per page'></label>
        <Select
          id='show-per-page-select'
          aria-label='Select show items per page'
          borderRadius='semi'
          bg='white'
          cursor='pointer'
          value={selectedPerPage}
          my={1}
          size='md'
          _hover={{ boxShadow: 'low' }}
          onChange={e => handleSelectedPerPage(+e.target.value)}
        >
          {showPerPageOptions.map(option => {
            return (
              <option key={option} value={option}>
                {option} results
              </option>
            );
          })}
        </Select>
      </Box>
    </Flex>
  );
};
