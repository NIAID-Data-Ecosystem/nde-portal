import { Box, Flex, Stack, Tag, Text } from '@chakra-ui/react';
import React, { useCallback, useState } from 'react';
import { SearchInput } from 'src/components/search-input';
import {
  ColumnDef,
  DataTable,
  SortState,
} from 'src/components/table/data-table';

import { Filters } from './filters/';
import useFilteredData from './hooks/useFilteredData';

export interface TableData {
  _id: string;
  abstract?: string;
  name: string;
  conditionsOfAccess: string;
  domain: string | string[];
  type: string[];
  url?: string;
}
[];

interface TableWithSearchProps {
  /** The table's accessible name (its visually hidden caption). */
  label: string;
  /** Keep the array stable (a module constant): cells memoize on it. */
  columns: ColumnDef<TableData>[];
  data?: TableData[];
  loading?: boolean;
  /** Shown in the table when search and filters leave no rows. */
  emptyState?: React.ReactNode;
}

const INITIAL_SORT: SortState = { columnId: 'name', direction: 'asc' };
const getRowId = (row: TableData, index: number) => row._id || `row-${index}`;

export const TableWithSearch: React.FC<TableWithSearchProps> = ({
  data = [],
  loading,
  columns,
  emptyState,
  label,
}) => {
  /****** Handle Filters ******/
  const [filters, setFilters] = useState<
    { name: string; value: string; property: string }[]
  >([]);

  /****** Handle Search ******/
  const [searchTerm, setSearchTerm] = useState('');
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>): void =>
      setSearchTerm(e.target.value),
    [],
  );
  /****** Handle filtering and search on data ******/
  const filteredData = useFilteredData(data, searchTerm, filters);

  const removeSingleFilter = useCallback(
    (newFilter: { name: string; value: string; property: string }) => {
      setFilters(prevFilters => {
        // Check if filter is already added
        const index = prevFilters.findIndex(
          f => f.property === newFilter.property && f.value === newFilter.value,
        );
        if (index === -1) {
          // Add new filter
          return [...prevFilters, newFilter];
        } else {
          // Remove filter if it's already there
          return prevFilters.filter((_, i) => i !== index);
        }
      });
    },
    [],
  );

  return (
    <>
      {!loading && !data?.length ? (
        <Flex justifyContent='center'>
          <Text py={2}>No results found.</Text>
        </Flex>
      ) : (
        <Flex flexDirection='column'>
          <Stack
            direction='row'
            gap={2}
            mb={2}
            flexWrap='wrap'
            alignItems='center'
          >
            {/* <!-- Search Bar --> */}
            <SearchInput
              size='sm'
              placeholder='Search table'
              ariaLabel='Search table'
              value={searchTerm}
              handleChange={handleSearchChange}
              isResponsive={false}
              alignItems='flex-end'
              onClose={() => setSearchTerm('')}
            />
            {/* <!-- Filters --> */}
            <Filters data={data} filters={filters} setFilters={setFilters} />
          </Stack>

          <Stack direction='column' flexWrap='wrap' py={2} gap={2}>
            <Box>
              {/* <!-- Number of results --> */}
              <Text fontSize='sm' fontWeight='semibold' lineHeight='normal'>
                {filteredData.length} results
              </Text>
              <Text fontSize='xs' lineHeight='normal'>
                {filters.length > 0 ? 'Showing results filtered by:' : ''}
              </Text>
            </Box>

            {/* <!-- Filter Tags--> */}
            <Stack direction='row' flexWrap='wrap'>
              {filters.length > 0 && (
                <Tag.Root
                  key='clear-all'
                  size='md'
                  variant='outline'
                  borderRadius='full'
                  colorPalette='primary'
                  borderColor='primary.100'
                >
                  <Tag.Label>Clear all</Tag.Label>
                  <Tag.EndElement>
                    <Tag.CloseTrigger
                      aria-label='close'
                      onClick={() => setFilters([])}
                    />
                  </Tag.EndElement>
                </Tag.Root>
              )}
              {filters.map(filter => {
                const { name, property, value } = filter;
                return (
                  <Tag.Root
                    key={property + '-' + value}
                    size='md'
                    variant='subtle'
                    borderRadius='full'
                    colorPalette='primary'
                  >
                    <Tag.Label fontWeight='medium'>{name}</Tag.Label>
                    <Tag.EndElement>
                      <Tag.CloseTrigger
                        aria-label='close'
                        onClick={() => removeSingleFilter(filter)}
                      />
                    </Tag.EndElement>
                  </Tag.Root>
                );
              })}
            </Stack>
          </Stack>

          {/* <!-- Table --> */}
          <DataTable
            label={label}
            data={filteredData}
            columns={columns}
            getRowId={getRowId}
            sort={{ initial: INITIAL_SORT }}
            maxHeight='500px'
            skeletonRows={10}
            status={{ loading, empty: emptyState }}
          />
        </Flex>
      )}
    </>
  );
};
