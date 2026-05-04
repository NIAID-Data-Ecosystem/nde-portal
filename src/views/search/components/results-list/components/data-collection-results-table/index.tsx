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
    isSortable: true,
    apiSortField: 'name.raw',
    props: withWidth('250px'),
  },
  {
    id: 'source',
    title: 'Source',
    property: 'includedInDataCatalog',
    isSortable: true,
    apiSortField: 'includedInDataCatalog.name',
    props: withWidth('160px'),
  },
  {
    id: 'about',
    title: 'Data Type',
    property: 'about',
    isSortable: false,
    apiSortField: null,
    props: withWidth('200px'),
  },
  {
    id: 'conditionsOfAccess',
    title: 'Conditions of Access',
    property: 'conditionsOfAccess',
    isSortable: true,
    apiSortField: 'conditionsOfAccess',
    props: withWidth('180px'),
  },
  {
    id: 'date',
    title: 'Date',
    property: 'date',
    isSortable: true,
    apiSortField: 'date',
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
    props: withWidth('160px'),
  },
  {
    id: 'isBasedOn',
    title: 'Is Based On',
    property: 'isBasedOn',
    isSortable: false,
    apiSortField: null,
    props: withWidth('200px'),
  },
  {
    id: 'collectionSize',
    title: 'Collection Size',
    property: 'collectionSize',
    isSortable: false,
    apiSortField: null,
    props: withWidth('180px'),
  },
];

const REQUIRED_COLUMNS = ALL_DATA_COLLECTION_COLUMNS.filter(col =>
  REQUIRED_COLUMN_IDS.includes(col.id),
);

/**
 * Given a column `property`, return the API sort field string, or `null`
 * if the column is not server-sortable.
 */
export const getApiSortFieldForProperty = (property: string): string | null => {
  const col = ALL_DATA_COLLECTION_COLUMNS.find(c => c.property === property);
  return col?.apiSortField ?? null;
};

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

  // collectionSize: renders as "<minValue>+ <unitText lowercase>" per entry.
  // The API may return a single object or an array; both are handled.
  // Multiple entries are stacked vertically.
  if (column.property === 'collectionSize') {
    if (!value) return null;
    const entries = Array.isArray(value) ? value : [value];
    const formatted = entries
      .map((entry: { minValue?: number; unitText?: string }) => {
        const numericPart =
          entry.minValue != null ? `${entry.minValue}+` : null;
        const unitPart = entry.unitText ? entry.unitText.toLowerCase() : null;
        if (!numericPart && !unitPart) return null;
        return [numericPart, unitPart].filter(Boolean).join(' ');
      })
      .filter((s): s is string => s !== null);

    if (formatted.length === 0) return null;
    if (formatted.length === 1) {
      return <Text fontSize='sm'>{formatted[0]}</Text>;
    }
    return (
      <Flex flexDirection='column' gap={2}>
        {formatted.map((text, idx) => (
          <Text key={idx} fontSize='sm'>
            {text}
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

/**
 * Derive the controlled-sort props that the generic `Table` component
 * understands from the raw API `sort` string (e.g. `"-name.raw"`).
 *
 * Return `{ controlledSortProperty, controlledSortAsc }` where
 * `controlledSortProperty` is the matching column `property` value,
 * or `null` when no column matches.
 */
const deriveControlledSortProps = (
  currentSort: string,
): { controlledSortProperty: string | null; controlledSortAsc: boolean } => {
  const isDesc = currentSort.startsWith('-');
  const apiField = isDesc ? currentSort.slice(1) : currentSort;

  const matchingColumn = ALL_DATA_COLLECTION_COLUMNS.find(
    col => col.apiSortField === apiField,
  );

  return {
    controlledSortProperty: matchingColumn?.property ?? null,
    controlledSortAsc: !isDesc,
  };
};

interface DataCollectionResultsTableProps {
  results: FormattedResource[];
  isLoading: boolean;
  visibleColumnIds?: string[];
  columnOrder?: string[];
  /**
   * The currently active API sort string (e.g. `"name.raw"` or `"-date"`).
   * A leading `-` indicates descending order.
   * When provided the table header highlights the matching column and
   * delegates sort-toggle clicks to `onSortChange` instead of sorting
   * the page locally.
   */
  currentSort?: string;
  /**
   * Called when the user clicks a sortable column header arrow.
   * Receives the API sort field and the desired direction.
   */
  onSortChange?: (apiField: string, ascending: boolean) => void;
}

export const DataCollectionResultsTable = ({
  results,
  isLoading,
  visibleColumnIds,
  columnOrder,
  currentSort,
  onSortChange,
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

  // Controlled sort: derive which column property is active and its direction.
  const { controlledSortProperty, controlledSortAsc } = useMemo(
    () =>
      currentSort
        ? deriveControlledSortProps(currentSort)
        : { controlledSortProperty: null, controlledSortAsc: true },
    [currentSort],
  );

  // When the user clicks a sort toggle, map the column property back to the
  // API field and bubble the change up to the parent.
  const handleControlledSort = useMemo(() => {
    if (!onSortChange) return undefined;
    return (property: string, ascending: boolean) => {
      const apiField = getApiSortFieldForProperty(property);
      if (apiField) {
        onSortChange(apiField, ascending);
      }
    };
  }, [onSortChange]);

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
        controlledSortProperty={controlledSortProperty}
        controlledSortAsc={controlledSortAsc}
        onControlledSort={handleControlledSort}
      />
    </Skeleton>
  );
};
