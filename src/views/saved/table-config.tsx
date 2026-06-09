import React from 'react';
import { HStack, Text, VStack } from '@chakra-ui/react';
import { getMetadataName } from 'src/components/metadata';
import {
  TextCell,
  TextCellWithLink,
} from '../repository-matcher/components/TableCells';
import { SavedColumn, SavedResourceItem, SavedRow } from './types';
import { defaultSearchValue } from '../repository-matcher/hooks/useRepositoryMatcherData';

import { BookmarkIconButton } from 'src/components/bookmark-buttons/icon-button';
import { SavedDataset, SavedQuery } from 'src/hooks/useUserData/types';
import { useUserData } from 'src/hooks/useUserData';

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
    <HStack alignItems='flex-start'>
      <BookmarkIconButton
        isFavorited={isFavorited}
        onClick={() =>
          isFavorited
            ? removeSavedDataset(value.dataset_id)
            : addSavedDataset(value)
        }
      />
      <VStack alignItems='flex-start' spacing={1} fontSize='xs'>
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
  const favoriteIndex = savedQueries.findIndex(
    search => search.query === value.query,
  );
  const isFavorited = favoriteIndex !== -1;
  return (
    <HStack alignItems='center'>
      <BookmarkIconButton
        isFavorited={isFavorited}
        aria-label={isFavorited ? 'Remove saved query' : 'Save query'}
        onClick={() =>
          isFavorited ? removeSavedQuery(favoriteIndex) : addSavedQuery(value)
        }
      />
      <TextCellWithLink
        label={value?.query || ''}
        url={value?.url}
        isLoading={isLoading}
        isExternal={false}
      />
    </HStack>
  );
};

export const SAVED_RESOURCE_COLUMNS: SavedColumn<SavedResourceItem, any>[] = [
  {
    id: 'name',
    label: getMetadataName('name') || '',
    fields: ['name', 'dataset_id'],
    columns: { isSortable: true, isDefault: true },
    transform: (item): SavedDataset & { url: string } => ({
      ...item,
      url: `/resources?id=${item.dataset_id}`,
    }),
    getSortValue: (value: SavedDataset) => value.name.toLowerCase(),
    getSearchValue: (value: SavedDataset) => value.name,
    component: SavedResourceNameCell,
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
    transform: item => {
      if (!item.saved_at) return '';
      return new Date(item.saved_at).toLocaleDateString();
    },
    component: ({
      value,
      isLoading,
    }: {
      value: string;
      isLoading?: boolean;
    }) => {
      return <TextCell value={value} isLoading={isLoading} noOfLines={1} />;
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

export const FAVORITE_SEARCH_COLUMNS: SavedColumn<SavedQuery, any>[] = [
  {
    id: 'name',
    label: 'Name',
    fields: ['name', 'query'],
    columns: { isSortable: true, isDefault: true },
    transform: (item): SavedQuery & { url: string } => ({
      ...item,
      url: `/search?q=${encodeURIComponent(item.query)}`,
    }),
    getSortValue: (value: SavedQuery) => value.name.toLowerCase(),
    getSearchValue: (value: SavedQuery) => `${value.name} ${value.query}`,
    component: SavedQueryNameCell,
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
    transform: item => {
      if (!item.saved_at) return '';
      return new Date(item.saved_at).toLocaleDateString();
    },
    component: ({
      value,
      isLoading,
    }: {
      value: string;
      isLoading?: boolean;
    }) => {
      return <TextCell value={value} isLoading={isLoading} noOfLines={1} />;
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
