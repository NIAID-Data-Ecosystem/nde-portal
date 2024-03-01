import React from 'react';
import NextLink from 'next/link';
import {
  Flex,
  Image,
  SkeletonCircle,
  SkeletonText,
  Text,
} from '@chakra-ui/react';
import { Repository } from 'src/hooks/api/useRepoData';
import { Link } from 'src/components/link';
import { queryFilterObject2String } from 'src/components/filters/helpers';
import { Table } from 'src/components/table';
import { SearchInputProps } from 'src/components/search-input';
import { FormattedResource } from 'src/utils/api/types';

interface TableWithSearchProps {
  ariaLabel: string;
  caption: string;
  columns: Column[];
  data?: FormattedResource[] | Repository[];
  isLoading?: boolean;
  getCells?: (props: {
    column: Column;
    data: any;
    isLoading?: boolean;
  }) => React.ReactNode;
  searchInputProps?: Partial<SearchInputProps>;
}

export const TableWithSearch: React.FC<TableWithSearchProps> = ({
  data: repositories,
  isLoading,
  columns,
  getCells,
  searchInputProps,
  ...props
}) => {
  return (
    <>
      {!isLoading && !repositories?.length ? (
        <Flex justifyContent='center'>
          <Text py={2}>No results found.</Text>
        </Flex>
      ) : (
        <Table
          data={repositories || []}
          tableHeadProps={{ bg: 'page.alt' }}
          tableContainerProps={{ overflowY: 'auto' }}
          getCells={props =>
            getCells ? getCells(props) : <RepositoryCells {...props} />
          }
          isLoading={isLoading}
          columns={columns}
          {...props}
        />
      )}
    </>
  );
};

interface Column {
  title: string;
  property: string;
  isSortable?: boolean;
  props?: any;
}
export const RepositoryCells = ({
  column,
  data,
  isLoading,
}: {
  column: Column;
  data: Repository;
  isLoading?: boolean;
}) => {
  return (
    <>
      <Flex
        alignItems={['flex-start', 'center']}
        flexDirection={['column', 'row']}
        justifyContent='flex-start'
      >
        {column.property === 'label' && (
          <SkeletonCircle
            data-testid={isLoading ? 'loading' : 'loaded'}
            isLoaded={!isLoading && !!data}
            h='30px'
            w='30px'
            m={2}
            ml={0}
          >
            {data?.icon && (
              <>
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
                      alt={`Logo for data source ${data.label}`}
                      objectFit='contain'
                      width='30px'
                      minWidth='30px'
                      height='30px'
                    />
                  </Link>
                ) : (
                  <Image
                    src={`${data.icon}`}
                    alt={`Logo for data source ${data.label}`}
                    objectFit='contain'
                    width='30px'
                    minWidth='30px'
                    height='30px'
                  />
                )}
              </>
            )}
          </SkeletonCircle>
        )}
        <SkeletonText
          data-testid={isLoading ? 'loading' : 'loaded'}
          isLoaded={!isLoading && !!data}
          noOfLines={2}
          spacing='2'
          w='100%'
          ml={[0, 2]}
        >
          {data?.identifier && column.property === 'label' ? (
            <NextLink
              href={{
                pathname: `/search`,
                query: {
                  q: '',
                  filters: queryFilterObject2String({
                    'includedInDataCatalog.name': [data.identifier],
                  }),
                },
              }}
              passHref
              prefetch={false}
            >
              <Link as='div' fontWeight='medium' fontSize='md'>
                {data[column.property]}
              </Link>
            </NextLink>
          ) : (
            <Text fontSize='sm'>
              {data[column.property as keyof Repository]}
            </Text>
          )}
        </SkeletonText>
      </Flex>
    </>
  );
};
