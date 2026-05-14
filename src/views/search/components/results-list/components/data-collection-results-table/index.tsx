import React from 'react';
import { Flex, Text } from '@chakra-ui/react';
import { Link } from 'src/components/link';
import { Column } from 'src/components/table';
import { FormattedResource, IncludedInDataCatalog } from 'src/utils/api/types';
import { getTruncatedText } from 'src/components/table/helpers';
import { ResultsTable } from '../results-table';
import { BaseColumn } from '../results-table/types';
import { withWidth } from '../results-table/utils';
import { renderCellData } from '../results-table/components/Cells';
import { DATA_COLLECTION_REQUIRED_COLUMN_IDS } from '../results-table/constants';

export interface DataCollectionColumn extends BaseColumn {}

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
    id: 'exampleOfWork',
    title: 'Asset Type',
    property: 'exampleOfWork',
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
    title: 'Based On',
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

export const toRow = (resource: FormattedResource): Record<string, unknown> => {
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

export const getCells = ({
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

  // Example of Work: render each exampleOfWork.about[] entry as an external
  // link (name, url), stacked vertically.
  if (column.property === 'exampleOfWork') {
    if (!value) return null;

    // exampleOfWork is a single CreativeWork object, not an array.
    const exampleOfWorkObj = value as {
      about?:
        | Array<{ displayName?: string; url?: string }>
        | { displayName?: string; url?: string };
    };

    const aboutItems = exampleOfWorkObj.about
      ? Array.isArray(exampleOfWorkObj.about)
        ? exampleOfWorkObj.about
        : [exampleOfWorkObj.about]
      : [];

    const validItems = aboutItems
      .filter(item => item.displayName || item.url)
      .sort((a, b) => {
        const labelA = a.displayName || a.url || '';
        const labelB = b.displayName || b.url || '';
        return labelA.localeCompare(labelB);
      });
    if (validItems.length === 0) return null;

    return (
      <Flex flexDirection='column' gap={2}>
        {validItems.map((item, idx) => {
          const label = item.displayName || item.url || '';
          return item.url ? (
            <Link key={idx} href={item.url} isExternal fontSize='sm'>
              {label}
            </Link>
          ) : (
            <Text key={idx} fontSize='sm'>
              {label}
            </Text>
          );
        })}
      </Flex>
    );
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
  // DefinedTerm / QuantitativeValue fields.
  return renderCellData({ column, data: value as any, isLoading });
};

interface DataCollectionResultsTableProps {
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
   * When undefined, the default ALL_DATA_COLLECTION_COLUMNS order is used.
   */
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
}: DataCollectionResultsTableProps) => (
  <ResultsTable
    columns={ALL_DATA_COLLECTION_COLUMNS}
    results={results}
    isLoading={isLoading}
    toRow={toRow}
    getCells={getCells}
    ariaLabel='Data collection search results'
    caption='Table of data collection search results'
    requiredColumnIds={
      DATA_COLLECTION_REQUIRED_COLUMN_IDS as unknown as string[]
    }
    visibleColumnIds={visibleColumnIds}
    columnOrder={columnOrder}
    currentSort={currentSort}
    onSortChange={onSortChange}
  />
);
