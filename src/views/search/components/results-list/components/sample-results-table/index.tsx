import React, { useMemo } from 'react';
import { Text } from '@chakra-ui/react';
import { Skeleton } from 'src/components/skeleton';
import { Table, Column } from 'src/components/table';
import { Link } from 'src/components/link';
import { FormattedResource, IncludedInDataCatalog } from 'src/utils/api/types';
import { renderCellData } from './components/Cells';
import { getTruncatedText } from 'src/components/table/helpers';

// For columns whose display value is a rich object (e.g. { identifier, url })
// or an array of DefinedTerms, a parallel `_sort_<field>` plain string
// is stored on each row. The column `property` points at that sort key;
// getCells remaps it back to the original field name to read the display value.
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

// The shared Column interface exposes `props?: any` which Table spreads onto
// both the <Th> header cell and every <Cell> data cell in its render loop.
const withWidth = (width: string) => ({
  minW: width,
  maxW: width,
  w: width,
});

// Adjust the width string in `props` to change a column's rendered width.
// Both the header and every body cell will reflect the change automatically.

// All possible columns for the sample results table.
// Each column has a stable `id` field used for visibility tracking.
export interface SampleColumn extends Column {
  // Stable identifier used for localStorage persistence
  id: string;
}

export const ALL_SAMPLE_COLUMNS: SampleColumn[] = [
  {
    id: 'identifier',
    title: 'Identifier',
    property: sortKey('identifier'),
    isSortable: true,
    props: withWidth('180px'),
  },
  {
    id: 'alternateIdentifier',
    title: 'Alternate Identifier',
    property: sortKey('alternateIdentifier'),
    isSortable: true,
    props: withWidth('180px'),
  },
  {
    id: 'name',
    title: 'Name',
    property: sortKey('name'),
    isSortable: true,
    props: withWidth('250px'),
  },
  {
    id: 'date',
    title: 'Date',
    property: sortKey('date'),
    isSortable: true,
    props: withWidth('130px'),
  },
  {
    id: 'includedInDataCatalog',
    title: 'Source',
    property: sortKey('includedInDataCatalog'),
    isSortable: true,
    props: withWidth('160px'),
  },
  {
    id: 'description',
    title: 'Description',
    property: sortKey('description'),
    isSortable: true,
    props: withWidth('250px'),
  },
  {
    id: 'healthCondition',
    title: 'Health Condition',
    property: sortKey('healthCondition'),
    isSortable: true,
    props: withWidth('160px'),
  },
  {
    id: 'infectiousAgent',
    title: 'Infectious Agent',
    property: sortKey('infectiousAgent'),
    isSortable: true,
    props: withWidth('160px'),
  },
  {
    id: 'species',
    title: 'Species',
    property: sortKey('species'),
    isSortable: true,
    props: withWidth('170px'),
  },
  {
    id: 'conditionsOfAccess',
    title: 'Conditions of Access',
    property: sortKey('conditionsOfAccess'),
    isSortable: true,
    props: withWidth('180px'),
  },
  {
    id: 'variableMeasured',
    title: 'Variable Measured',
    property: sortKey('variableMeasured'),
    isSortable: true,
    props: withWidth('160px'),
  },
  {
    id: 'measurementTechnique',
    title: 'Measurement Technique',
    property: sortKey('measurementTechnique'),
    isSortable: true,
    props: withWidth('200px'),
  },
  {
    id: 'anatomicalStructure',
    title: 'Anatomical Structure',
    property: sortKey('anatomicalStructure'),
    isSortable: true,
    props: withWidth('180px'),
  },
  {
    id: 'anatomicalSystem',
    title: 'Anatomical System',
    property: sortKey('anatomicalSystem'),
    isSortable: true,
    props: withWidth('160px'),
  },
  {
    id: 'sampleType',
    title: 'Sample Type',
    property: sortKey('sampleType'),
    isSortable: true,
    props: withWidth('140px'),
  },
  {
    id: 'sampleAvailability',
    title: 'Sample Availability',
    property: sortKey('sampleAvailability'),
    isSortable: true,
    props: withWidth('170px'),
  },
  {
    id: 'sampleQuantity',
    title: 'Sample Quantity',
    property: sortKey('sampleQuantity'),
    isSortable: true,
    props: withWidth('150px'),
  },
  {
    id: 'sex',
    title: 'Sex',
    property: sortKey('sex'),
    isSortable: true,
    props: withWidth('100px'),
  },
  {
    id: 'developmentalStage',
    title: 'Developmental Stage',
    property: sortKey('developmentalStage'),
    isSortable: true,
    props: withWidth('190px'),
  },
  {
    id: 'associatedGenotype',
    title: 'Associated Genotype',
    property: sortKey('associatedGenotype'),
    isSortable: true,
    props: withWidth('180px'),
  },
  {
    id: 'associatedPhenotype',
    title: 'Associated Phenotype',
    property: sortKey('associatedPhenotype'),
    isSortable: true,
    props: withWidth('180px'),
  },
  {
    id: 'cellType',
    title: 'Cell Type',
    property: sortKey('cellType'),
    isSortable: true,
    props: withWidth('150px'),
  },
  {
    id: 'locationOfOrigin',
    title: 'Location of Origin',
    property: sortKey('locationOfOrigin'),
    isSortable: true,
    props: withWidth('185px'),
  },
  {
    id: 'itemLocation',
    title: 'Item Location',
    property: sortKey('itemLocation'),
    isSortable: true,
    props: withWidth('150px'),
  },
];

const SORT_KEY_TO_FIELD: Record<string, string> = Object.fromEntries(
  ALL_SAMPLE_COLUMNS.map(col => [
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

  const rawIdentifier = (resource as any).identifier;
  const resolvedIdentifier = Array.isArray(rawIdentifier)
    ? (resource as any)._id?.replace(/^_/, '').toUpperCase() ?? ''
    : typeof rawIdentifier === 'string' && rawIdentifier
    ? rawIdentifier
    : (resource as any)._id?.replace(/^_/, '').toUpperCase() ?? '';

  const identifierDisplay = {
    identifier: resolvedIdentifier,
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
  // Remap the sort-key property back to the real field name for display.
  const field = SORT_KEY_TO_FIELD[column.property] ?? column.property;
  const value = data?.[field];

  // Identifier: { identifier, url } => link or plain text
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

  // Source: { name, url } => link or plain text
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

  // Limit description to 144 characters
  if (field === 'description') {
    const { text } = getTruncatedText(value as string, false, 144);
    return text ? (
      <Text fontSize='sm'>
        {text}
        {(value as string).length > 144 ? '…' : ''}
      </Text>
    ) : null;
  }

  // Scalar string fields that don't need DefinedTerm / QuantitativeValue rendering
  if (field === 'date' || field === 'conditionsOfAccess') {
    return value ? <Text fontSize='sm'>{String(value)}</Text> : null;
  }

  // Other fields
  return renderCellData({ column, data: value as any, isLoading });
};

interface SampleResultsTableProps {
  results: FormattedResource[];
  isLoading: boolean;
  /**
   * IDs of columns that should be visible.
   * When undefined, all columns are shown.
   */
  visibleColumnIds?: string[];
  /**
   * Full ordered list of all column IDs (visible + hidden).
   * The table renders visible columns in this order.
   * When undefined, the default ALL_SAMPLE_COLUMNS order is used.
   */
  columnOrder?: string[];
}

export const SampleResultsTable = ({
  results,
  isLoading,
  visibleColumnIds,
  columnOrder,
}: SampleResultsTableProps) => {
  const rows = useMemo(() => results.map(toRow), [results]);

  // Build the ordered + filtered column list:
  // 1. Start from columnOrder (if provided) or the master list order.
  // 2. Keep only columns that are in visibleColumnIds.
  const visibleColumns = useMemo(() => {
    const sourceOrder =
      columnOrder && columnOrder.length > 0
        ? columnOrder
            .map(id => ALL_SAMPLE_COLUMNS.find(c => c.id === id))
            .filter((c): c is SampleColumn => !!c)
        : ALL_SAMPLE_COLUMNS;

    if (!visibleColumnIds) return sourceOrder;
    return sourceOrder.filter(col => visibleColumnIds.includes(col.id));
  }, [visibleColumnIds, columnOrder]);

  return (
    <Skeleton isLoaded={!isLoading} width='100%'>
      <Table
        ariaLabel='Sample search results'
        caption='Table of sample search results'
        columns={visibleColumns}
        data={rows as any}
        getCells={getCells as any}
        isLoading={isLoading}
        hasPagination={false}
        tableContainerProps={{
          overflowX: 'auto',
        }}
        tableHeadProps={{
          sx: {
            // Replace per-cell bottom border with a single full-width
            // border on the thead row, which always spans the container width.
            th: { borderBottom: 'none' },
            tr: { borderBottom: '1px solid', borderColor: 'gray.200' },
          },
        }}
        getTableRowProps={(_, idx) => ({
          bg: idx % 2 === 0 ? 'white' : 'page.alt',
        })}
      />
    </Skeleton>
  );
};
