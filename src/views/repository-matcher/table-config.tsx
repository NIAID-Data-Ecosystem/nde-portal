import { Circle, Tag } from '@chakra-ui/react';
import React from 'react';
import { ExpandableText } from 'src/components/expandable-cells';
import {
  getMetadataDescription,
  getMetadataName,
} from 'src/components/metadata';
import { LinkCell } from 'src/components/table/data-table';
import { formatDate } from 'src/utils/api/helpers';
import { AccessTypes, DefinedTerm } from 'src/utils/api/types';
import { USE_MERGED_SOURCES_AND_CATALOGS } from 'src/utils/feature-flags';
import {
  formatConditionsOfAccess,
  getColorPalette,
  transformConditionsOfAccessLabel,
} from 'src/utils/formatting/formatConditionsOfAccess';

import {
  NameValue,
  RepositoryMatcherColumn,
  RepositoryMatcherItem,
} from './types';
import { itemTypes } from './utils';

/*
Column definitions for the repository matcher table (the shared DataTable; see
src/components/table/data-table). Most columns only set a `type`: the tag
columns get the shared tag list (12 shown, then "Show N More") and the text
columns the shared text, link and "No data" handling. Only cells with their
own look (name link, access badge, temporal coverage, license, type) set
`cell`.

Commented-out columns further down still use the pre-DataTable column shape
(`label`, `columns`, `component`) and need converting before re-enabling.
*/

const SEMIBOLD: React.CSSProperties = { fontWeight: 600 };

const toArray = <T,>(value: T | T[] | null | undefined): T[] =>
  Array.isArray(value) ? value : value ? [value] : [];

const termNames = (value: DefinedTerm[]) =>
  value?.map(v => v.name).filter((name): name is string => !!name) ?? [];

/** The shape shared by the DefinedTerm tag columns (health condition, species…). */
const definedTermTagColumn = ({
  field,
  filterDescription,
  ...column
}: Pick<RepositoryMatcherColumn<DefinedTerm[]>, 'id' | 'header' | 'size'> & {
  field: keyof RepositoryMatcherItem;
  description?: string;
  filterDescription?: string;
}): RepositoryMatcherColumn<DefinedTerm[]> => ({
  ...column,
  type: 'tags',
  fields: [field],
  transform: item =>
    toArray(item[field] as DefinedTerm | DefinedTerm[] | undefined),
  getSearchValue: termNames,
  filter: { getFilterValues: termNames },
  info: { filterDescription },
});

export const REPOSITORY_MATCHER_COLUMNS: RepositoryMatcherColumn[] = [
  {
    id: 'name',
    header: getMetadataName('name') || '',
    fields: ['name', '_id', 'identifier', 'url', '@type', 'collectionType'],
    hideable: false,
    size: { min: 200, max: 320 },
    sort: { value: (value: NameValue) => value?.label },
    transform: (item): NameValue => ({
      label: item.name || item._id || '',
      url: item?.url || '',
      _id: item._id || '',
    }),
    getSearchValue: (value: NameValue) => value.label,
    // Links to the source's anchor on the `/sources` page when
    // USE_MERGED_SOURCES_AND_CATALOGS is on, otherwise to the record's `url`.
    // Always client-side, as before.
    cell: ({ value }: { value: NameValue }) => (
      <LinkCell
        href={
          USE_MERGED_SOURCES_AND_CATALOGS
            ? `/sources#${value?._id || ''}`
            : value?.url || ''
        }
        label={value?.label}
        external={false}
      />
    ),
    info: {
      filterDescription: getMetadataDescription('name') || '',
    },
  },
  {
    id: 'description',
    header: getMetadataName('description') || '',
    fields: ['description'],
    type: 'longText',
    size: { min: 320, max: 560 },
    sort: true,
    transform: (item): RepositoryMatcherItem['description'] =>
      item.description || '',
    // Eight lines before "Show More", as before (the shared default is four).
    cell: ({ value, column }) =>
      value ? (
        <ExpandableText
          text={value}
          noOfLines={8}
          lineHeight='shorter'
          toggleContext={column.header}
        />
      ) : null,
  },
  // {
  //   id: 'abstract',
  //   label: getMetadataName('abstract') || '',
  //   fields: ['abstract'],
  //   columns: { isSortable: true, isDefault: false },
  //   transform: (item): RepositoryMatcherItem['abstract'] => item.abstract || '',
  //   component: ({
  //     value,
  //     loading,
  //   }: {
  //     value: RepositoryMatcherItem['abstract'];
  //     loading?: boolean;
  //   }) => <TextCell value={value || ''} loading={loading} lineClamp={3} />,
  // },
  {
    id: 'researchDomain',
    header: getMetadataName('genre') || '',
    description: 'Categorical information about the content of a resource.',
    fields: ['genre'],
    type: 'tags',
    sort: true,
    transform: item => toArray(item.genre as string | string[] | undefined),
    filter: {
      getFilterValues: (value: string[]) => value ?? [],
    },
    info: {
      filterDescription: getMetadataDescription('genre') || '',
      terms: [
        {
          label: 'Generalist',
          description:
            'A resource not specifically designed for Infectious and/or Immune-Mediated Disease content',
        },
        {
          label: 'IID',
          description:
            'A resource specifically designed for Infectious and/or Immune-Mediated Disease content',
        },
      ],
    },
  },
  {
    id: 'coa',
    header: 'Access',
    description:
      'Access-level definitions options include open (freely available), controlled (may include restrictions such as on use), or registered (requires registration to access).',
    fields: ['conditionsOfAccess'],
    size: { min: 170 },
    sort: true,
    transform: (item): string =>
      transformConditionsOfAccessLabel(
        formatConditionsOfAccess(item.conditionsOfAccess),
      ) || '',
    cell: ({ value }: { value: string }) => {
      if (!value) return null;
      const colorPalette = getColorPalette(value as AccessTypes);
      return (
        <Tag.Root
          colorPalette={colorPalette}
          variant='subtle'
          borderColor='transparent'
          borderRadius='full'
          outlineColor='transparent'
          gap={2}
          boxShadow='none'
        >
          <Circle size='8px' bg={`${colorPalette}.500`} />
          <Tag.Label>{value}</Tag.Label>
        </Tag.Root>
      );
    },
    filter: {
      getFilterValues: (value: string) => (value ? [value] : []),
    },
    info: {
      filterDescription: getMetadataDescription('conditionsOfAccess') || '',
      terms: [
        {
          label: 'Controlled Access',
          description:
            'The repository may include restrictions such as for access or use',
        },
        {
          label: 'Open Access',
          description: 'The data in the repository is freely available',
        },
        {
          label: 'Registered Access',
          description: 'The repository requires registration to access',
        },
        {
          label: 'Varied Access',
          description:
            'The repository contains data that varies at the record level',
        },
      ],
    },
  },
  definedTermTagColumn({
    id: 'healthCondition',
    header: getMetadataName('healthCondition') || '',
    field: 'healthCondition',
    description: getMetadataDescription('healthCondition') || '',
    filterDescription: getMetadataDescription('healthCondition') || '',
  }),
  definedTermTagColumn({
    id: 'infectiousAgent',
    header: getMetadataName('infectiousAgent') || '',
    field: 'infectiousAgent',
    description: getMetadataDescription('infectiousAgent') || '',
    filterDescription: getMetadataDescription('infectiousAgent') || '',
  }),

  definedTermTagColumn({
    id: 'species',
    header: 'Host Species',
    field: 'species',
    description: getMetadataDescription('species') || '',
    filterDescription: getMetadataDescription('species') || '',
  }),
  definedTermTagColumn({
    id: 'meas-technique',
    header: getMetadataName('measurementTechnique') || '',
    field: 'measurementTechnique',
    size: { min: 300 },
    description: getMetadataDescription('measurementTechnique') || '',
    filterDescription: getMetadataDescription('measurementTechnique') || '',
  }),
  definedTermTagColumn({
    id: 'topic',
    header: getMetadataName('topicCategory') || '',
    field: 'topicCategory',
    description: getMetadataDescription('topicCategory') || '',
    filterDescription: getMetadataDescription('topicCategory') || '',
  }),
  {
    id: 'temporalCoverage',
    header: getMetadataName('temporalCoverage') || '',
    description: getMetadataDescription('temporalCoverage') || '',
    fields: ['temporalCoverage'],
    size: { min: 200 },
    // Sorts on the first coverage's start date (or its name for named
    // periods), newest first.
    sort: {
      value: (value?: RepositoryMatcherItem['temporalCoverage']) =>
        value?.[0]?.startDate || value?.[0]?.name,
      descFirst: true,
    },
    transform: item => {
      return item.temporalCoverage;
    },
    getSearchValue: (value: RepositoryMatcherItem['temporalCoverage']) => {
      return (
        value?.map(v => {
          if (!v.startDate && !v.endDate && v.name) return v.name;
          return `${v.startDate},${v.endDate}`;
        }) ?? []
      );
    },
    // Each coverage as "start / to / end" (ISO dates), or its name for a
    // named period. Plain elements: this renders on every row.
    cell: ({
      value,
    }: {
      value?: RepositoryMatcherItem['temporalCoverage'];
    }) => {
      if (!value || value.length === 0) return null;
      return value.map((tc, index) =>
        !tc.startDate && !tc.endDate && tc.name ? (
          <div key={index}>{tc.name}</div>
        ) : (
          <div key={index}>
            {formatDate(tc.startDate) || '-'}
            <br />
            to
            <br />
            {formatDate(tc.endDate) || '-'}
          </div>
        ),
      );
    },
  },
  {
    id: 'license',
    header: getMetadataName('license') || '',
    description: getMetadataDescription('license') || '',
    fields: ['license'],
    // `link` for its wrapping: a bare URL may break anywhere instead of
    // stretching the column to its full length.
    type: 'link',
    size: { max: 200 },
    sort: true,
    transform: item => item.license || '',
    cell: ({ value }: { value: string }) =>
      value && (value.startsWith('http') || value.startsWith('www')) ? (
        <LinkCell href={value} label={value} />
      ) : (
        value || null
      ),
  },
  {
    id: 'type',
    header: getMetadataName('type') || '',
    description:
      'Type is a Portal-specific classification that indicates how repository content is organized and displayed within the Portal.',
    fields: ['@type', 'collectionType', 'type'],
    size: { min: 160, max: 220 },
    sort: { value: (value: string[]) => value?.[0] },
    transform: (item): string[] => itemTypes(item),
    cell: ({ value }: { value: string[] }) =>
      value?.length ? <span style={SEMIBOLD}>{value.join(', ')}</span> : null,
    filter: {
      getFilterValues: (value: string[]) => value ?? [],
    },
    info: {
      filterDescription: getMetadataDescription('type') || '',
      terms: [
        {
          label: 'Dataset Repository',
          description:
            'A repository which holds Dataset records. Dataset metadata records are mapped and directly ingested into the Discovery Portal on a one-to-one basis.',
        },
        {
          label: 'Resource Catalog',
          description:
            ' A manually curated record about the repository/resource/portal etc. itself. Repositories displayed only as Resource Catalogs in the Discovery Portal are not sources of record ingest at this time.',
        },
        {
          label: 'Computational Tool Repository',
          description:
            'A repository which holds Computational Tool records. Tool metadata records are mapped and directly ingested into the Discovery Portal on a one-to-one basis.',
        },
        {
          label: 'Sample Repository',
          description:
            'A repository which holds biological specimen or sample records. Metadata records about samples are mapped and directly ingested into the Discovery Portal on a one-to-one basis.',
        },
        {
          label: 'Data Repository',
          description:
            'A repository which holds other types of records. Records of a searchable type are aggregated from the original source and used to create Data Collection records in the Discovery Portal. Multiple records submitted to a Data Repository may end up as a single Data Collection record in the Discovery Portal.',
        },
      ],
    },
  },
];

export const FILTERABLE_REPOSITORY_MATCHER_COLUMNS: RepositoryMatcherColumn[] =
  REPOSITORY_MATCHER_COLUMNS.filter(c => Boolean(c.filter));
