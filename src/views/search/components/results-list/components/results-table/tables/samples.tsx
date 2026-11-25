import React from 'react';
import { LinkCell, LinkListCell } from 'src/components/table';

import { resourceColumns, searchColumn, SearchColumnDef } from '../columns';
import { createSearchTable } from '../create-search-table';
import { exportLinks } from '../export';
import { toCatalogEntries, toSampleIdentifier } from '../shaping';

/*
The Samples tab's table (it has no card view). The Identifier always shows and
leads; ten columns show by default and the rest are offered in Customize
Columns. Ids are the ones the pre-DataTable table persisted, so saved
preferences migrate.

Unlike the other tabs, a sample's Name is plain text (capitalized, as before)
and Source lists every catalog the sample is in.
*/

/** Shown until the user customizes, as before. The rest start hidden. */
const DEFAULT_VISIBLE_IDS = [
  'identifier',
  'name',
  'date',
  'includedInDataCatalog',
  'description',
  'conditionsOfAccess',
  'sex',
  'species',
  'funder',
  'fundingId',
];

const { terms } = resourceColumns;

const COLUMNS: SearchColumnDef[] = [
  searchColumn({
    id: 'identifier',
    header: 'Identifier',
    type: 'identifier',
    hideable: false,
    accessor: row => ({ label: toSampleIdentifier(row), url: row.url }),
    // Linked to the sample's own page at its source.
    cell: ({ value }) => (
      <LinkCell href={value.url} label={value.label} external />
    ),
    exportEntries: value => exportLinks([value]),
  }),
  terms({
    id: 'alternateIdentifier',
    header: 'Alternate Identifier',
    size: { min: 200 },
  }),
  terms({
    id: 'name',
    header: 'Name',
    apiSortField: 'name.raw',
    size: { min: 200, max: 320 },
  }),
  resourceColumns.date(),
  searchColumn({
    id: 'includedInDataCatalog',
    header: 'Source',
    type: 'link',
    apiSortField: 'includedInDataCatalog.name',
    // Every catalog the sample is in, one per line.
    accessor: row =>
      toCatalogEntries(row.includedInDataCatalog).map(({ name, url }) => ({
        label: name,
        url,
      })),
    cell: ({ value, column }) => (
      <LinkListCell entries={value} toggleContext={column.header} />
    ),
    exportEntries: exportLinks,
  }),
  resourceColumns.description(),
  terms({ id: 'healthCondition', header: 'Health Condition' }),
  terms({ id: 'infectiousAgent', header: 'Pathogen Species' }),
  terms({ id: 'species', header: 'Host Species' }),
  resourceColumns.conditionsOfAccess(),
  terms({
    id: 'creativeWorkStatus',
    header: 'Status',
    apiSortField: 'creativeWorkStatus',
  }),
  terms({ id: 'variableMeasured', header: 'Variable Measured' }),
  resourceColumns.measurementTechnique(),
  terms({
    id: 'anatomicalStructure',
    header: 'Anatomical Structure',
    size: { min: 200 },
  }),
  terms({ id: 'anatomicalSystem', header: 'Anatomical System' }),
  terms({ id: 'sampleType', header: 'Sample Type' }),
  terms({
    id: 'sampleAvailability',
    header: 'Sample Availability',
    apiSortField: 'sampleAvailability',
    size: { min: 200 },
  }),
  terms({ id: 'sampleQuantity', header: 'Sample Quantity' }),
  terms({ id: 'instrument', header: 'Instrument' }),
  terms({ id: 'sex', header: 'Sex', apiSortField: 'sex' }),
  terms({
    id: 'developmentalStage',
    header: 'Developmental Stage',
    size: { min: 200 },
  }),
  terms({
    id: 'associatedGenotype',
    header: 'Associated Genotype',
    size: { min: 200 },
  }),
  terms({
    id: 'associatedPhenotype',
    header: 'Associated Phenotype',
    size: { min: 200 },
  }),
  terms({ id: 'cellType', header: 'Cell Type' }),
  terms({ id: 'locationOfOrigin', header: 'Location of Origin' }),
  terms({ id: 'itemLocation', header: 'Item Location' }),
  resourceColumns.funder(),
  // Sample funding IDs run long ("75N93021C00045-0-9999-1"): at least the
  // legacy column's content width (280px less padding), so each fits a line.
  { ...resourceColumns.fundingId(), size: { min: 248, max: 320 } },
];

export const SAMPLE_COLUMNS: SearchColumnDef[] = COLUMNS.map(column => ({
  ...column,
  defaultVisible: DEFAULT_VISIBLE_IDS.includes(column.id),
}));

export const samplesTable = createSearchTable({
  tableId: 'search-samples',
  label: 'Sample search results',
  sheetName: 'Samples',
  columns: SAMPLE_COLUMNS,
  legacyKeys: {
    visible: 'search-visible-sample-columns',
    order: 'search-sample-column-order',
  },
  // "Clear All" leaves the required Identifier (the default).
});
