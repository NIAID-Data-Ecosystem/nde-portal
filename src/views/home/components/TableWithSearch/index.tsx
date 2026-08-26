import { Box, Flex, SkeletonText, Stack, Tag, Text } from '@chakra-ui/react';
import NextLink from 'next/link';
import React, { useCallback, useState } from 'react';
import { Link } from 'src/components/link';
import { SearchInput, SearchInputProps } from 'src/components/search-input';
import { Table } from 'src/components/table';
import { queryFilterObject2String } from 'src/views/search/components/filters/utils/query-string';
import { getTabIdFromTypeLabel } from 'src/views/search/components/filters/utils/tab-filter-utils';

import { Filters } from './filters/';
import { formatDomainName, formatTypeName } from './helpers';
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
  ariaLabel: string;
  caption: string;
  columns: Column[];
  data?: TableData[];
  loading?: boolean;
  getCells?: (props: {
    column: Column;
    data: any;
    loading?: boolean;
  }) => React.ReactNode;
  searchInputProps?: Partial<SearchInputProps>;
  emptyState?: React.ReactNode;
}

export const TableWithSearch: React.FC<TableWithSearchProps> = ({
  data = [],
  loading,
  columns,
  searchInputProps,
  emptyState,
  ...props
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
              size='md'
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
            <Stack
              direction='row'
              gap={2}
              flex={1}
              flexWrap='wrap'
              minW='300px'
            >
              {filters.length > 0 && (
                <Tag.Root
                  key='clear'
                  size='lg'
                  variant='outline'
                  borderRadius='full'
                  colorPalette='primary'
                  borderColor='primary.100'
                >
                  <Tag.Label>Clear all</Tag.Label>
                  <Tag.CloseTrigger onClick={() => setFilters([])} />
                </Tag.Root>
              )}
              {filters.map(filter => {
                const { name, property, value } = filter;
                return (
                  <Tag.Root
                    key={property + '-' + value}
                    size='lg'
                    variant='subtle'
                    borderRadius='full'
                    colorPalette='primary'
                  >
                    <Tag.Label fontWeight='medium'>{name}</Tag.Label>
                    <Tag.CloseTrigger
                      onClick={() => removeSingleFilter(filter)}
                    />
                  </Tag.Root>
                );
              })}
            </Stack>
          </Stack>

          {/* <!-- Table --> */}
          <Table
            emptyState={emptyState}
            stickyHeader
            data={loading ? Array(10).fill({}) : filteredData}
            tableHeadProps={{ bg: 'page.alt' }}
            getTableRowProps={(_, idx: number) => ({
              bg: idx % 2 ? 'page.alt' : 'white',
            })}
            tableContainerProps={{ overflowY: 'auto', maxHeight: '500px' }}
            getCells={props => <RepositoryCells {...props} loading={loading} />}
            columns={columns}
            {...props}
          />
        </Flex>
      )}
    </>
  );
};

interface Column {
  title: string;
  property: string;
  isSortable?: boolean;
  props?: any;
  fields?: (keyof TableData)[];
}
export const RepositoryCells = ({
  column,
  data,
  loading,
}: {
  column: Column;
  data: TableData;
  loading?: boolean;
}) => {
  const tab = data?.type?.includes('Computational Tool Repository')
    ? getTabIdFromTypeLabel('ComputationalTool')
    : undefined;

  return (
    <Flex id={`cell-${data._id}-${column.property}`} py={1}>
      {/* Repository/Resource Catalog name */}
      {column.property === 'name' && (
        <SkeletonText
          data-testid={loading ? 'loading' : 'loaded'}
          loading={!Boolean(!loading && data._id)}
          noOfLines={2}
          w='100%'
          fontSize='sm'
        >
          {data?.url ? (
            <Link asChild>
              <NextLink href={data.url} prefetch={false}>
                {data[column.property]}
              </NextLink>
            </Link>
          ) : (
            <Text>{data[column.property]}</Text>
          )}
        </SkeletonText>
      )}
      {/* Repository/Resource Catalog brief description */}
      {column.property === 'abstract' && (
        <SkeletonText
          data-testid={loading ? 'loading' : 'loaded'}
          loading={!Boolean(!loading && data._id)}
          gap='2'
          w='100%'
          fontSize='sm'
        >
          <Text lineClamp={3}>{data[column.property]}</Text>
        </SkeletonText>
      )}
      {/* Repository / Resource Catalog type, domain and conditions of access */}
      {(column.property === 'type' ||
        column.property === 'domain' ||
        column.property === 'conditionsOfAccess') && (
        <SkeletonText
          fontWeight='semibold'
          data-testid={loading ? 'loading' : 'loaded'}
          loading={!Boolean(!loading && data._id)}
          w='100%'
          h='100%'
          fontSize='sm'
          noOfLines={2}
        >
          {column.property === 'type' &&
            (data.type && data.type.length > 0
              ? data.type
                  .map(type => formatTypeName(type))
                  .sort((a, b) => a.localeCompare(b))
                  .join(', ')
              : '-')}
          {column.property === 'domain' &&
            (data.domain
              ? formatDomainName(data.domain)
                  .sort((a, b) => a.localeCompare(b))
                  .join(', ')
              : '-')}
          {column.property === 'conditionsOfAccess' &&
            (data['conditionsOfAccess']
              ? `${data['conditionsOfAccess']}`
              : '-')}
        </SkeletonText>
      )}
    </Flex>
  );
};
