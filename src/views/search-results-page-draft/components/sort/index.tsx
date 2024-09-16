import React from 'react';
import { Select, SelectProps, Stack, VisuallyHidden } from '@chakra-ui/react';
import { SORT_OPTIONS, SortOptionsInterface } from './helpers';

/*
 [COMPONENT INFO]: SortDropdown
 Handles sorting("sort by" and sort order) for search results.
 Handles number of items to display per page.
*/

interface SortDropdownProps {
  // size of select element
  size?: SelectProps['size'];
  // Number of items to display in a page
  selectedPerPage: number;
  // Sort order of results
  sortOrder: string;
  // Handler fn for items per page.
  handleSelectedPerPage: (pageNumber: number) => void;
  // Handler fn for updating sort order
  handleSortOrder: (sort: string) => void;
}

export const SortDropdown: React.FC<SortDropdownProps> = React.memo(
  ({
    selectedPerPage,
    size = 'sm',
    sortOrder,
    handleSelectedPerPage,
    handleSortOrder,
  }) => {
    const showPerPageOptions = [10, 50, 100];
    /*
  Tooltip describing the sort by option as requested:
  https://github.com/NIAID-Data-Ecosystem/nde-portal/issues/90
  */
    const getTooltip = (sortBy: SortOptionsInterface['sortBy']) => {
      if (sortBy === '_score') {
        return 'Sort by relevancy (field name is boosted).';
      } else if (sortBy === 'date') {
        return 'Sort by most recent activity (created, published or modified).';
      } else if (sortBy === 'name.raw') {
        return 'Sort alphabetically by title.';
      }
      return '';
    };
    return (
      <Stack flexDirection={{ base: 'column', sm: 'row' }} spacing={[1, 4]}>
        {/* Sort Order dropdown. */}
        <VisuallyHidden>
          <label htmlFor='sorting-order-select' title='Sort order'>
            Select sort order
          </label>
        </VisuallyHidden>
        <Select
          id='sorting-order-select'
          aria-label='Select sort order'
          bg='white'
          borderColor='gray.200'
          borderRadius='semi'
          cursor='pointer'
          _hover={{ boxShadow: 'low' }}
          onChange={e => {
            handleSortOrder(e.target.value);
          }}
          size={size}
          value={sortOrder}
        >
          {SORT_OPTIONS.map(option => {
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

        {/* Show Per Page dropdown. */}
        <VisuallyHidden>
          <label htmlFor='show-per-page-select' title='Show per page'>
            Show per page
          </label>
        </VisuallyHidden>
        <Select
          id='show-per-page-select'
          aria-label='Select show items per page'
          bg='white'
          borderColor='gray.200'
          borderRadius='semi'
          cursor='pointer'
          onChange={e => handleSelectedPerPage(+e.target.value)}
          size={size}
          value={selectedPerPage}
          _hover={{ boxShadow: 'low' }}
        >
          {showPerPageOptions.map(option => {
            return (
              <option key={option} value={option}>
                {option} results
              </option>
            );
          })}
        </Select>
      </Stack>
    );
  },
);
