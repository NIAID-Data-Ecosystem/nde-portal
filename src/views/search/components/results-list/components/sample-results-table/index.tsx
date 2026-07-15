import React from 'react';
import { Flex, Text } from '@chakra-ui/react';
import { Link } from 'src/components/link';
import { Column } from 'src/components/table';
import {
  FormattedResource,
  Funder,
  Funding,
  IncludedInDataCatalog,
} from 'src/utils/api/types';
import { getTruncatedText } from 'src/components/table/helpers';
import { ResultsTable } from '../results-table';
import { BaseColumn } from '../results-table/types';
import { withWidth } from '../results-table/utils';
import { renderCellData } from '../results-table/components/Cells';
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
    props: withWidth('180px'),
  },
];

// Normalized shape stored on the row for each source entry.
type CatalogEntry = { name: string; url: string | null };

// Normalized shapes stored on the row for the funding-related columns.
type FunderEntry = { name: string; identifier: string | null };
type FundingIdEntry = { identifier: string; url: string | null };

export const toRow = (resource: FormattedResource): Record<string, unknown> => {
  const rawCatalog = resource.includedInDataCatalog;
  // Normalize to an array regardless of whether the API returned a single
  // object or an array.
  const catalogs: IncludedInDataCatalog[] = Array.isArray(rawCatalog)
    ? rawCatalog
    : rawCatalog
    ? [rawCatalog]
    : [];

  const catalogEntries: CatalogEntry[] = catalogs.map(catalog => {
    const archivedAt = catalog?.archivedAt;
    const url =
      (Array.isArray(archivedAt) ? archivedAt[0] : archivedAt) ??
      catalog?.url ??
      null;
    return { name: catalog.name ?? '', url };
  });

  // Normalize funding (an array on the record) into two flat, column-ready
  // lists. `funder` can itself be a single object or an array, so flatten it.
  const fundingEntries: Funding[] = Array.isArray(resource.funding)
    ? resource.funding
    : resource.funding
    ? [resource.funding]
    : [];

  const funderList: FunderEntry[] = fundingEntries
    .flatMap(funding => {
      const funders = Array.isArray(funding?.funder)
        ? funding.funder
        : funding?.funder
        ? [funding.funder]
        : [];
      return funders;
    })
    .map((funder: Funder) => ({
      name: funder?.name ?? '',
      identifier: funder?.identifier ?? null,
    }))
    .filter(entry => entry.name);

  // Collapse duplicate funders, preferring the variant that
  // carries an identifier so the name can link out.
  const funderByName = new Map<string, FunderEntry>();
  funderList.forEach(entry => {
    const existing = funderByName.get(entry.name);
    if (!existing || (!existing.identifier && entry.identifier)) {
      funderByName.set(entry.name, entry);
    }
  });
  const funderEntries: FunderEntry[] = Array.from(funderByName.values());

  const fundingIdEntries: FundingIdEntry[] = fundingEntries
    .map(funding => ({
      identifier: funding?.identifier ?? '',
      url: funding?.url ?? null,
    }))
    .filter(entry => entry.identifier);

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
    const entries = value as CatalogEntry[] | null;
    if (!entries || entries.length === 0) return null;
    return (
      <Flex flexDirection='column' gap={1}>
        {entries.map((cat, idx) =>
          cat.url ? (
            <Link key={idx} href={cat.url} isExternal fontSize='sm'>
              {cat.name || cat.url}
            </Link>
          ) : (
            <Text key={idx} fontSize='sm'>
              {cat.name}
            </Text>
          ),
        )}
      </Flex>
    );
  }

  // Funder: Array<{ name, identifier }> => name linked to funder identifier.
  // Records with multiple funders render each on its own line.
  if (column.property === 'funder') {
    const entries = value as FunderEntry[] | null;
    if (!entries || entries.length === 0) return null;
    return (
      <Flex flexDirection='column' gap={1}>
        {entries.map((funder, idx) =>
          funder.identifier ? (
            <Link key={idx} href={funder.identifier} isExternal fontSize='sm'>
              {funder.name}
            </Link>
          ) : (
            <Text key={idx} fontSize='sm'>
              {funder.name}
            </Text>
          ),
        )}
      </Flex>
    );
  }

  // Funding ID: Array<{ identifier, url }> => identifier linked to funding url.
  // Records with multiple funding entries render each on its own line.
  if (column.property === 'fundingId') {
    const entries = value as FundingIdEntry[] | null;
    if (!entries || entries.length === 0) return null;
    return (
      <Flex flexDirection='column' gap={1}>
        {entries.map((funding, idx) =>
          funding.url ? (
            <Link key={idx} href={funding.url} isExternal fontSize='sm'>
              {funding.identifier}
            </Link>
          ) : (
            <Text key={idx} fontSize='sm'>
              {funding.identifier}
            </Text>
          ),
        )}
      </Flex>
    );
  }

  // Limit description to 144 characters
  if (column.property === 'description') {
    const { text } = getTruncatedText(value as string, false, 144);
    return text ? (
      <Text fontSize='sm'>
        {text}
        {(value as string).length > 144 ? '…' : ''}
      </Text>
    ) : null;
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
