import React, { useMemo } from 'react';
import { Text } from '@chakra-ui/react';
import { Skeleton } from 'src/components/skeleton';
import { Table, Column } from 'src/components/table';
import { Link } from 'src/components/link';
import { FormattedResource, IncludedInDataCatalog } from 'src/utils/api/types';
import { renderCellData } from './components/Cells';
import { getTruncatedText } from 'src/components/table/helpers';
import { REQUIRED_COLUMN_IDS } from './components/CustomizeColumnsPopover';

// The shared Column interface exposes `props?: any` which Table spreads onto
// both the <Th> header cell and every <Cell> data cell in its render loop.
const withWidth = (width: string) => ({
  minW: width,
  maxW: width,
  w: width,
});

export interface SampleColumn extends Column {
  /** Stable identifier used for localStorage persistence. */
  id: string;
  /**
   * The API sort field to use when this column's sort toggle is clicked.
   * `null` means the column is not server-sortable.
   */
  apiSortField: string | null;
}

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
];

/**
 * Given a column `property`, return the API sort field string, or `null`
 * if the column is not server-sortable.
 */
export const getApiSortFieldForProperty = (property: string): string | null => {
  const col = ALL_SAMPLE_COLUMNS.find(c => c.property === property);
  return col?.apiSortField ?? null;
};

const toRow = (resource: FormattedResource): Record<string, unknown> => {
  const rawCatalog = resource.includedInDataCatalog;
  const catalog: IncludedInDataCatalog | null = Array.isArray(rawCatalog)
    ? rawCatalog[0] ?? null
    : rawCatalog ?? null;

  const archivedAt = catalog?.archivedAt;
  const catalogUrl =
    (Array.isArray(archivedAt) ? archivedAt[0] : archivedAt) ??
    catalog?.url ??
    null;

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
    includedInDataCatalog: catalog
      ? { name: catalog.name ?? '', url: catalogUrl }
      : null,
  };
};

const getCells = ({
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

  // Other fields
  return renderCellData({ column, data: value as any, isLoading });
};

// Required columns used as the fallback when visibleColumnIds resolves to
// an empty array (e.g. during pre-hydration or after a "Clear All").
const REQUIRED_COLUMNS = ALL_SAMPLE_COLUMNS.filter(col =>
  REQUIRED_COLUMN_IDS.includes(col.id),
);

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

/**
 * Derive the controlled-sort props that the generic `Table` component
 * understands from the raw API `sort` string (e.g. `"-name.raw"`).
 *
 * Returns `{ controlledSortProperty, controlledSortAsc }` where
 * `controlledSortProperty` is the matching column `property` value,
 * or `null` when no column matches.
 */
const deriveControlledSortProps = (
  currentSort: string,
): { controlledSortProperty: string | null; controlledSortAsc: boolean } => {
  const isDesc = currentSort.startsWith('-');
  const apiField = isDesc ? currentSort.slice(1) : currentSort;

  const matchingColumn = ALL_SAMPLE_COLUMNS.find(
    col => col.apiSortField === apiField,
  );

  return {
    controlledSortProperty: matchingColumn?.property ?? null,
    controlledSortAsc: !isDesc,
  };
};

export const SampleResultsTable = ({
  results,
  isLoading,
  visibleColumnIds,
  columnOrder,
  currentSort,
  onSortChange,
}: SampleResultsTableProps) => {
  const rows = useMemo(() => results.map(toRow), [results]);

  // Build the ordered + filtered column list:
  // 1. Start from columnOrder (if provided) or the master list order.
  // 2. Keep only columns that are in visibleColumnIds.
  const visibleColumns = useMemo(() => {
    const sourceOrder =
      columnOrder && columnOrder.length > 0
        ? columnOrder
            .map(id => ALL_SAMPLE_COLUMNS.find(c => c.id === id))
            .filter((c): c is SampleColumn => !!c)
        : ALL_SAMPLE_COLUMNS;

    const filtered = visibleColumnIds
      ? sourceOrder.filter(col => visibleColumnIds.includes(col.id))
      : sourceOrder;

    return filtered.length > 0 ? filtered : REQUIRED_COLUMNS;
  }, [visibleColumnIds, columnOrder]);

  // Controlled sort: derive which column property is active and its direction.
  const { controlledSortProperty, controlledSortAsc } = useMemo(
    () =>
      currentSort
        ? deriveControlledSortProps(currentSort)
        : { controlledSortProperty: null, controlledSortAsc: true },
    [currentSort],
  );

  // When the user clicks a sort toggle, map the column property back to the
  // API field and bubble the change up to the parent.
  const handleControlledSort = useMemo(() => {
    if (!onSortChange) return undefined;
    return (property: string, ascending: boolean) => {
      const apiField = getApiSortFieldForProperty(property);
      if (apiField) {
        onSortChange(apiField, ascending);
      }
    };
  }, [onSortChange]);

  return (
    <Skeleton isLoaded={!isLoading} width='100%'>
      <Table
        ariaLabel='Sample search results'
        caption='Table of sample search results'
        columns={visibleColumns}
        data={rows as any}
        getCells={getCells as any}
        isLoading={isLoading}
        hasPagination={false}
        // Opt in to sticky headers. The bounded maxHeight and overflowY give
        // the browser a scroll boundary, which is required for position:sticky
        // on the thead element to function correctly.
        stickyHeader
        // Opt in to the mirrored top horizontal scrollbar.
        showTopScrollbar
        tableContainerProps={{
          overflowX: 'auto',
          maxHeight: '70vh',
          overflowY: 'auto',
        }}
        tableHeadProps={{
          sx: {
            th: { borderBottom: 'none' },
            tr: { borderBottom: '1px solid', borderColor: 'gray.200' },
          },
        }}
        getTableRowProps={(_, idx) => ({
          bg: idx % 2 === 0 ? 'white' : 'page.alt',
        })}
        controlledSortProperty={controlledSortProperty}
        controlledSortAsc={controlledSortAsc}
        onControlledSort={handleControlledSort}
      />
    </Skeleton>
  );
};
