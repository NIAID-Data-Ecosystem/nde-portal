import React from 'react';
import NextLink from 'next/link';
import { SkeletonText, Text } from '@chakra-ui/react';
import { Link } from 'src/components/link';
import { Repository } from 'src/hooks/api/useRepoData';
import { FormattedResource } from 'src/utils/api/types';
import {
  formatConditionsOfAccess,
  transformConditionsOfAccessLabel,
} from 'src/utils/formatting/formatConditionsOfAccess';
import { queryFilterObject2String } from 'src/views/search/components/filters/utils/query-string';
import { getTabIdFromTypeLabel } from 'src/views/search/components/filters/utils/tab-filter-utils';

export type RepositoryMatcherItem = Repository | FormattedResource;

export type NameValue = { label: string; url: string; _id: string };

export type RepositoryMatcherColumn<TValue = unknown> = {
  id: string;
  label: string;
  fields: string[];
  columns?: { isSortable?: boolean; isDefault?: boolean };
  transform: (item: RepositoryMatcherItem) => TValue;
  component: (props: { value: TValue; isLoading?: boolean }) => React.ReactNode;
  /**
   * Reduce the column's display value to a sortable primitive. Omit for
   * columns whose display value is already a string/number.
   */
  getSortValue?: (value: TValue) => string | number;
  /**
   * Reduce the column's display value to text the search bar can match
   * against. Return a string, an array of strings, or null to opt the column
   * out of search. Omit when the display value is already string/string[].
   */
  getSearchValue?: (value: TValue) => string | string[] | null;
};

const itemTypes = (item: RepositoryMatcherItem): string[] => {
  const t = (item as any).type;
  if (Array.isArray(t)) return t;
  if (typeof t === 'string') return [t];
  return [];
};

const buildItemUrl = (item: RepositoryMatcherItem): string => {
  const id = item._id || '';
  if (!id) return '';
  const types = itemTypes(item);
  if (types.includes('Resource Catalog')) {
    return `/resources?id=${encodeURIComponent(id)}`;
  }
  const filters = queryFilterObject2String({
    'includedInDataCatalog.name': [id],
  });
  const params = new URLSearchParams();
  params.set('q', '');
  if (filters) params.set('filters', filters);
  if (types.includes('Computational Tool Repository')) {
    const tab = getTabIdFromTypeLabel('ComputationalTool');
    if (tab) params.set('tab', tab);
  }
  return `/search?${params.toString()}`;
};

const TextCell = ({
  value,
  isLoading,
  noOfLines = 2,
}: {
  value: string;
  isLoading?: boolean;
  noOfLines?: number;
}) => (
  <SkeletonText
    isLoaded={!isLoading}
    noOfLines={noOfLines}
    spacing='2'
    fontSize='sm'
    w='100%'
  >
    <Text fontSize='sm' noOfLines={noOfLines}>
      {value || '-'}
    </Text>
  </SkeletonText>
);

export const REPOSITORY_MATCHER_COLUMNS: RepositoryMatcherColumn<any>[] = [
  {
    id: 'name',
    label: 'Name',
    fields: ['name', '_id', 'identifier', 'url', '@type', 'collectionType'],
    columns: { isSortable: true, isDefault: true },
    transform: (item): NameValue => ({
      label: item.name || item._id || '',
      url: buildItemUrl(item),
      _id: item._id || '',
    }),
    getSortValue: (value: NameValue) => value.label.toLowerCase(),
    getSearchValue: (value: NameValue) => value.label,
    component: ({
      value,
      isLoading,
    }: {
      value: NameValue;
      isLoading?: boolean;
    }) => (
      <SkeletonText
        isLoaded={!isLoading && Boolean(value?._id)}
        noOfLines={2}
        fontSize='sm'
        w='100%'
      >
        {value?.url ? (
          <NextLink href={value.url} prefetch={false} passHref>
            <Link as='div'>{value.label}</Link>
          </NextLink>
        ) : (
          <Text fontSize='sm'>{value?.label || '-'}</Text>
        )}
      </SkeletonText>
    ),
  },
  {
    id: 'coa',
    label: 'Conditions of Access',
    fields: ['conditionsOfAccess'],
    columns: { isSortable: true, isDefault: true },
    transform: (item): string =>
      transformConditionsOfAccessLabel(
        formatConditionsOfAccess(item.conditionsOfAccess),
      ) || '',
    component: ({
      value,
      isLoading,
    }: {
      value: string;
      isLoading?: boolean;
    }) => <TextCell value={value} isLoading={isLoading} />,
  },
  {
    id: 'abstract',
    label: 'Abstract',
    fields: ['abstract'],
    columns: { isSortable: true, isDefault: true },
    transform: (item): string => item.abstract || '',
    component: ({
      value,
      isLoading,
    }: {
      value: string;
      isLoading?: boolean;
    }) => <TextCell value={value} isLoading={isLoading} noOfLines={3} />,
  },
  {
    id: 'description',
    label: 'Description',
    fields: ['description'],
    columns: { isSortable: true, isDefault: true },
    transform: (item): string => item.description || '',
    component: ({
      value,
      isLoading,
    }: {
      value: string;
      isLoading?: boolean;
    }) => <TextCell value={value} isLoading={isLoading} noOfLines={3} />,
  },
  {
    id: 'type',
    label: 'Type',
    fields: ['@type', 'collectionType', 'type'],
    columns: { isSortable: true, isDefault: true },
    transform: (item): string[] => itemTypes(item),
    getSortValue: (value: string[]) => (value[0] || '').toLowerCase(),
    component: ({
      value,
      isLoading,
    }: {
      value: string[];
      isLoading?: boolean;
    }) => (
      <TextCell
        value={value && value.length ? value.join(', ') : ''}
        isLoading={isLoading}
      />
    ),
  },
];
