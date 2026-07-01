import React from 'react';
import { Flex, HStack, Text, VStack } from '@chakra-ui/react';
import { getMetadataName } from 'src/components/metadata';
import {
  TagCell,
  TextCell,
  TextCellWithLink,
} from '../repository-matcher/components/TableCells';
import { SavedColumn, SavedResourceItem, SavedRow } from './types';
import { defaultSearchValue } from '../repository-matcher/hooks/useRepositoryMatcherData';

import { BookmarkIconButton } from 'src/components/bookmark-buttons/icon-button';
import { SavedDataset, SavedQuery } from 'src/hooks/useUserData/types';
import { useUserData } from 'src/hooks/useUserData';
import { findSavedQueryIndex } from 'src/hooks/useUserData/helpers';
import {
  FILTER_CONFIGS,
  queryFilterObject2String,
} from '../search/components/filters';
import { generateTags } from '../search/components/filters/components/tag/utils';
import { formatAPIResourceTypeForDisplay } from 'src/utils/formatting/formatResourceType';

type DateCellValue = { display: string; raw: number } | null;

const formatDateCellValue = (date?: string): DateCellValue => {
  if (!date) return null;
  const timestamp = Date.parse(date);
  if (Number.isNaN(timestamp)) return null;
  return {
    display: new Date(timestamp).toLocaleDateString(),
    raw: timestamp,
  };
};

const normalizeNameSortValue = (value?: string) =>
  (value ?? '')
    .trim()
    .replace(/^[`'"]+/, '')
    .toLowerCase();

const SavedResourceNameCell = ({
  value,
  isLoading,
}: {
  value: SavedDataset & { url: string };
  isLoading?: boolean;
}) => {
  const { savedDatasets, addSavedDataset, removeSavedDataset } = useUserData();
  const isFavorited = !!savedDatasets.find(
    ds => ds.dataset_id === value.dataset_id,
  );
  return (
    <HStack alignItems='flex-start' mt={-1}>
      <BookmarkIconButton
        isFavorited={isFavorited}
        onClick={() =>
          isFavorited
            ? removeSavedDataset(value.dataset_id)
            : addSavedDataset(value)
        }
      />
      <VStack alignItems='flex-start' spacing={1} fontSize='xs' pt={1}>
        <TextCellWithLink
          label={value?.name || ''}
          url={value?.url}
          isLoading={isLoading}
          isExternal={false}
        />
        <Text color='gray.700'>ID: {value?.dataset_id || ''}</Text>
      </VStack>
    </HStack>
  );
};

const SavedQueryNameCell = ({
  value,
  isLoading,
}: {
  value: SavedQuery & { url: string };
  isLoading?: boolean;
}) => {
  const { savedQueries, addSavedQuery, removeSavedQuery } = useUserData();
  // Match on query AND filters: the same query string can be saved more than
  // once with different filters, and each must be favorited/removed on its own.
  const isFavorited = findSavedQueryIndex(savedQueries, value) !== -1;
  return (
    <HStack alignItems='flex-start' mt={-1}>
      <BookmarkIconButton
        isFavorited={isFavorited}
        aria-label={isFavorited ? 'Remove saved query' : 'Save query'}
        onClick={() =>
          isFavorited ? removeSavedQuery(value) : addSavedQuery(value)
        }
      />
      <Flex pt={1}>
        <TextCellWithLink
          label={value?.name || ''}
          url={value?.url}
          isLoading={isLoading}
          isExternal={false}
        />
      </Flex>
    </HStack>
  );
};

export const SAVED_RESOURCE_COLUMNS: SavedColumn<SavedResourceItem, any>[] = [
  {
    id: 'name',
    label: getMetadataName('name') || '',
    fields: ['name', 'dataset_id'],
    columns: {
      isSortable: true,
      isDefault: true,
    },
    transform: (item): SavedDataset & { url: string } => ({
      ...item,
      url: `/resources?id=${item.dataset_id}`,
    }),
    getSortValue: (value: SavedDataset) => normalizeNameSortValue(value.name),
    getSearchValue: (value: SavedDataset) => value.name,
    component: SavedResourceNameCell,
  },

  {
    id: 'type',
    label: getMetadataName('type') || 'Type',
    fields: ['@type'],
    columns: {
      isSortable: true,
      isDefault: true,
      style: { maxWidth: '180px', minWidth: '160px' },
    },
    getSortValue: (value: string) => value.toLowerCase(),
    transform: (item): string => {
      if (!item.type) return '';
      return formatAPIResourceTypeForDisplay(item.type) ?? '';
    },
    component: ({
      value,
      isLoading,
    }: {
      value: string;
      isLoading?: boolean;
    }) => {
      if (!isLoading && (!value || !value.length))
        return <TextCell value='' isLoading={isLoading} noOfLines={1} />;
      return (
        <TextCell
          value={value}
          isLoading={isLoading}
          noOfLines={2}
          fontWeight='semibold'
        />
      );
    },
  },
  {
    id: 'source',
    label: 'Source',
    fields: ['includedInDataCatalog.name'],
    columns: {
      isSortable: true,
      isDefault: true,
      style: { maxWidth: '220px', minWidth: '160px' },
    },
    transform: (item): string[] => item.source ?? [],
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
        noOfLines={2}
      />
    ),
  },
  {
    id: 'dateModified',
    label: 'Updated On',
    fields: ['dateModified'],
    columns: {
      isSortable: true,
      isDefault: true,
      style: { maxWidth: '200px', minWidth: '160px' },
    },
    transform: item => formatDateCellValue(item.dateModified),
    getSearchValue: (value: DateCellValue) => value?.display ?? '',
    getSortValue: (value: DateCellValue) => value?.raw ?? 0,
    component: ({
      value,
      isLoading,
    }: {
      value: DateCellValue;
      isLoading?: boolean;
    }) => {
      return (
        <TextCell
          value={value?.display ?? ''}
          isLoading={isLoading}
          noOfLines={1}
        />
      );
    },
  },
  {
    id: 'saved_at',
    label: 'Saved On',
    fields: ['saved_at'],
    columns: {
      isSortable: true,
      isDefault: true,
      style: { maxWidth: '200px', minWidth: '200px' },
    },
    transform: item => formatDateCellValue(item.saved_at),
    getSearchValue: (value: DateCellValue) => value?.display ?? '',
    getSortValue: (value: DateCellValue) => value?.raw ?? 0,
    component: ({
      value,
      isLoading,
    }: {
      value: DateCellValue;
      isLoading?: boolean;
    }) => {
      return (
        <TextCell
          value={value?.display ?? ''}
          isLoading={isLoading}
          noOfLines={1}
        />
      );
    },
  },
  // {
  //   id: 'type',
  //   label: getMetadataName('type') || '',
  //   fields: ['@type', 'collectionType', 'type'],
  //   columns: {
  //     isSortable: true,
  //     isDefault: true,
  //     style: { maxWidth: '180px', minWidth: '180px' },
  //   },
  //   transform: (item): string[] => itemTypes(item),
  //   getSortValue: (value: string[]) => (value[0] || '').toLowerCase(),
  //   component: ({
  //     value,
  //     isLoading,
  //   }: {
  //     value: string[];
  //     isLoading?: boolean;
  //   }) => (
  //     <TextCell
  //       value={value && value.length ? value.join(', ') : ''}
  //       isLoading={isLoading}
  //       fontWeight='semibold'
  //     />
  //   ),
  //   filter: {
  //     getFilterValues: (value: string[]) => value ?? [],
  //   },
  //   info: {
  //     filterDescription: getMetadataDescription('type') || '',
  //     terms: [
  //       {
  //         label: 'Dataset Repository',
  //         description: 'A repository which holds Dataset records',
  //       },
  //       {
  //         label: 'Sample Repository',
  //         description:
  //           'A repository which holds biological specimen or sample records',
  //       },
  //       {
  //         label: 'Computational Tool Repository',
  //         description:
  //           'A repository which holds Computational Tool records were ingested into the portal',
  //       },
  //       {
  //         label: 'Data Repository',
  //         description: 'A repository which holds other types of records',
  //       },
  //       {
  //         label: 'Resource Catalog',
  //         description:
  //           'A record about the repository/resource/portal etc. itself',
  //       },
  //     ],
  //   },
  // },
];

// Convert filter config list to map for quick access
const configMap = Object.fromEntries(
  FILTER_CONFIGS.map(cfg => [cfg.property, cfg]),
);

export const SAVED_QUERY_COLUMNS: SavedColumn<SavedQuery, any>[] = [
  {
    id: 'total_count',
    label: 'Total',
    fields: ['total'],
    columns: {
      style: { maxWidth: '100px', minWidth: '100px' },
    },
    transform: (item): number => {
      if (!item.total) return 0;
      return item.total;
    },
    getSortValue: (value: number) => value,
    component: ({
      value,
      isLoading,
    }: {
      value: number;
      isLoading?: boolean;
    }) => {
      return (
        <TextCell
          fontWeight='semibold'
          value={value.toLocaleString()}
          isLoading={isLoading}
          noOfLines={1}
          mt={0.5}
        />
      );
    },
  },
  {
    id: 'name',
    label: 'Name',
    fields: ['name', 'query'],
    columns: { isSortable: true, isDefault: true },
    transform: (item): SavedQuery & { url: string } => {
      const filter_string = queryFilterObject2String(item.filters) || '';
      return {
        ...item,
        url: `/search?q=${encodeURIComponent(
          item.query,
        )}&filters=${encodeURIComponent(filter_string)}`,
      };
    },
    getSortValue: (value: SavedQuery) =>
      normalizeNameSortValue(value.name || value.query),
    getSearchValue: (value: SavedQuery) => `${value.name} ${value.query}`,
    component: SavedQueryNameCell,
  },
  {
    id: 'filters',
    label: 'Applied Filters',
    fields: ['filters'],
    columns: {
      isSortable: false,
      isDefault: true,
      style: { minWidth: '200px' },
    },
    getSearchValue: (value: {
      tags: {
        key: string;
        filterKey: string;
        name: string;
        value: string[];
        displayValue: string;
      }[];
    }) => {
      const str = value?.tags
        ?.map(tag => `${tag.name}: ${tag.displayValue}`)
        .join(' ');
      return str || '';
    },
    transform: item => {
      return {
        tags: generateTags(item.filters, configMap),
        filtersObj: item.filters,
      };
    },
    component: ({
      value,
      isLoading,
    }: {
      value: {
        tags: {
          key: string;
          filterKey: string;
          name: string;
          value: string[];
          displayValue: string;
        }[];
      };
      isLoading?: boolean;
    }) => {
      const { tags } = value;
      if (!tags || !tags.length)
        return <TextCell value='' isLoading={isLoading} />;
      return (
        <HStack flexWrap='wrap' spacing={1}>
          {tags.map(tag => {
            const str = `${tag.name}: ${tag.displayValue}`;
            return (
              <TagCell
                key={str}
                colorScheme='secondary'
                value={str}
                noOfLines={1}
                isLoading={isLoading}
              />
            );
          })}
        </HStack>
      );
    },
  },
  {
    id: 'saved_at',
    label: 'Saved On',
    fields: ['saved_at'],
    columns: {
      isSortable: true,
      isDefault: true,
      style: { maxWidth: '200px', minWidth: '200px' },
    },
    transform: item => formatDateCellValue(item.saved_at),
    getSearchValue: (value: DateCellValue) => value?.display ?? '',
    getSortValue: (value: DateCellValue) => value?.raw ?? 0,
    component: ({
      value,
      isLoading,
    }: {
      value: DateCellValue;
      isLoading?: boolean;
    }) => {
      return (
        <TextCell
          value={value?.display ?? ''}
          isLoading={isLoading}
          noOfLines={1}
        />
      );
    },
  },
];

/**
 * Builds table rows from saved items: applies each column's `transform`,
 * dedupes by `getRowId`, and prebuilds a lowercase `_search` blob so search
 * matches against every column (including hidden ones).
 */
export const formatTableData = <TItem,>(
  data: TItem[],
  columns: SavedColumn<TItem, any>[],
  getRowId: (item: TItem, index: number) => string,
) => {
  const rows: SavedRow[] = [];
  const seen = new Set<string>();

  data.forEach((item, idx) => {
    const id = getRowId(item, idx) || `__no-id-${idx}`;
    if (seen.has(id)) return;
    seen.add(id);
    const row = { _id: id } as SavedRow;
    const searchParts: string[] = [];
    for (const col of columns) {
      const value = col.transform(item);
      row[col.id] = value;
      const searchValue = col.getSearchValue
        ? col.getSearchValue(value)
        : defaultSearchValue(value);
      if (searchValue == null) continue;
      searchParts.push(
        Array.isArray(searchValue) ? searchValue.join(' ') : searchValue,
      );
    }
    row._search = searchParts.join(' ').toLowerCase();
    rows.push(row);
  });
  return rows;
};
