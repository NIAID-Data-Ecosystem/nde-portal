import React from 'react';
import { LinkCell, LinkListCell } from 'src/components/table/data-table';

import { resourceColumns, searchColumn, SearchColumnDef } from '../columns';
import { createSearchTable } from '../create-search-table';
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
  }),
  terms('alternateIdentifier', 'Alternate Identifier'),
  {
    ...terms('name', 'Name'),
    apiSortField: 'name.raw',
    size: { min: 200, max: 320 },
  },
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
  }),
  resourceColumns.description(),
  terms('healthCondition', 'Health Condition'),
  terms('infectiousAgent', 'Pathogen Species'),
  terms('species', 'Host Species'),
  resourceColumns.conditionsOfAccess(),
  {
    ...terms('creativeWorkStatus', 'Status'),
    apiSortField: 'creativeWorkStatus',
  },
  terms('variableMeasured', 'Variable Measured'),
  terms('measurementTechnique', 'Measurement Technique'),
  terms('anatomicalStructure', 'Anatomical Structure'),
  terms('anatomicalSystem', 'Anatomical System'),
  terms('sampleType', 'Sample Type'),
  {
    ...terms('sampleAvailability', 'Sample Availability'),
    apiSortField: 'sampleAvailability',
  },
  terms('sampleQuantity', 'Sample Quantity'),
  terms('instrument', 'Instrument'),
  { ...terms('sex', 'Sex'), apiSortField: 'sex' },
  terms('developmentalStage', 'Developmental Stage'),
  terms('associatedGenotype', 'Associated Genotype'),
  terms('associatedPhenotype', 'Associated Phenotype'),
  terms('cellType', 'Cell Type'),
  terms('locationOfOrigin', 'Location of Origin'),
  terms('itemLocation', 'Item Location'),
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
  columns: SAMPLE_COLUMNS,
  legacyKeys: {
    visible: 'search-visible-sample-columns',
    order: 'search-sample-column-order',
  },
  // "Clear All" leaves the required Identifier (the default).
});
