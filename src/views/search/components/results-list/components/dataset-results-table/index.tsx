import React, { useMemo } from 'react';
import { Text } from '@chakra-ui/react';
import { Column } from 'src/components/table';
import {
  FormattedResource,
  SampleAggregate,
  SampleCollection,
  UsageInfo,
} from 'src/utils/api/types';
import { formatAuthorsList2String } from 'src/utils/helpers/authors';
import { ResultsTable } from '../results-table';
import { BaseColumn } from '../results-table/types';
import {
  CatalogEntry,
  FunderEntry,
  FundingIdEntry,
  LicenseEntry,
  normalizeTermNames,
  toArray,
  toCatalogEntry,
  toFunderEntries,
  toFundingIdEntries,
  toLicenseEntry,
  withWidth,
} from '../results-table/utils';
import { renderCellData } from '../results-table/components/Cells';
import { ExpandableText } from '../results-table/components/ExpandableCells';
import {
  LinkListCell,
  LinkOrTextCell,
  ResourceNameCell,
} from '../results-table/components/SharedCells';
import { DATASET_REQUIRED_COLUMN_IDS } from '../results-table/constants';

export interface DatasetColumn extends BaseColumn {}

/*
 Columns mirror the metadata the Dataset card displays: the card header fields
 (name, source, date, author, access badges, description) followed by the
 properties in the card's metadata accordion, in its SORT_ORDER. Labels match
 the card's wording.
*/
export const ALL_DATASET_COLUMNS: DatasetColumn[] = [
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
    id: 'date',
    title: 'Date',
    property: 'date',
    isSortable: true,
    apiSortField: 'date',
    props: withWidth('130px'),
  },
  {
    id: 'author',
    title: 'Author',
    property: 'author',
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
    id: 'description',
    title: 'Description',
    property: 'description',
    isSortable: false,
    apiSortField: null,
    props: withWidth('250px'),
  },
  {
    id: 'infectiousAgent',
    title: 'Pathogen',
    property: 'infectiousAgent',
    isSortable: false,
    apiSortField: null,
    props: withWidth('160px'),
  },
  {
    id: 'species',
    title: 'Species',
    property: 'species',
    isSortable: false,
    apiSortField: null,
    props: withWidth('170px'),
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
    id: 'measurementTechnique',
    title: 'Measurement Technique',
    property: 'measurementTechnique',
    isSortable: false,
    apiSortField: null,
    props: withWidth('200px'),
  },
  {
    id: 'variableMeasured',
    title: 'Variable Measured',
    property: 'variableMeasured',
    isSortable: false,
    apiSortField: null,
    props: withWidth('200px'),
  },
  {
    id: 'samples',
    title: 'Samples',
    property: 'samples',
    isSortable: false,
    apiSortField: null,
    props: withWidth('180px'),
  },
  {
    id: 'funder',
    title: 'Funder',
    property: 'funder',
    isSortable: false,
    apiSortField: null,
    props: withWidth('200px'),
  },
  {
    id: 'fundingId',
    title: 'Funding ID',
    property: 'fundingId',
    isSortable: false,
    apiSortField: null,
    props: withWidth('160px'),
  },
  {
    id: 'license',
    title: 'License',
    property: 'license',
    isSortable: false,
    apiSortField: null,
    props: withWidth('200px'),
  },
  {
    id: 'usageInfo',
    title: 'Usage Info',
    property: 'usageInfo',
    isSortable: false,
    apiSortField: null,
    props: withWidth('200px'),
  },
  {
    id: 'topicCategory',
    title: 'Topic Category',
    property: 'topicCategory',
    isSortable: false,
    apiSortField: null,
    props: withWidth('160px'),
  },
];

type UsageInfoEntry = { name: string; url: string | null };
type SampleEntry = { count: number; kind: 'experimental' | 'population' };

/**
 * Reduce the record's `sample` to the single count the table shows, along with
 * which kind of sample it is. Discriminates on the top-level `@type`, the same
 * way the card's sample pill does: a SampleCollection is an experimental count,
 * a SampleAggregate a population count. Returns null when there is no count to
 * show, so the cell renders blank.
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

export const toRow = (resource: FormattedResource): Record<string, unknown> => {
  // Usage info may be a single object or an array. The card falls back to
  // "Usage Agreement" when an entry has no name.
  const usageInfoEntries: UsageInfoEntry[] = toArray<UsageInfo>(
    resource.usageInfo,
  )
    .map(info => ({
      name: info?.name || 'Usage Agreement',
      url: info?.url ?? null,
    }))
    .filter(entry => entry.name || entry.url);

  return {
    ...resource,
    includedInDataCatalog: toCatalogEntry(resource.includedInDataCatalog),
    measurementTechnique: normalizeTermNames(resource.measurementTechnique),
    // Columns derived from `funding`, `sample`, `usageInfo` and `license`.
    // Stored as arrays (or null when empty) so getCells stacks multiple
    // entries per record uniformly.
    funder: toFunderEntries(resource.funding),
    fundingId: toFundingIdEntries(resource.funding),
    usageInfo: usageInfoEntries.length > 0 ? usageInfoEntries : null,
    license: toLicenseEntry(resource.license),
    samples: getSampleEntry(resource.sample),
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

    // Name: links to the resource page, as the card's title does.
    if (column.property === 'name') {
      return (
        <ResourceNameCell
          label={(value as string) || (data?.alternateName as string) || ''}
          id={data?.id as string | undefined}
          referrerPath={referrerPath}
        />
      );
    }

    // Plain text scalars.
    if (
      column.property === 'date' ||
      column.property === 'conditionsOfAccess'
    ) {
      return value ? <Text fontSize='sm'>{String(value)}</Text> : null;
    }

    // Source: { name, url } => link or plain text
    if (column.property === 'includedInDataCatalog') {
      const catalog = value as CatalogEntry | null;
      if (!catalog) return null;
      return <LinkOrTextCell label={catalog.name} url={catalog.url} />;
    }

    // Author: the same comma-joined string the card shows, clamped.
    if (column.property === 'author') {
      const authors = formatAuthorsList2String(
        value as FormattedResource['author'],
        ',',
        10,
      );
      return (
        <ExpandableText text={authors} noOfLines={3} isLoading={isLoading} />
      );
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

    // Funder: name linked to the funder's identifier.
    if (column.property === 'funder') {
      const entries = value as FunderEntry[] | null;
      return (
        <LinkListCell
          entries={entries?.map(({ name, identifier }) => ({
            label: name,
            url: identifier,
          }))}
        />
      );
    }

    // Funding ID: identifier linked to the funding URL.
    if (column.property === 'fundingId') {
      const entries = value as FundingIdEntry[] | null;
      return (
        <LinkListCell
          entries={entries?.map(({ identifier, url }) => ({
            label: identifier,
            url,
          }))}
        />
      );
    }

    // Usage Info: name (or "Usage Agreement") linked to the usage URL.
    if (column.property === 'usageInfo') {
      const entries = value as UsageInfoEntry[] | null;
      return (
        <LinkListCell
          entries={entries?.map(({ name, url }) => ({ label: name, url }))}
        />
      );
    }

    // License: title linked to the license URL.
    if (column.property === 'license') {
      const license = value as LicenseEntry | null;
      if (!license) return null;
      return <LinkOrTextCell label={license.title} url={license.url} />;
    }

    // Samples: the count with its kind. Blank when
    // the record has no sample count.
    if (column.property === 'samples') {
      const entry = value as SampleEntry | null;
      return entry ? (
        <Text fontSize='sm'>{`${entry.count.toLocaleString()} (${
          entry.kind
        })`}</Text>
      ) : null;
    }

    // infectiousAgent, species, healthCondition, measurementTechnique,
    // variableMeasured, topicCategory, and any other DefinedTerm /
    // QuantitativeValue fields.
    return renderCellData({ column, data: value as any, isLoading });
  };

interface DatasetResultsTableProps {
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
   * When undefined, the default ALL_DATASET_COLUMNS order is used.
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

export const DatasetResultsTable = ({
  results,
  isLoading,
  visibleColumnIds,
  columnOrder,
  currentSort,
  onSortChange,
  referrerPath,
}: DatasetResultsTableProps) => {
  // Keep the cell renderer's identity stable: the generic Table memoizes each
  // row on it, so a fresh function every render would re-render every cell.
  const getCells = useMemo(() => createGetCells(referrerPath), [referrerPath]);

  return (
    <ResultsTable
      columns={ALL_DATASET_COLUMNS}
      results={results}
      isLoading={isLoading}
      toRow={toRow}
      getCells={getCells}
      ariaLabel='Dataset search results'
      caption='Table of dataset search results'
      requiredColumnIds={DATASET_REQUIRED_COLUMN_IDS as unknown as string[]}
      visibleColumnIds={visibleColumnIds}
      columnOrder={columnOrder}
      currentSort={currentSort}
      onSortChange={onSortChange}
    />
  );
};
