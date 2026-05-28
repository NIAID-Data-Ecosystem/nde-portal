import React from 'react';
import {
  Box,
  Circle,
  HStack,
  Tag,
  TagLabel,
  Text,
  VStack,
} from '@chakra-ui/react';
import { Repository } from 'src/hooks/api/useRepoData';
import {
  AccessTypes,
  DefinedTerm,
  FormattedResource,
} from 'src/utils/api/types';
import {
  formatConditionsOfAccess,
  getColorScheme,
  transformConditionsOfAccessLabel,
} from 'src/utils/formatting/formatConditionsOfAccess';
import {
  getMetadataDescription,
  getMetadataName,
} from 'src/components/metadata';
import {
  DefinedTermTagList,
  TagCell,
  TextCell,
  TextCellWithLink,
} from '../repository-matcher/components/TableCells';
import { buildItemUrl, itemTypes } from '../repository-matcher/utils';
import {
  NameValue,
  RepositoryMatcherColumn,
} from '../repository-matcher/types';
import {
  SavedResourceColumn,
  SavedResourceItem,
  SavedResourceRow,
} from './types';
import { defaultSearchValue } from '../repository-matcher/hooks/useRepositoryMatcherData';

export const SAVED_RESOURCE_COLUMNS: SavedResourceColumn<any>[] = [
  {
    id: 'name',
    label: getMetadataName('name') || '',
    fields: ['name', 'dataset_id'],
    columns: { isSortable: true, isDefault: true },
    required: true,
    transform: (item): NameValue => ({
      label: item.name || item.dataset_id || '',
      url: `/resources?id=${item.dataset_id}`,
      _id: item.dataset_id || '',
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
      <TextCellWithLink
        label={value?.label || ''}
        url={value?.url}
        isLoading={isLoading}
        isExternal={false}
      />
    ),
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

const formatTableData = (data: SavedResourceItem[]) => {
  const rows: SavedResourceRow[] = [];
  const seen = new Set<string>();

  data.forEach((item, idx) => {
    const id = item.dataset_id || `__no-id-${idx}`;
    if (seen.has(id)) return;
    seen.add(id);
    const row = {
      _id: item.dataset_id || '',
    } as SavedResourceRow & Record<string, any>;
    const searchParts: string[] = [];
    for (const col of SAVED_RESOURCE_COLUMNS) {
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
