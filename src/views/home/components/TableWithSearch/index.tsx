import React, { useCallback, useState } from 'react';
import NextLink from 'next/link';
import {
  Box,
  Flex,
  SkeletonText,
  Stack,
  Tag,
  TagLabel,
  TagCloseButton,
  Text,
} from '@chakra-ui/react';
import { Repository } from 'src/hooks/api/useRepoData';
import { Link } from 'src/components/link';
import { Table } from 'src/components/table';
import { SearchInput, SearchInputProps } from 'src/components/search-input';
import { ResourceCatalog } from 'src/hooks/api/useResourceCatalogs';
import { formatDomainName, formatTypeName } from './helpers';
import { Filters } from './filters/';
import useFilteredData from './hooks/useFilteredData';
import { queryFilterObject2String } from 'src/views/search-results-page-archived/helpers';

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
        <Flex flexDirection='column'>
          <Stack
            direction='row'
            spacing={2}
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

          <Stack direction='column' flexWrap='wrap' py={2} spacing={2}>
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
              spacing={2}
              flex={1}
              flexWrap='wrap'
              minW='300px'
            >
              {filters.length > 0 && (
                <Tag
                  key='clear'
                  size='lg'
                  variant='outline'
                  borderRadius='full'
                  colorScheme='primary'
                  borderColor='primary.100'
                >
                  <TagLabel>Clear all</TagLabel>
                  <TagCloseButton onClick={() => setFilters([])} />
                </Tag>
              )}
              {filters.map(filter => {
                const { name, property, value } = filter;
                return (
                  <Tag
                    key={property + '-' + value}
                    size='lg'
                    variant='subtle'
                    borderRadius='full'
                    colorScheme='primary'
                  >
                    <TagLabel fontWeight='medium'>{name}</TagLabel>
                    <TagCloseButton
                      onClick={() => removeSingleFilter(filter)}
                    />
                  </Tag>
                );
              })}
            </Stack>
          </Stack>

          {/* <!-- Table --> */}
          <Table
            data={isLoading ? Array(10).fill({}) : filteredData}
            tableHeadProps={{ bg: 'page.alt' }}
            getTableRowProps={(_, idx: number) => ({
              bg: idx % 2 ? 'page.alt' : 'white',
            })}
            tableContainerProps={{ overflowY: 'auto', maxHeight: '500px' }}
            getCells={props => (
              <RepositoryCells {...props} isLoading={isLoading} />
            )}
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
  isLoading,
}: {
  column: Column;
  data: TableData;
  isLoading?: boolean;
}) => {
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
        },
      };
  return (
    <Flex id={`cell-${data._id}-${column.property}`} py={1}>
      {/* Repository/Resource Catalog name */}
      {column.property === 'name' && (
        <SkeletonText
          data-testid={isLoading ? 'loading' : 'loaded'}
          isLoaded={Boolean(!isLoading && data._id)}
          noOfLines={2}
          w='100%'
          fontSize='sm'
        >
          {data._id ? (
            <NextLink href={href} prefetch={false} passHref>
              <Link as='div'>{data[column.property]}</Link>
            </NextLink>
          ) : (
            <Text>{data[column.property]}</Text>
          )}
        </SkeletonText>
      )}

      {/* Repository/Resource Catalog brief description */}
      {column.property === 'abstract' && (
        <SkeletonText
          data-testid={isLoading ? 'loading' : 'loaded'}
          isLoaded={Boolean(!isLoading && data._id)}
          spacing='2'
          w='100%'
          fontSize='sm'
        >
          <Text noOfLines={3}>{data[column.property]}</Text>
        </SkeletonText>
      )}

      {/* Repository / Resource Catalog type, domain and conditions of access */}
      {(column.property === 'type' ||
        column.property === 'domain' ||
        column.property === 'conditionsOfAccess') && (
        <SkeletonText
          fontWeight='semibold'
          data-testid={isLoading ? 'loading' : 'loaded'}
          isLoaded={Boolean(!isLoading && data._id)}
          w='100%'
          h='100%'
          fontSize='sm'
          noOfLines={2}
        >
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
        </SkeletonText>
      )}
    </Flex>
  );
};
