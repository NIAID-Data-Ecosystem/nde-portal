import React, { useMemo } from 'react';
import { Text } from '@chakra-ui/react';
import { Link } from 'src/components/link';
import { Column } from 'src/components/table';
import { FormattedResource, IncludedInDataCatalog } from 'src/utils/api/types';
import { ResultsTable } from '../results-table';
import { BaseColumn } from '../results-table/types';
import { withWidth } from '../results-table/utils';
import { renderCellData } from '../results-table/components/Cells';
import {
  ExpandableList,
  ExpandableText,
} from '../results-table/components/ExpandableCells';
import {
  LinkOrTextCell,
  ResourceNameCell,
} from '../results-table/components/SharedCells';
import { DATA_COLLECTION_REQUIRED_COLUMN_IDS } from '../results-table/constants';
import {
  ContentTypeTerm,
  getContentTypeLabel,
  getContentTypeTerms,
} from '../../utils/content-type';

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
    id: 'contentType',
    title: 'Content Type',
    property: 'contentType',
    isSortable: false,
    apiSortField: null,
    props: withWidth('220px'),
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
    title: 'Pathogen Species',
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
    // `about` and `exampleOfWork.about` are shown together as one column, so
    // they are merged and deduplicated here.
    contentType: getContentTypeTerms(resource),
  };
};

// Builds the cell renderer for this table.
export const createGetCells =
  (referrerPath?: string) =>
  ({
    column,
    data,
    isLoading,
  }: {
    column: Column;
    data: Record<string, unknown>;
    isLoading?: boolean;
  }) => {
    const value = data?.[column.property];

    // Name: links to the resource page.
    if (column.property === 'name') {
      return (
        <ResourceNameCell
          label={(value as string) || (data?.alternateName as string) || ''}
          id={data?.id as string | undefined}
          referrerPath={referrerPath}
        />
      );
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

    // Content Type: the merged `about` + `exampleOfWork.about` terms built in
    // toRow, sorted alphabetically and stacked one per line. Each links out to
    // the term's ontology entry when it has one.
    if (column.property === 'contentType') {
      const entries = ((value as ContentTypeTerm[] | undefined) ?? [])
        .map(term => ({
          label: getContentTypeLabel(term),
          url: term.url ?? null,
        }))
        .filter(entry => entry.label)
        .sort((a, b) => a.label.localeCompare(b.label));

      if (entries.length === 0) return null;

      return (
        <ExpandableList>
          {entries.map((entry, idx) => (
            <LinkOrTextCell key={idx} label={entry.label} url={entry.url} />
          ))}
        </ExpandableList>
      );
    }

    // Conditions of Access and Date: plain text
    if (
      column.property === 'conditionsOfAccess' ||
      column.property === 'date'
    ) {
      return value ? <Text fontSize='sm'>{String(value)}</Text> : null;
    }

    // Description: clamped to a few lines with a "Show more" / "Show less" toggle.
    if (column.property === 'description') {
      return (
        <ExpandableText
          text={(value as string) || ''}
          noOfLines={4}
          isLoading={isLoading}
        />
      );
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
        <ExpandableList>
          {actionNames.map((name: string, idx: number) => (
            <Text key={idx} fontSize='sm'>
              {name}
            </Text>
          ))}
        </ExpandableList>
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
        <ExpandableList>
          {formatted.map((text, idx) => (
            <Text key={idx} fontSize='sm'>
              {text}
            </Text>
          ))}
        </ExpandableList>
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
  /**
   * Current path of the search page, forwarded to the resource page by the
   * Name cell's link so its breadcrumb can point back to this search.
   */
  referrerPath?: string;
}

export const DataCollectionResultsTable = ({
  results,
  isLoading,
  visibleColumnIds,
  columnOrder,
  currentSort,
  onSortChange,
  referrerPath,
}: DataCollectionResultsTableProps) => {
  const getCells = useMemo(() => createGetCells(referrerPath), [referrerPath]);

  return (
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
};
