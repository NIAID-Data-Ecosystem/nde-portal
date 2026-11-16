import {
  linkListCell,
  resourceColumns,
  searchColumn,
  SearchColumnDef,
} from '../columns';
import { createSearchTable } from '../create-search-table';
import {
  normalizeTermNames,
  toSampleEntry,
  toUsageInfoEntries,
} from '../shaping';

/*
The Datasets tab's table view. Columns mirror the metadata the Dataset card
displays: the card header fields (name, source, date, author, access badge,
description), then the properties in the card's metadata accordion, in its
SORT_ORDER. Ids are the ones the pre-DataTable table persisted, so saved
preferences migrate. All are shown by default.
*/
export const DATASET_COLUMNS: SearchColumnDef[] = [
  resourceColumns.name(),
  resourceColumns.source(),
  resourceColumns.date(),
  resourceColumns.author(),
  resourceColumns.conditionsOfAccess(),
  resourceColumns.description(),
  resourceColumns.terms('infectiousAgent', 'Pathogen'),
  resourceColumns.terms('species', 'Species'),
  resourceColumns.terms('healthCondition', 'Health Condition'),
  // Some terms carry an array `name`; joined the way the card does.
  resourceColumns.terms('measurementTechnique', 'Measurement Technique', row =>
    normalizeTermNames(row.measurementTechnique),
  ),
  resourceColumns.terms('variableMeasured', 'Variable Measured'),
  searchColumn({
    id: 'samples',
    header: 'Samples',
    // The count and its kind, as the card's sample pill shows it.
    accessor: row => toSampleEntry(row.sample),
    cell: ({ value }) =>
      value ? `${value.count.toLocaleString()} (${value.kind})` : null,
  }),
  resourceColumns.funder(),
  resourceColumns.fundingId(),
  resourceColumns.license(),
  searchColumn({
    id: 'usageInfo',
    header: 'Usage Info',
    type: 'link',
    accessor: row => toUsageInfoEntries(row.usageInfo),
    cell: linkListCell,
  }),
  resourceColumns.terms('topicCategory', 'Topic Category'),
];

export const datasetsTable = createSearchTable({
  tableId: 'search-datasets',
  label: 'Dataset search results',
  columns: DATASET_COLUMNS,
  legacyKeys: {
    visible: 'search-visible-dataset-columns',
    order: 'search-dataset-column-order',
  },
  // Every column can be hidden; "Clear All" leaves Name.
  fallbackIds: ['name'],
});
