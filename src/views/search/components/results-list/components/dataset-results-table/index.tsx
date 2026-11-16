import { Box } from '@chakra-ui/react';
import React, { useCallback, useMemo } from 'react';
import { ConditionsOfAccess } from 'src/components/badges';
import { ExpandableText } from 'src/components/expandable-cells';
import {
  CellContext,
  ColumnCustomizer,
  ColumnDef,
  createColumnHelper,
  DataTable,
  isEmptyValue,
  SortState,
  toText,
  useColumnPreferences,
  useDataTable,
} from 'src/components/table/data-table';
import {
  FormattedResource,
  SampleAggregate,
  SampleCollection,
  UsageInfo,
} from 'src/utils/api/types';
import { formatAuthorsList2String } from 'src/utils/helpers/authors';

import { CellValue, renderCellData } from '../results-table/components/Cells';
import {
  LinkEntry,
  LinkListCell,
  LinkOrTextCell,
  SearchResourceNameCell,
} from '../results-table/components/SharedCells';
import {
  normalizeTermNames,
  toArray,
  toCatalogEntry,
  toFunderEntries,
  toFundingIdEntries,
  toLicenseEntry,
  toSortState,
} from '../results-table/utils';

/*
The Datasets tab's table view, on the shared DataTable
(src/components/table/data-table). Columns mirror the metadata the Dataset card
displays: the card header fields (name, source, date, author, access badge,
description) followed by the properties in the card's metadata accordion, in
its SORT_ORDER. Labels match the card's wording.

Rows are the API results as they come; each column's `accessor` shapes its own
value, so a hidden column costs nothing. Sorting is server-side: the table only
reports the requested sort, and the page refetches.
*/

type SampleEntry = { count: number; kind: 'experimental' | 'population' };

/**
 * Reduce the record's `sample` to the single count the table shows, along with
 * which kind of sample it is. Discriminates on the top-level `@type`, the same
 * way the card's sample pill does: a SampleCollection is an experimental count,
 * a SampleAggregate a population count. Returns null when there is no count to
 * show.
 */
const getSampleEntry = (
  sample?: SampleAggregate | SampleCollection | null,
): SampleEntry | null => {
  if (!sample) return null;

  if (sample['@type'] === 'SampleCollection') {
    const count = (sample as SampleCollection).numberOfItems?.value;
    return count == null ? null : { count, kind: 'experimental' };
  }

  const { sampleQuantity } = sample as SampleAggregate;
  const count =
    sampleQuantity && !Array.isArray(sampleQuantity)
      ? sampleQuantity.value
      : undefined;

  return count == null ? null : { count, kind: 'population' };
};

const defineColumn = createColumnHelper<FormattedResource>();

/**
 * DefinedTerm / QuantitativeValue properties (pathogen, species, …): one term
 * per line, linked when the term has a url, "Show N More" past 5.
 */
const termListColumn = (
  id: string,
  header: string,
  accessor: (row: FormattedResource) => unknown,
) =>
  defineColumn({
    id,
    header,
    type: 'list',
    accessor: row => accessor(row) as CellValue | CellValue[],
    cell: ({ value, column }) =>
      isEmptyValue(value)
        ? null
        : renderCellData({ data: value, toggleContext: column.header }),
  });

/**
 * Several values stacked one per line, each linked when it has a url. Returns
 * null for none, so the table shows its "No data" placeholder (a
 * `LinkListCell` element rendering nothing would leave the cell blank).
 */
const linkListCell = ({
  value,
  column,
}: CellContext<FormattedResource, LinkEntry[] | null>) =>
  value?.length ? (
    <LinkListCell entries={value} toggleContext={column.header} />
  ) : null;

/**
 * Every column the table offers, in their default order (ids are the ones the
 * pre-DataTable table persisted, so saved preferences migrate). All are shown
 * by default. Kept as a module constant: cells memoize on it.
 */
export const DATASET_COLUMNS: ColumnDef<FormattedResource>[] = [
  defineColumn({
    id: 'name',
    header: 'Name',
    accessor: row => ({
      label: row.name || toText(row.alternateName),
      id: row.id,
    }),
    sort: true,
    size: { min: 200, max: 320 },
    // Links to the resource page, as the card's title does.
    cell: ({ value }) =>
      value.label ? (
        <SearchResourceNameCell label={value.label} id={value.id} />
      ) : null,
  }),
  defineColumn({
    id: 'source',
    header: 'Source',
    type: 'link',
    accessor: row => toCatalogEntry(row.includedInDataCatalog),
    sort: true,
    cell: ({ value }) =>
      value ? <LinkOrTextCell label={value.name} url={value.url} /> : null,
  }),
  defineColumn({ id: 'date', header: 'Date', type: 'date', sort: true }),
  defineColumn({
    id: 'author',
    header: 'Author',
    // The same comma-joined string the card shows, clamped.
    accessor: row => formatAuthorsList2String(row.author, ',', 10),
    size: { min: 180, max: 280 },
    cell: ({ value, column }) =>
      value ? (
        <ExpandableText
          text={value}
          noOfLines={3}
          toggleContext={column.header}
        />
      ) : null,
  }),
  defineColumn({
    id: 'conditionsOfAccess',
    header: 'Conditions of Access',
    accessor: row => row.conditionsOfAccess,
    sort: true,
    // The result card's badge (with its explanatory tooltip).
    cell: ({ value, row }) =>
      value && row['@type'] ? (
        <ConditionsOfAccess conditionsOfAccess={value} type={row['@type']} />
      ) : null,
  }),
  defineColumn({ id: 'description', header: 'Description', type: 'longText' }),
  termListColumn('infectiousAgent', 'Pathogen', row => row.infectiousAgent),
  termListColumn('species', 'Species', row => row.species),
  termListColumn(
    'healthCondition',
    'Health Condition',
    row => row.healthCondition,
  ),
  // Some terms carry an array `name`; joined the way the card does.
  termListColumn('measurementTechnique', 'Measurement Technique', row =>
    normalizeTermNames(row.measurementTechnique),
  ),
  termListColumn(
    'variableMeasured',
    'Variable Measured',
    row => row.variableMeasured,
  ),
  defineColumn({
    id: 'samples',
    header: 'Samples',
    accessor: row => getSampleEntry(row.sample),
    cell: ({ value }) =>
      value ? `${value.count.toLocaleString()} (${value.kind})` : null,
  }),
  defineColumn({
    id: 'funder',
    header: 'Funder',
    type: 'list',
    // Each name linked to the funder's identifier.
    accessor: row =>
      toFunderEntries(row.funding)?.map(({ name, identifier }) => ({
        label: name,
        url: identifier,
      })) ?? null,
    cell: linkListCell,
  }),
  defineColumn({
    id: 'fundingId',
    header: 'Funding ID',
    type: 'identifier',
    // Each identifier linked to its funding URL.
    accessor: row =>
      toFundingIdEntries(row.funding)?.map(({ identifier, url }) => ({
        label: identifier,
        url,
      })) ?? null,
    cell: linkListCell,
  }),
  defineColumn({
    id: 'license',
    header: 'License',
    type: 'link',
    accessor: row => toLicenseEntry(row.license),
    cell: ({ value }) =>
      value ? <LinkOrTextCell label={value.title} url={value.url} /> : null,
  }),
  defineColumn({
    id: 'usageInfo',
    header: 'Usage Info',
    type: 'link',
    // A single object or an array; an entry with no name reads "Usage
    // Agreement", as on the card.
    accessor: row =>
      toArray<UsageInfo>(row.usageInfo)
        .map(info => ({
          label: info?.name || 'Usage Agreement',
          url: info?.url ?? null,
        }))
        .filter(entry => entry.label || entry.url),
    cell: linkListCell,
  }),
  termListColumn('topicCategory', 'Topic Category', row => row.topicCategory),
];

/** The API sort field for each sortable column. */
const API_SORT_FIELDS: Record<string, string> = {
  name: 'name.raw',
  source: 'includedInDataCatalog.name',
  date: 'date',
  conditionsOfAccess: 'conditionsOfAccess',
};

/** Pre-v1 keys written by the old customize-columns popover. */
const LEGACY_KEYS = {
  visible: 'search-visible-dataset-columns',
  order: 'search-dataset-column-order',
};
/** Every column can be hidden; "Clear All" leaves Name. */
const FALLBACK_IDS = ['name'];

/**
 * The table's column choices. The customizer (in the results toolbar) and the
 * table each call this; same table id, so they share one state.
 */
const useDatasetColumnPreferences = () =>
  useColumnPreferences({
    tableId: 'search-datasets',
    columns: DATASET_COLUMNS,
    fallbackIds: FALLBACK_IDS,
    legacyKeys: LEGACY_KEYS,
  });

const getRowId = (row: FormattedResource, index: number) =>
  row._id || row.id || String(index);

/** The "Customize Columns" popover for the Datasets table. */
export const DatasetColumnCustomizer = () => {
  const preferences = useDatasetColumnPreferences();
  return (
    <ColumnCustomizer
      columns={DATASET_COLUMNS}
      preferences={preferences}
      allowReorder
    />
  );
};

interface DatasetResultsTableProps {
  /** The current page of results, already sorted by the API. */
  results: FormattedResource[];
  loading: boolean;
  /**
   * The current API sort string (e.g. `"name.raw"` or `"-date"`; a leading
   * `-` is descending). The matching column shows as sorted; a sort no column
   * matches ("Best match") shows none.
   */
  currentSort?: string;
  /**
   * Called when a sortable header is clicked, with that column's API sort
   * field and the requested direction. The caller updates the URL and
   * refetches.
   */
  onSortChange: (apiField: string, ascending: boolean) => void;
}

export const DatasetResultsTable = ({
  results,
  loading,
  currentSort,
  onSortChange,
}: DatasetResultsTableProps) => {
  const preferences = useDatasetColumnPreferences();
  const sortState = useMemo(
    () => toSortState(currentSort, API_SORT_FIELDS),
    [currentSort],
  );
  const handleSortChange = useCallback(
    (next: SortState) => {
      const field = API_SORT_FIELDS[next.columnId];
      if (field) onSortChange(field, next.direction === 'asc');
    },
    [onSortChange],
  );

  const table = useDataTable({
    data: results,
    columns: DATASET_COLUMNS,
    getRowId,
    preferences,
    sort: { mode: 'server', state: sortState, onChange: handleSortChange },
  });

  return (
    <Box width='100%'>
      <DataTable
        table={table}
        label='Dataset search results'
        maxHeight='70vh'
        skeletonRows={10}
        status={{ loading }}
      />
    </Box>
  );
};
