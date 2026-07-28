import React from 'react';
import { Text } from '@chakra-ui/react';
import { Link } from 'src/components/link';
import { Column } from 'src/components/table';
import { FormattedResource } from 'src/utils/api/types';
import { ResultsTable } from '../results-table';
import {
  BaseColumn,
  CatalogEntry,
  FunderEntry,
  FundingIdEntry,
} from '../results-table/types';
import {
  toCatalogEntries,
  toFunderEntries,
  toFundingIdEntries,
  withWidth,
} from '../results-table/utils';
import {
  CatalogCell,
  FunderCell,
  FundingIdCell,
  renderCellData,
} from '../results-table/components/Cells';
import { ExpandableText } from '../results-table/components/ExpandableCells';
import { SAMPLE_REQUIRED_COLUMN_IDS } from '../results-table/constants';

export interface SampleColumn extends BaseColumn {}

const COLUMN_API_SORT_FIELDS: Record<string, string | null> = {
  identifier: null,
  alternateIdentifier: null,
  name: 'name.raw',
  date: 'date',
  includedInDataCatalog: 'includedInDataCatalog.name',
  description: null,
  healthCondition: null,
  infectiousAgent: null,
  species: null,
  conditionsOfAccess: 'conditionsOfAccess',
  creativeWorkStatus: 'creativeWorkStatus',
  variableMeasured: null,
  measurementTechnique: null,
  anatomicalStructure: null,
  anatomicalSystem: null,
  sampleType: null,
  sampleAvailability: 'sampleAvailability',
  sampleQuantity: null,
  instrument: null,
  sex: 'sex',
  developmentalStage: null,
  associatedGenotype: null,
  associatedPhenotype: null,
  cellType: null,
  locationOfOrigin: null,
  itemLocation: null,
  funder: null,
  fundingId: null,
};

export const ALL_SAMPLE_COLUMNS: SampleColumn[] = [
  {
    id: 'identifier',
    title: 'Identifier',
    property: 'identifier',
    isSortable: false,
    apiSortField: COLUMN_API_SORT_FIELDS['identifier'],
    props: withWidth('180px'),
  },
  {
    id: 'alternateIdentifier',
    title: 'Alternate Identifier',
    property: 'alternateIdentifier',
    isSortable: false,
    apiSortField: COLUMN_API_SORT_FIELDS['alternateIdentifier'],
    props: withWidth('180px'),
  },
  {
    id: 'name',
    title: 'Name',
    property: 'name',
    isSortable: true,
    apiSortField: COLUMN_API_SORT_FIELDS['name'],
    props: withWidth('250px'),
  },
  {
    id: 'date',
    title: 'Date',
    property: 'date',
    isSortable: true,
    apiSortField: COLUMN_API_SORT_FIELDS['date'],
    props: withWidth('130px'),
  },
  {
    id: 'includedInDataCatalog',
    title: 'Source',
    property: 'includedInDataCatalog',
    isSortable: true,
    apiSortField: COLUMN_API_SORT_FIELDS['includedInDataCatalog'],
    props: withWidth('160px'),
  },
  {
    id: 'description',
    title: 'Description',
    property: 'description',
    isSortable: false,
    apiSortField: COLUMN_API_SORT_FIELDS['description'],
    props: withWidth('250px'),
  },
  {
    id: 'healthCondition',
    title: 'Health Condition',
    property: 'healthCondition',
    isSortable: false,
    apiSortField: COLUMN_API_SORT_FIELDS['healthCondition'],
    props: withWidth('160px'),
  },
  {
    id: 'infectiousAgent',
    title: 'Infectious Agent',
    property: 'infectiousAgent',
    isSortable: false,
    apiSortField: COLUMN_API_SORT_FIELDS['infectiousAgent'],
    props: withWidth('160px'),
  },
  {
    id: 'species',
    title: 'Host Species',
    property: 'species',
    isSortable: false,
    apiSortField: COLUMN_API_SORT_FIELDS['species'],
    props: withWidth('170px'),
  },
  {
    id: 'conditionsOfAccess',
    title: 'Conditions of Access',
    property: 'conditionsOfAccess',
    isSortable: true,
    apiSortField: COLUMN_API_SORT_FIELDS['conditionsOfAccess'],
    props: withWidth('180px'),
  },
  {
    id: 'creativeWorkStatus',
    title: 'Status',
    property: 'creativeWorkStatus',
    isSortable: true,
    apiSortField: COLUMN_API_SORT_FIELDS['creativeWorkStatus'],
    props: withWidth('150px'),
  },
  {
    id: 'variableMeasured',
    title: 'Variable Measured',
    property: 'variableMeasured',
    isSortable: false,
    apiSortField: COLUMN_API_SORT_FIELDS['variableMeasured'],
    props: withWidth('160px'),
  },
  {
    id: 'measurementTechnique',
    title: 'Measurement Technique',
    property: 'measurementTechnique',
    isSortable: false,
    apiSortField: COLUMN_API_SORT_FIELDS['measurementTechnique'],
    props: withWidth('200px'),
  },
  {
    id: 'anatomicalStructure',
    title: 'Anatomical Structure',
    property: 'anatomicalStructure',
    isSortable: false,
    apiSortField: COLUMN_API_SORT_FIELDS['anatomicalStructure'],
    props: withWidth('180px'),
  },
  {
    id: 'anatomicalSystem',
    title: 'Anatomical System',
    property: 'anatomicalSystem',
    isSortable: false,
    apiSortField: COLUMN_API_SORT_FIELDS['anatomicalSystem'],
    props: withWidth('160px'),
  },
  {
    id: 'sampleType',
    title: 'Sample Type',
    property: 'sampleType',
    isSortable: false,
    apiSortField: COLUMN_API_SORT_FIELDS['sampleType'],
    props: withWidth('140px'),
  },
  {
    id: 'sampleAvailability',
    title: 'Sample Availability',
    property: 'sampleAvailability',
    isSortable: true,
    apiSortField: COLUMN_API_SORT_FIELDS['sampleAvailability'],
    props: withWidth('180px'),
  },
  {
    id: 'sampleQuantity',
    title: 'Sample Quantity',
    property: 'sampleQuantity',
    isSortable: false,
    apiSortField: COLUMN_API_SORT_FIELDS['sampleQuantity'],
    props: withWidth('150px'),
  },
  {
    id: 'instrument',
    title: 'Instrument',
    property: 'instrument',
    isSortable: false,
    apiSortField: COLUMN_API_SORT_FIELDS['instrument'],
    props: withWidth('190px'),
  },
  {
    id: 'sex',
    title: 'Sex',
    property: 'sex',
    isSortable: true,
    apiSortField: COLUMN_API_SORT_FIELDS['sex'],
    props: withWidth('120px'),
  },
  {
    id: 'developmentalStage',
    title: 'Developmental Stage',
    property: 'developmentalStage',
    isSortable: false,
    apiSortField: COLUMN_API_SORT_FIELDS['developmentalStage'],
    props: withWidth('190px'),
  },
  {
    id: 'associatedGenotype',
    title: 'Associated Genotype',
    property: 'associatedGenotype',
    isSortable: false,
    apiSortField: COLUMN_API_SORT_FIELDS['associatedGenotype'],
    props: withWidth('180px'),
  },
  {
    id: 'associatedPhenotype',
    title: 'Associated Phenotype',
    property: 'associatedPhenotype',
    isSortable: false,
    apiSortField: COLUMN_API_SORT_FIELDS['associatedPhenotype'],
    props: withWidth('180px'),
  },
  {
    id: 'cellType',
    title: 'Cell Type',
    property: 'cellType',
    isSortable: false,
    apiSortField: COLUMN_API_SORT_FIELDS['cellType'],
    props: withWidth('150px'),
  },
  {
    id: 'locationOfOrigin',
    title: 'Location of Origin',
    property: 'locationOfOrigin',
    isSortable: false,
    apiSortField: COLUMN_API_SORT_FIELDS['locationOfOrigin'],
    props: withWidth('185px'),
  },
  {
    id: 'itemLocation',
    title: 'Item Location',
    property: 'itemLocation',
    isSortable: false,
    apiSortField: COLUMN_API_SORT_FIELDS['itemLocation'],
    props: withWidth('150px'),
  },
  {
    id: 'funder',
    title: 'Funder',
    property: 'funder',
    isSortable: false,
    apiSortField: COLUMN_API_SORT_FIELDS['funder'],
    props: withWidth('200px'),
  },
  {
    id: 'fundingId',
    title: 'Funding ID',
    property: 'fundingId',
    isSortable: false,
    apiSortField: COLUMN_API_SORT_FIELDS['fundingId'],
    props: withWidth('280px'),
  },
];

export const toRow = (resource: FormattedResource): Record<string, unknown> => {
  // Normalize the source and funding-derived columns into flat, column-ready
  // lists. These normalizers are shared with the other results tables.
  const catalogEntries = toCatalogEntries(resource);
  const funderEntries = toFunderEntries(resource);
  const fundingIdEntries = toFundingIdEntries(resource);

  const rawIdentifier = (resource as any).identifier;
  const resolvedIdentifier = Array.isArray(rawIdentifier)
    ? (resource as any)._id?.replace(/^_/, '').toUpperCase() ?? ''
    : typeof rawIdentifier === 'string' && rawIdentifier
    ? rawIdentifier
    : (resource as any)._id?.replace(/^_/, '').toUpperCase() ?? '';

  return {
    ...resource,
    identifier: {
      identifier: resolvedIdentifier,
      url: resource.url ?? '',
    },
    // Always store an array (or null when empty) so getCells can handle both
    // single-source and multi-source records uniformly.
    includedInDataCatalog: catalogEntries.length > 0 ? catalogEntries : null,
    // Columns derived from `funding`. Stored as arrays (or null when
    // empty) so getCells stacks multiple entries per record uniformly.
    funder: funderEntries.length > 0 ? funderEntries : null,
    fundingId: fundingIdEntries.length > 0 ? fundingIdEntries : null,
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

  // Identifier: { identifier, url } => link or plain text
  if (column.property === 'identifier') {
    const id = value as { identifier: string; url: string } | null;
    if (!id) return null;
    return id.url ? (
      <Link href={id.url} isExternal fontSize='sm'>
        {id.identifier || id.url}
      </Link>
    ) : (
      <Text fontSize='sm'>{id.identifier}</Text>
    );
  }

  // Source: Array<{ name, url }> => one link/text per catalog entry.
  // Records with multiple sources render each on its own line.
  if (column.property === 'includedInDataCatalog') {
    return <CatalogCell entries={value as CatalogEntry[] | null} />;
  }

  // Funder: Array<{ name, identifier }> => name linked to funder identifier.
  // Records with multiple funders render each on its own line.
  if (column.property === 'funder') {
    return <FunderCell entries={value as FunderEntry[] | null} />;
  }

  // Funding ID: Array<{ identifier, url }> => identifier linked to funding url.
  // Records with multiple funding entries render each on its own line.
  if (column.property === 'fundingId') {
    return <FundingIdCell entries={value as FundingIdEntry[] | null} />;
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

  // Scalar string fields that don't need DefinedTerm / QuantitativeValue rendering
  if (column.property === 'date' || column.property === 'conditionsOfAccess') {
    return value ? <Text fontSize='sm'>{String(value)}</Text> : null;
  }

  // All other fields: delegate to the shared cell renderer
  return renderCellData({ column, data: value as any, isLoading });
};

interface SampleResultsTableProps {
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
   * When undefined, the default ALL_SAMPLE_COLUMNS order is used.
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

export const SampleResultsTable = ({
  results,
  isLoading,
  visibleColumnIds,
  columnOrder,
  currentSort,
  onSortChange,
}: SampleResultsTableProps) => (
  <ResultsTable
    columns={ALL_SAMPLE_COLUMNS}
    results={results}
    isLoading={isLoading}
    toRow={toRow}
    getCells={getCells}
    ariaLabel='Sample search results'
    caption='Table of sample search results'
    requiredColumnIds={SAMPLE_REQUIRED_COLUMN_IDS as unknown as string[]}
    visibleColumnIds={visibleColumnIds}
    columnOrder={columnOrder}
    currentSort={currentSort}
    onSortChange={onSortChange}
  />
);
