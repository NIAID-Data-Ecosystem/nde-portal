import {
  linkListCell,
  resourceColumns,
  searchColumn,
  SearchColumnDef,
} from '../columns';
import { createSearchTable } from '../create-search-table';
import { exportLinks } from '../export';
import { normalizeTermNames, toSoftwareHelpEntries } from '../shaping';

/*
The Computational Tools tab's table view. Columns mirror the metadata the
Computational Tool card displays: the card header fields (name, source, date,
author, access, description), then the tool-specific sections in the card body
(application categories, programming languages, operating systems), then the
properties in the card's metadata accordion in its SORT_ORDER_COMPTOOL order,
and finally Topic Category, which the card sorts last. Ids are the ones the
pre-DataTable table persisted, so saved preferences migrate. All are shown by
default.
*/
export const COMPUTATIONAL_TOOL_COLUMNS: SearchColumnDef[] = [
  resourceColumns.name(),
  resourceColumns.source(),
  resourceColumns.date(),
  resourceColumns.author(),
  resourceColumns.conditionsOfAccess(),
  resourceColumns.description(),
  // String lists, one per line.
  resourceColumns.terms({
    id: 'applicationCategory',
    header: 'Application Categories',
    size: { min: 200 },
  }),
  resourceColumns.terms({
    id: 'programmingLanguage',
    header: 'Programming Languages',
    size: { min: 220 },
  }),
  resourceColumns.terms({ id: 'operatingSystem', header: 'Operating System' }),
  // These terms can carry an array `name`; joined the way the card does.
  resourceColumns.terms({
    id: 'input',
    header: 'Input',
    accessor: row => normalizeTermNames(row.input),
  }),
  resourceColumns.terms({
    id: 'featureList',
    header: 'Feature List',
    accessor: row => normalizeTermNames(row.featureList),
  }),
  resourceColumns.terms({
    id: 'output',
    header: 'Output',
    accessor: row => normalizeTermNames(row.output),
  }),
  searchColumn({
    id: 'softwareHelp',
    header: 'Software Help',
    type: 'link',
    // Each help resource linked by name.
    accessor: row => toSoftwareHelpEntries(row.softwareHelp),
    cell: linkListCell,
    exportEntries: exportLinks,
  }),
  resourceColumns.funder(),
  resourceColumns.license(),
  resourceColumns.terms({ id: 'softwareVersion', header: 'Software Version' }),
  resourceColumns.topicCategory(),
];

export const computationalToolsTable = createSearchTable({
  tableId: 'search-computational-tools',
  label: 'Computational tool search results',
  sheetName: 'Computational Tools',
  columns: COMPUTATIONAL_TOOL_COLUMNS,
  legacyKeys: {
    visible: 'search-visible-computational-tool-columns',
    order: 'search-computational-tool-column-order',
  },
  // Every column can be hidden; "Clear All" leaves Name.
  fallbackIds: ['name'],
});
