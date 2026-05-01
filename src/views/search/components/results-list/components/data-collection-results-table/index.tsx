import React, { useMemo } from 'react';
import { Flex, Text } from '@chakra-ui/react';
import { Skeleton } from 'src/components/skeleton';
import { Table, Column } from 'src/components/table';
import { Link } from 'src/components/link';
import { FormattedResource, IncludedInDataCatalog } from 'src/utils/api/types';
import { getTruncatedText } from 'src/components/table/helpers';
import { REQUIRED_COLUMN_IDS } from './components/CustomizeColumnsPopover';
import { renderCellData } from '../sample-results-table/components/Cells';

// The shared Column interface exposes `props?: any` which Table spreads onto
// both the <Th> header cell and every <Cell> data cell in its render loop.
const withWidth = (width: string) => ({
  minW: width,
  maxW: width,
  w: width,
});

export interface DataCollectionColumn extends Column {
  /** Stable identifier used for localStorage persistence. */
  id: string;
  /**
   * The API sort field to use when this column's sort toggle is clicked.
   * `null` means the column is not server-sortable.
   */
  apiSortField: string | null;
}

export const ALL_DATA_COLLECTION_COLUMNS: DataCollectionColumn[] = [
  {
    id: 'name',
    title: 'Name',
    property: 'name',
    isSortable: false,
    apiSortField: null,
    props: withWidth('250px'),
  },
  {
    id: 'source',
    title: 'Source',
    property: 'includedInDataCatalog',
    isSortable: false,
    apiSortField: null,
    props: withWidth('160px'),
  },
  {
    id: 'about',
    title: 'About',
    property: 'about',
    isSortable: false,
    apiSortField: null,
    props: withWidth('200px'),
  },
  {
    id: 'conditionsOfAccess',
    title: 'Conditions of Access',
    property: 'conditionsOfAccess',
    isSortable: false,
    apiSortField: null,
    props: withWidth('180px'),
  },
  {
    id: 'date',
    title: 'Date',
    property: 'date',
    isSortable: false,
    apiSortField: null,
    props: withWidth('130px'),
  },
  {
    id: 'description',
    title: 'Description',
    property: 'description',
    isSortable: false,
    apiSortField: null,
    props: withWidth('250px'),
  },
  {
    id: 'healthCondition',
    title: 'Health Condition',
    property: 'healthCondition',
    isSortable: false,
    apiSortField: null,
    props: withWidth('160px'),
  },
  {
    id: 'infectiousAgent',
    title: 'Infectious Agent',
    property: 'infectiousAgent',
    isSortable: false,
    apiSortField: null,
    props: withWidth('160px'),
  },
  {
    id: 'species',
    title: 'Host Species',
    property: 'species',
    isSortable: false,
    apiSortField: null,
    props: withWidth('170px'),
  },
  {
    id: 'topicCategory',
    title: 'Topic Category',
    property: 'topicCategory',
    isSortable: false,
    apiSortField: null,
    props: withWidth('190px'),
  },
  {
    id: 'isBasedOn',
    title: 'Based On',
    property: 'isBasedOn',
    isSortable: false,
    apiSortField: null,
    props: withWidth('200px'),
  },
];

const REQUIRED_COLUMNS = ALL_DATA_COLLECTION_COLUMNS.filter(col =>
  REQUIRED_COLUMN_IDS.includes(col.id),
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

  return {
    ...resource,
    includedInDataCatalog: catalog
      ? { name: catalog.name ?? '', url: catalogUrl }
      : null,
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
  const value = data?.[column.property];

  // Name: plain text
  if (column.property === 'name') {
    return value ? <Text fontSize='sm'>{String(value)}</Text> : null;
  }

  // Source: { name, url } => link or plain text
  if (column.property === 'includedInDataCatalog') {
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

  // About: comma-separated list of about[].name values.
  // Normalizes to array first since the API may return a single object
  // instead of an array when there is only one entry.
  if (column.property === 'about') {
    if (!value) return null;
    const aboutArray = Array.isArray(value) ? value : [value];
    const names = aboutArray
      .map(
        (item: {
          name: string;
          displayName: string;
          url: string;
          description: string;
        }) => item.name,
      )
      .filter(Boolean)
      .join(', ');
    return names ? <Text fontSize='sm'>{names}</Text> : null;
  }

  // Conditions of Access and Date: plain text
  if (column.property === 'conditionsOfAccess' || column.property === 'date') {
    return value ? <Text fontSize='sm'>{String(value)}</Text> : null;
  }

  // Description: truncated to 144 characters
  if (column.property === 'description') {
    const { text } = getTruncatedText(value as string, false, 144);
    return text ? (
      <Text fontSize='sm'>
        {text}
        {(value as string).length > 144 ? '…' : ''}
      </Text>
    ) : null;
  }

  // isBasedOn: render the name of each entry whose @type is "Action" as
  // plain text. Multiple matching entries are stacked vertically.
  if (column.property === 'isBasedOn') {
    if (!value) return null;
    const entries = Array.isArray(value) ? value : [value];
    const actionNames = entries
      .filter(
        (entry: { '@type'?: string; name?: string }) =>
          entry?.['@type'] === 'Action' && entry?.name,
      )
      .map((entry: { name: string }) => entry.name);

    if (actionNames.length === 0) return null;

    return (
      <Flex flexDirection='column' gap={2}>
        {actionNames.map((name: string, idx: number) => (
          <Text key={idx} fontSize='sm'>
            {name}
          </Text>
        ))}
      </Flex>
    );
  }

  // healthCondition, infectiousAgent, species, topicCategory, and any other
  // DefinedTerm / QuantitativeValue fields: delegate to the shared cell
  // renderer.
  return renderCellData({ column, data: value as any, isLoading });
};

interface DataCollectionResultsTableProps {
  results: FormattedResource[];
  isLoading: boolean;
  visibleColumnIds?: string[];
  columnOrder?: string[];
}

export const DataCollectionResultsTable = ({
  results,
  isLoading,
  visibleColumnIds,
  columnOrder,
}: DataCollectionResultsTableProps) => {
  const rows = useMemo(() => results.map(toRow), [results]);

  // Build the ordered + filtered column list:
  // 1. Start from columnOrder (if provided) or the master list order.
  // 2. Keep only columns that are in visibleColumnIds.
  const visibleColumns = useMemo(() => {
    const sourceOrder =
      columnOrder && columnOrder.length > 0
        ? columnOrder
            .map(id => ALL_DATA_COLLECTION_COLUMNS.find(c => c.id === id))
            .filter((c): c is DataCollectionColumn => !!c)
        : ALL_DATA_COLLECTION_COLUMNS;

    const filtered = visibleColumnIds
      ? sourceOrder.filter(col => visibleColumnIds.includes(col.id))
      : sourceOrder;

    return filtered.length > 0 ? filtered : REQUIRED_COLUMNS;
  }, [visibleColumnIds, columnOrder]);

  return (
    <Skeleton isLoaded={!isLoading} width='100%'>
      <Table
        ariaLabel='Data collection search results'
        caption='Table of data collection search results'
        columns={visibleColumns}
        data={rows as any}
        getCells={getCells as any}
        isLoading={isLoading}
        hasPagination={false}
        // Opt in to sticky headers. The bounded maxHeight and overflowY give
        // the browser a scroll boundary, which is required for position:sticky
        // on the thead element to function correctly.
        stickyHeader
        // Opt in to the mirrored top horizontal scrollbar.
        showTopScrollbar
        tableContainerProps={{
          overflowX: 'auto',
          maxHeight: '70vh',
          overflowY: 'auto',
        }}
        tableHeadProps={{
          sx: {
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
