import React, { useMemo } from 'react';
import { Text } from '@chakra-ui/react';
import { Skeleton } from 'src/components/skeleton';
import { Table, Column } from 'src/components/table';
import { Cell } from 'src/components/resource-sections/components/samples/components/SampleTable/Cells';
import { Link } from 'src/components/link';
import { FormattedResource, IncludedInDataCatalog } from 'src/utils/api/types';
// For columns whose display value is a rich object
// (e.g. { identifier, url }) or an array of DefinedTerms we store a parallel
// `_sort_<field>` plain string on each row. The column `property` points at
// that sort key; getCells remaps it back to the original field name to read
// the display value.

const SORT_PREFIX = '_sort_' as const;
type SortKey = `${typeof SORT_PREFIX}${string}`;

const sortKey = (field: string): SortKey => `${SORT_PREFIX}${field}`;

const toSortString = (value: unknown): string => {
  if (value == null) return '';
  if (Array.isArray(value)) {
    return value
      .map(item => {
        if (item == null) return '';
        if (typeof item === 'string') return item;
        if (typeof item === 'object')
          return (
            (item as any).name ??
            (item as any).displayName ??
            (item as any).identifier ??
            ''
          );
        return String(item);
      })
      .filter(Boolean)
      .join(', ')
      .toLowerCase();
  }
  if (typeof value === 'object') {
    return (
      (value as any).name ??
      (value as any).identifier ??
      (value as any).displayName ??
      ''
    )
      .toString()
      .toLowerCase();
  }
  return String(value).toLowerCase();
};

const SAMPLE_RESULTS_COLUMNS: Column[] = [
  { title: 'Identifier', property: sortKey('identifier'), isSortable: true },
  {
    title: 'Alternate Identifier',
    property: sortKey('alternateIdentifier'),
    isSortable: true,
  },
  { title: 'Date', property: sortKey('date'), isSortable: true },
  { title: 'Name', property: sortKey('name'), isSortable: true },
  {
    title: 'Source',
    property: sortKey('includedInDataCatalog'),
    isSortable: true,
  },
  {
    title: 'Description',
    property: sortKey('description'),
    isSortable: true,
  },
  {
    title: 'Health Condition',
    property: sortKey('healthCondition'),
    isSortable: true,
  },
  {
    title: 'Infectious Agent',
    property: sortKey('infectiousAgent'),
    isSortable: true,
  },
  { title: 'Species', property: sortKey('species'), isSortable: true },
  {
    title: 'Conditions of Access',
    property: sortKey('conditionsOfAccess'),
    isSortable: true,
  },
  {
    title: 'Variable Measured',
    property: sortKey('variableMeasured'),
    isSortable: true,
  },
  {
    title: 'Measurement Technique',
    property: sortKey('measurementTechnique'),
    isSortable: true,
  },
  {
    title: 'Anatomical Structure',
    property: sortKey('anatomicalStructure'),
    isSortable: true,
  },
  {
    title: 'Anatomical System',
    property: sortKey('anatomicalSystem'),
    isSortable: true,
  },
  {
    title: 'Sample Type',
    property: sortKey('sampleType'),
    isSortable: true,
  },
  {
    title: 'Sample Availability',
    property: sortKey('sampleAvailability'),
    isSortable: true,
  },
  {
    title: 'Sample Quantity',
    property: sortKey('sampleQuantity'),
    isSortable: true,
  },
  {
    title: 'Sex',
    property: sortKey('sex'),
    isSortable: true,
  },
  {
    title: 'Developmental Stage',
    property: sortKey('developmentalStage'),
    isSortable: true,
  },
  {
    title: 'Associated Genotype',
    property: sortKey('associatedGenotype'),
    isSortable: true,
  },
  {
    title: 'Cell Type',
    property: sortKey('cellType'),
    isSortable: true,
  },
  {
    title: 'Location of Origin',
    property: sortKey('locationOfOrigin'),
    isSortable: true,
  },
  {
    title: 'Item Location',
    property: sortKey('itemLocation'),
    isSortable: true,
  },
];

const SORT_KEY_TO_FIELD: Record<string, string> = Object.fromEntries(
  SAMPLE_RESULTS_COLUMNS.map(col => [
    col.property,
    col.property.slice(SORT_PREFIX.length),
  ]),
);

const toRow = (resource: FormattedResource): Record<string, unknown> => {
  const rawCatalog = resource.includedInDataCatalog;
  const catalog: IncludedInDataCatalog | null = Array.isArray(rawCatalog)
    ? rawCatalog[0] ?? null
    : rawCatalog ?? null;

  const archivedAt = catalog?.archivedAt;
  const catalogUrl =
    (Array.isArray(archivedAt) ? archivedAt[0] : archivedAt) ??
    catalog?.url ??
    null;

  const identifierDisplay = {
    identifier: resource.id ?? (resource as any)._id ?? '',
    url: resource.url ?? '',
  };
  const catalogDisplay = catalog
    ? { name: catalog.name ?? '', url: catalogUrl }
    : null;

  return {
    ...resource,
    identifier: identifierDisplay,
    includedInDataCatalog: catalogDisplay,
    [sortKey('identifier')]: toSortString(identifierDisplay),
    [sortKey('date')]: toSortString(resource.date),
    [sortKey('alternateIdentifier')]: toSortString(
      resource.alternateIdentifier,
    ),
    [sortKey('name')]: toSortString(resource.name),
    [sortKey('includedInDataCatalog')]: toSortString(catalogDisplay),
    [sortKey('healthCondition')]: toSortString(resource.healthCondition),
    [sortKey('infectiousAgent')]: toSortString(resource.infectiousAgent),
    [sortKey('species')]: toSortString(resource.species),
    [sortKey('conditionsOfAccess')]: toSortString(resource.conditionsOfAccess),
    [sortKey('variableMeasured')]: toSortString(resource.variableMeasured),
    [sortKey('measurementTechnique')]: toSortString(
      resource.measurementTechnique,
    ),
    [sortKey('anatomicalStructure')]: toSortString(
      resource.anatomicalStructure,
    ),
    [sortKey('anatomicalSystem')]: toSortString(resource.anatomicalSystem),
    [sortKey('sampleType')]: toSortString(resource.sampleType),
    [sortKey('sampleAvailability')]: toSortString(resource.sampleAvailability),
    [sortKey('sampleQuantity')]: toSortString(resource.sampleQuantity),
    [sortKey('sex')]: toSortString(resource.sex),
    [sortKey('developmentalStage')]: toSortString(resource.developmentalStage),
    [sortKey('associatedGenotype')]: toSortString(resource.associatedGenotype),
    [sortKey('cellType')]: toSortString(resource.cellType),
    [sortKey('locationOfOrigin')]: toSortString(resource.locationOfOrigin),
    [sortKey('itemLocation')]: toSortString(resource.itemLocation),
  };
};

const getCells = ({
  column,
  data,
  isLoading,
}: {
  column: Column;
  data: Record<string, unknown>;
  isLoading?: boolean;
}) => {
  const field = SORT_KEY_TO_FIELD[column.property] ?? column.property;
  const value = data?.[field];

  if (field === 'identifier') {
    const id = value as { identifier: string; url: string } | null;
    if (!id) return null;
    return id.url ? (
      <Link href={id.url} isExternal fontSize='sm'>
        {id.identifier || id.url}
      </Link>
    ) : (
      <Text fontSize='sm'>{id.identifier}</Text>
    );
  }

  if (field === 'includedInDataCatalog') {
    const cat = value as { name: string; url: string | null } | null;
    if (!cat) return null;
    return cat.url ? (
      <Link href={cat.url} isExternal fontSize='sm'>
        {cat.name || cat.url}
      </Link>
    ) : (
      <Text fontSize='sm'>{cat.name}</Text>
    );
  }

  if (field === 'date' || field === 'conditionsOfAccess') {
    return value ? <Text fontSize='sm'>{String(value)}</Text> : null;
  }

  return Cell.renderCellData({ column, data: value as any, isLoading });
};

interface SampleResultsTableProps {
  results: FormattedResource[];
  isLoading: boolean;
}

export const SampleResultsTable: React.FC<SampleResultsTableProps> = ({
  results,
  isLoading,
}) => {
  const rows = useMemo(() => results.map(toRow), [results]);

  return (
    <Skeleton isLoaded={!isLoading} width='100%'>
      <Table
        ariaLabel='Sample search results'
        caption='Table of sample search results'
        columns={SAMPLE_RESULTS_COLUMNS}
        data={rows as any}
        getCells={getCells as any}
        isLoading={isLoading}
        hasPagination={false}
        tableContainerProps={{
          overflowX: 'auto',
        }}
        tableHeadProps={{
          sx: {
            '> tr > *': {
              minW: '120px !important',
              maxW: '240px !important',
            },
          },
        }}
        tableBodyProps={{
          sx: {
            '> tr > *': {
              minW: '120px !important',
              maxW: '240px !important',
            },
          },
        }}
        getTableRowProps={(_, idx) => ({
          bg: idx % 2 === 0 ? 'white' : 'page.alt',
        })}
      />
    </Skeleton>
  );
};
