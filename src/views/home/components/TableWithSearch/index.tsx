import { Box, Flex, Stack, Tag, Text } from '@chakra-ui/react';
import NextLink from 'next/link';
import React, { useCallback, useState } from 'react';
import { Link } from 'src/components/link';
import { SearchInput, SearchInputProps } from 'src/components/search-input';
import { Table } from 'src/components/table';
import { Repository } from 'src/hooks/api/useRepoData';
import { ResourceCatalog } from 'src/hooks/api/useResourceCatalogs';
import { queryFilterObject2String } from 'src/views/search/components/filters/utils/query-builders';
import { getTabIdFromTypeLabel } from 'src/views/search/components/filters/utils/tab-filter-utils';

import { Filters } from './filters/';
import { formatDomainName, formatTypeName } from './helpers';
import useFilteredData from './hooks/useFilteredData';

export interface TableData
  extends Omit<ResourceCatalog, 'type'>,
    Omit<Repository, 'type'> {
  type: ResourceCatalog['type'] | Repository['type'];
}

interface TableWithSearchProps {
  ariaLabel: string;
  caption: string;
  columns: Column[];
  data?: TableData[];
  isLoading?: boolean;
  getCells?: (props: {
    column: Column;
    data: any;
    isLoading?: boolean;
  }) => React.ReactNode;
  searchInputProps?: Partial<SearchInputProps>;
}

export const TableWithSearch: React.FC<TableWithSearchProps> = ({
  data = [],
  isLoading,
  columns,
  searchInputProps,
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
      {!isLoading && !data?.length ? (
        <Flex justifyContent='center'>
          <Text py={2}>No results found.</Text>
        </Flex>
      ) : (
        <Flex flexDirection='column' width='100%'>
          <Stack
            flexDirection={{ base: 'column', sm: 'row' }}
            gap={2}
            mb={2}
            flexWrap='wrap'
            alignItems='center'
            w='100%'
          >
            {/* <!-- Search Bar --> */}
            <SearchInput
              size='sm'
              value={searchTerm}
              placeholder='Search table'
              ariaLabel='Search table'
              handleChange={handleSearchChange}
              onClose={() => setSearchTerm('')}
              isResponsive={false}
              wrapperProps={{
                minWidth: { base: '100%', lg: '300px' },
              }}
            />

            {/* <!-- Filters --> */}
            <Filters data={data} filters={filters} setFilters={setFilters} />
          </Stack>

          <Stack flexDirection='column' flexWrap='wrap' py={2} gap={2}>
            {/* <!-- Number of results --> */}
            <Box>
              <Text fontWeight='semibold' lineHeight='short'>
                {filteredData.length} results
              </Text>
              <Text fontSize='xs' lineHeight='short'>
                {filters.length > 0 ? 'Showing results filtered by:' : ''}
              </Text>
            </Box>
            {/* <!-- Filter Tags--> */}
            <Stack
              flexDirection='row'
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
            data={isLoading ? Array(10).fill({}) : filteredData}
            getCells={props => <RepositoryCells {...props} />}
            colorPalette='niaid'
            columns={columns}
            isLoading={isLoading}
            tableProps={{
              scrollArea: { height: '500px' },
              root: {
                size: 'md',
                sortable: true,
                stickyHeader: true,
                striped: true,
                variant: 'outline',
              },
            }}
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
export const RepositoryCells = React.memo(
  ({ column, data }: { column: Column; data: TableData }) => {
    const tab = data?.type?.includes('Computational Tool Repository')
      ? getTabIdFromTypeLabel('ComputationalTool')
      : undefined;
    const href = data?.type?.includes('Resource Catalog')
      ? {
          pathname: `/resources`,
          query: {
            id: data._id,
          },
        }
      : {
          pathname: `/search`,
          query: {
            q: '',
            filters: queryFilterObject2String({
              'includedInDataCatalog.name': [data._id],
            }),
            ...(tab && { tab }),
          },
        };
    return (
      <>
        {/* Repository/Resource Catalog name */}
        {column.property === 'name' && (
          <>
            {data._id ? (
              <Link asChild>
                <NextLink href={href}>{data[column.property]}</NextLink>
              </Link>
            ) : (
              <Text lineHeight='inherit'>{data[column.property]}</Text>
            )}
          </>
        )}
        {/* Repository/Resource Catalog brief description */}
        {column.property === 'abstract' && (
          <Text lineClamp={3} lineHeight='inherit'>
            {data[column.property]}
          </Text>
        )}
        {/* Repository / Resource Catalog type, domain and conditions of access */}
        {(column.property === 'type' ||
          column.property === 'domain' ||
          column.property === 'conditionsOfAccess') && (
          <Text lineClamp={2} lineHeight='inherit' fontWeight='medium'>
            {column.property === 'type' &&
              (data.type
                ? data.type
                    .map(type => formatTypeName(type))
                    .sort((a, b) => a.localeCompare(b))
                    .join(', ')
                : '-')}
            {column.property === 'domain' &&
              (data.domain ? formatDomainName(data.domain) : '-')}
            {column.property === 'conditionsOfAccess' &&
              (data['conditionsOfAccess']
                ? `${data['conditionsOfAccess']}`
                : '-')}
          </Text>
        )}
      </>
    );
  },
);
