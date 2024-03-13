import React, { useCallback, useState } from 'react';
import NextLink from 'next/link';
import {
  Flex,
  Image,
  SkeletonCircle,
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
import { ConditionsOfAccess } from 'src/components/badges';
import {
  getColorSchemeForDataType,
  getDataTypeName,
  getRepositoryTypeName,
} from './helpers';
import { Filters } from './filters/';
import useFilteredData from './filters/useFilteredData';

export interface TableData
  extends Omit<ResourceCatalog, 'dataType' | 'type'>,
    Omit<Repository, 'dataType' | 'type'> {
  dataType: ResourceCatalog['dataType'] | Repository['dataType'];
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

export const SEARCH_FIELDS = [
  'name',
  'abstract',
  'dataType',
  'conditionsOfAccess',
  'type',
] as (keyof TableData)[];

export const TableWithSearch: React.FC<TableWithSearchProps> = ({
  data = [],
  isLoading,
  columns,
  getCells,
  searchInputProps,
  ...props
}) => {
  /****** Handle Filters ******/
  const [filters, setFilters] = useState<
    Record<keyof TableData, string[]> | {}
  >({});

  /****** Handle Search ******/
  const [searchTerm, setSearchTerm] = useState('');
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>): void =>
      setSearchTerm(e.target.value),
    [],
  );

  const filteredData = useFilteredData(data, searchTerm, filters);

  const updateFilters = useCallback((filter: { [key: string]: string[] }) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      ...filter,
    }));
  }, []);
  return (
    <>
      {!isLoading && !data?.length ? (
        <Flex justifyContent='center'>
          <Text py={2}>No results found.</Text>
        </Flex>
      ) : (
        <>
          {/* <!-- Filters --> */}
          <Stack
            direction='row'
            spacing={2}
            mb={2}
            justifyContent='space-between'
            flexWrap='wrap'
          >
            <Filters
              data={data}
              filters={filters}
              updateFilter={updateFilters}
            />
          </Stack>

          <Stack
            direction={{ base: 'column', sm: 'row' }}
            flexWrap='wrap'
            pb={2}
          >
            {/* <!-- Filter Tags--> */}
            <Stack
              direction='row'
              spacing={2}
              flex={1}
              flexWrap='wrap'
              minW='300px'
            >
              {Object.entries(filters).map(([key, values]) => {
                if (key === 'dataType') return null;
                return values.map(value => {
                  let name = value;
                  if (key === 'type') {
                    name = getRepositoryTypeName(value);
                  }
                  return (
                    <Tag
                      key={`${key}-${value}`}
                      size='sm'
                      variant='subtle'
                      borderRadius='full'
                      colorScheme='primary'
                    >
                      <TagLabel fontWeight='medium'>{name}</TagLabel>
                      <TagCloseButton
                        onClick={() => {
                          updateFilters({
                            [key]: values.filter(v => v !== value),
                          });
                        }}
                      />
                    </Tag>
                  );
                });
              })}
            </Stack>
            {/* <!-- Search table --> */}
            <Flex
              justifyContent='flex-end'
              width={{ base: '100%', md: 'unset' }}
            >
              <SearchInput
                size='sm'
                placeholder='Search table'
                ariaLabel='Search table'
                value={searchTerm}
                handleChange={handleSearchChange}
                isResponsive={false}
                alignItems='flex-end'
                flex={1}
              />
            </Flex>
          </Stack>

          {/* <!-- Table --> */}
          <Table
            // hasPagination
            data={filteredData || []}
            tableHeadProps={{ bg: 'page.alt' }}
            tableContainerProps={{ overflowY: 'auto', maxHeight: '500px' }}
            getCells={props =>
              getCells ? getCells(props) : <RepositoryCells {...props} />
            }
            isLoading={isLoading}
            columns={columns}
            {...props}
          />
        </>
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
  return (
    <Flex
      alignItems={['flex-start', 'center']}
      flexDirection={['column', 'row']}
      justifyContent='flex-start'
      py={1}
    >
      {column.property === 'name' && (
        <SkeletonCircle
          data-testid={isLoading ? 'loading' : 'loaded'}
          isLoaded={!isLoading && !!data}
          w={isLoading ? '30px' : 'unset'}
          h={isLoading ? '30px' : 'unset'}
          mr={isLoading || data?.icon ? 2 : 0}
          my={2}
          ml={0}
        >
          {data?.icon && (
            <Flex alignItems='center'>
              {data?.url ? (
                <Link
                  href={data.url}
                  fontWeight='medium'
                  target='_blank'
                  _focus={{
                    boxShadow: 'none',
                  }}
                >
                  <Image
                    src={`${data.icon}`}
                    alt={`Logo for data source ${data.name}`}
                    objectFit='contain'
                    width='30px'
                    minWidth='30px'
                    height='30px'
                  />
                </Link>
              ) : (
                <Image
                  src={`${data.icon}`}
                  alt={`Logo for data source ${data.name}`}
                  objectFit='contain'
                  width='30px'
                  minWidth='30px'
                  height='30px'
                />
              )}
            </Flex>
          )}
        </SkeletonCircle>
      )}

      {column.property === 'name' && (
        <SkeletonText
          data-testid={isLoading ? 'loading' : 'loaded'}
          isLoaded={!isLoading && !!data}
          noOfLines={2}
          spacing='2'
          w='100%'
          fontSize='sm'
        >
          {column.property === 'name' && data.portalURL ? (
            <NextLink href={data.portalURL} passHref prefetch={false}>
              <Link as='div' fontWeight='medium'>
                {data[column.property]}
              </Link>
            </NextLink>
          ) : (
            <Text>{data[column.property]}</Text>
          )}
        </SkeletonText>
      )}

      {column.property === 'abstract' && (
        <SkeletonText
          data-testid={isLoading ? 'loading' : 'loaded'}
          isLoaded={!isLoading && !!data}
          spacing='2'
          w='100%'
          fontSize='sm'
        >
          <Text noOfLines={3}>{data[column.property]}</Text>
          {data['conditionsOfAccess'] && (
            <Flex mt={1}>
              <ConditionsOfAccess
                conditionsOfAccess={data['conditionsOfAccess']}
                type={
                  data.dataType === 'Repository' ? 'Dataset' : 'ResourceCatalog'
                }
              />
            </Flex>
          )}
        </SkeletonText>
      )}
      {column.property === 'dataType' && (
        <SkeletonText
          data-testid={isLoading ? 'loading' : 'loaded'}
          isLoaded={!isLoading && !!data}
          w='100%'
          h='100%'
          fontSize='sm'
          noOfLines={2}
        >
          {column.fields?.map(field => {
            let colorScheme = 'gray';
            let variant = 'outline';
            let label = data[field] ?? '';
            if (field === 'dataType') {
              colorScheme = getColorSchemeForDataType(data[field]);
              variant = 'solid';
              label = getDataTypeName(data[field]);
            } else if (field === 'type') {
              colorScheme = getColorSchemeForDataType(data.dataType);
              variant = 'subtle';
              if (data.dataType === 'Repository') {
                label = data[field] ? getRepositoryTypeName(label) : '';
              }
            }

            return (
              <Tag
                key={data._id + label}
                mr={2}
                mb={2}
                size='sm'
                colorScheme={colorScheme}
                variant={variant}
              >
                {label}
              </Tag>
            );
          })}
        </SkeletonText>
      )}
    </Flex>
  );
};
