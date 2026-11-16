import React from 'react';
import { LinkListCell } from 'src/components/table/data-table';

import {
  getContentTypeLabel,
  getContentTypeTerms,
} from '../../../utils/content-type';
import { resourceColumns, searchColumn, SearchColumnDef } from '../columns';
import { createSearchTable } from '../create-search-table';
import { toBasedOnActionNames, toCollectionSizes } from '../shaping';

/*
The Data Collections tab's table view. Name and Source always show and lead.
Ids are the ones the pre-DataTable table persisted, so saved preferences
migrate. All columns are shown by default.

The lists here keep the wider spacing (`gap={2}`) the legacy table gave them.
*/

const textEntries = (values: string[]) => values.map(label => ({ label }));

export const DATA_COLLECTION_COLUMNS: SearchColumnDef[] = [
  { ...resourceColumns.name(), hideable: false },
  { ...resourceColumns.source(), hideable: false },
  searchColumn({
    id: 'contentType',
    header: 'Content Type',
    type: 'list',
    // `about` and `exampleOfWork.about` together, sorted, each linked to its
    // ontology entry when it has one.
    accessor: row =>
      getContentTypeTerms(row)
        .map(term => ({
          label: getContentTypeLabel(term),
          url: term.url ?? null,
        }))
        .filter(entry => entry.label)
        .sort((a, b) => a.label.localeCompare(b.label)),
    cell: ({ value, column }) => (
      <LinkListCell entries={value} gap={2} toggleContext={column.header} />
    ),
  }),
  resourceColumns.conditionsOfAccess(),
  resourceColumns.date(),
  resourceColumns.description(),
  resourceColumns.terms('healthCondition', 'Health Condition'),
  resourceColumns.terms('infectiousAgent', 'Pathogen Species'),
  resourceColumns.terms('species', 'Host Species'),
  resourceColumns.terms('topicCategory', 'Topic Category'),
  searchColumn({
    id: 'isBasedOn',
    header: 'Based On',
    type: 'list',
    // The names of the Actions it's based on, as plain text.
    accessor: row => toBasedOnActionNames(row.isBasedOn),
    cell: ({ value, column }) => (
      <LinkListCell
        entries={textEntries(value)}
        gap={2}
        toggleContext={column.header}
      />
    ),
  }),
  searchColumn({
    id: 'collectionSize',
    header: 'Collection Size',
    type: 'list',
    // "1000+ samples", one per entry.
    accessor: row => toCollectionSizes(row.collectionSize),
    cell: ({ value, column }) => (
      <LinkListCell
        entries={textEntries(value)}
        gap={2}
        toggleContext={column.header}
      />
    ),
  }),
];

export const dataCollectionsTable = createSearchTable({
  tableId: 'search-data-collections',
  label: 'Data collection search results',
  columns: DATA_COLLECTION_COLUMNS,
  legacyKeys: {
    visible: 'search-visible-data-collection-columns',
    order: 'search-data-collection-column-order',
  },
  // "Clear All" leaves the required Name and Source (the default).
});
