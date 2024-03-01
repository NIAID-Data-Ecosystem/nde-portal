import React from 'react';
import NextLink from 'next/link';
import { Flex, SkeletonText, Tag } from '@chakra-ui/react';
import { Link } from 'src/components/link';
import { fetchSearchResults } from 'src/utils/api';
import {
  FetchSearchResultsResponse,
  FormattedResource,
} from 'src/utils/api/types';
import { useQuery } from 'react-query';
import { TableWithSearch } from './TableWithSearch';

interface ResourceCatalog {
  collectionType: string;
}
interface ResourceCatalogsTableProps {
  ariaLabel: string;
  caption: string;
  isLoading?: boolean;
  data: FormattedResource[];
}

const columns = [
  {
    title: 'Resource catalog',
    property: 'name',
    isSortable: true,
  },
  {
    title: 'Type',
    property: 'collectionType',
    isSortable: true,
  },
];

export const ResourceCatalogsTable: React.FC<ResourceCatalogsTableProps> = ({
  data,
  isLoading,
  ...rest
}) => {
  return (
    <TableWithSearch
      data={data}
      isLoading={isLoading}
      columns={columns}
      getCells={props => <ResourceCatalogCells {...props} />}
      searchInputProps={{
        placeholder: 'Search in resource index',
        ariaLabel: 'Search in resource index',
      }}
      {...rest}
    />
  );
};

interface Column {
  title: string;
  property: string;
  isSortable?: boolean;
  props?: any;
}
export const ResourceCatalogCells = ({
  column,
  data,
  isLoading,
}: {
  column: Column;
  data: FormattedResource;
  isLoading?: boolean;
}) => {
  const resourceCatalog = data as ResourceCatalog;
  const collectionType = resourceCatalog.collectionType;
  return (
    <>
      <Flex
        alignItems={['flex-start', 'center']}
        flexDirection={['column', 'row']}
        justifyContent='flex-start'
        minH='30px'
      >
        <SkeletonText
          data-testid={isLoading ? 'loading' : 'loaded'}
          isLoaded={!isLoading && !!data}
          noOfLines={2}
          spacing='2'
          w='100%'
          ml={[0, 2]}
        >
          {data?._id && column.property === 'name' && (
            <NextLink
              href={{
                pathname: '/resources/',
                query: { id: data._id },
              }}
              passHref
              prefetch={false}
            >
              <Link as='div' fontWeight='medium' fontSize='md'>
                {data[column.property]}
              </Link>
            </NextLink>
          )}

          {column.property === 'collectionType' && collectionType && (
            <Tag
              size='sm'
              colorScheme={getColorSchemeForTags(collectionType)}
              variant='subtle'
            >
              {data[column.property]}
            </Tag>
          )}
        </SkeletonText>
      </Flex>
    </>
  );
};

const getColorSchemeForTags = (collectionType: string) => {
  const collectionTypes = [
    'Knowledge Base',
    'Ontology',
    'Terminology',
    'Database',
    'Dataset',
    'Metadata Catalog',
    'Archive',
    'Cloud Ecosystem',
    'Corpus',
    'Repository',
    'Controlled Vocabulary',
    'Registry',
    'Data Dictionary',
    'Data Mart',
    'Data Warehouse',
    'Data Store',
    'Data Collection',
    'Portal',
  ];
  const themes = [
    'gray',
    'red',
    'orange',
    'yellow',
    'green',
    'teal',
    'blue',
    'cyan',
    'purple',
    'pink',
    'primary',
    'tertiary',
    'secondary',
  ];

  const idx = collectionTypes.indexOf(collectionType);
  const theme = themes[idx % themes.length];

  return theme;
};
