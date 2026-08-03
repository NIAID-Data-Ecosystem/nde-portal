import React, { useMemo } from 'react';
import NextLink from 'next/link';
import { Text } from '@chakra-ui/react';
import { Link } from 'src/components/link';
import { Column } from 'src/components/table';
import {
  FormattedResource,
  Funder,
  Funding,
  IncludedInDataCatalog,
  SampleAggregate,
  SampleCollection,
  UsageInfo,
} from 'src/utils/api/types';
import { formatLicense } from 'src/utils/helpers';
import { formatAuthorsList2String } from 'src/utils/helpers/authors';
import { ResultsTable } from '../results-table';
import { BaseColumn } from '../results-table/types';
import { withWidth } from '../results-table/utils';
import { renderCellData } from '../results-table/components/Cells';
import {
  ExpandableList,
  ExpandableText,
} from '../results-table/components/ExpandableCells';
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
    id: 'experimentalSamples',
    title: 'Experimental Samples',
    property: 'experimentalSamples',
    isSortable: false,
    apiSortField: null,
    props: withWidth('170px'),
  },
  {
    id: 'populationSamples',
    title: 'Population Samples',
    property: 'populationSamples',
    isSortable: false,
    apiSortField: null,
    props: withWidth('170px'),
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

type FunderEntry = { name: string; identifier: string | null };
type FundingIdEntry = { identifier: string; url: string | null };
type UsageInfoEntry = { name: string; url: string | null };
type LicenseEntry = { title: string; url: string | null };

/**
 * Split the record's `sample` into the two sample counts the table shows.
 * Discriminates on the top-level `@type`, the same way the card's sample pill
 * does: a SampleCollection contributes an experimental count, a SampleAggregate
 * a population count.
 */
const getSampleCounts = (
  sample?: SampleAggregate | SampleCollection | null,
): { experimentalSamples: number | null; populationSamples: number | null } => {
  if (!sample) {
    return { experimentalSamples: null, populationSamples: null };
  }

  if (sample['@type'] === 'SampleCollection') {
    const count = (sample as SampleCollection).numberOfItems?.value;
    return {
      experimentalSamples: count ?? null,
      populationSamples: null,
    };
  }

  const { sampleQuantity } = sample as SampleAggregate;
  const count =
    sampleQuantity && !Array.isArray(sampleQuantity)
      ? sampleQuantity.value
      : undefined;

  return { experimentalSamples: null, populationSamples: count ?? null };
};

export const toRow = (resource: FormattedResource): Record<string, unknown> => {
  // Source: keep the first catalog only, preferring its archived URL.
  const rawCatalog = resource.includedInDataCatalog;
  const catalog: IncludedInDataCatalog | null = Array.isArray(rawCatalog)
    ? rawCatalog[0] ?? null
    : rawCatalog ?? null;

  const archivedAt = catalog?.archivedAt;
  const catalogUrl =
    (Array.isArray(archivedAt) ? archivedAt[0] : archivedAt) ??
    catalog?.url ??
    null;

  // Funding is split into two columns. `funder` can itself be a single object
  // or an array, so flatten it.
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

  // Collapse duplicate funders, preferring the variant that carries an
  // identifier so the name can link out.
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

  // Usage info may be a single object or an array. The card falls back to
  // "Usage Agreement" when an entry has no name.
  const rawUsageInfo = resource.usageInfo;
  const usageInfoList: UsageInfo[] = Array.isArray(rawUsageInfo)
    ? rawUsageInfo
    : rawUsageInfo
    ? [rawUsageInfo]
    : [];
  const usageInfoEntries: UsageInfoEntry[] = usageInfoList
    .map(info => ({
      name: info?.name || 'Usage Agreement',
      url: info?.url ?? null,
    }))
    .filter(entry => entry.name || entry.url);

  // License: reuse the card's formatting.
  const formattedLicense = resource.license
    ? formatLicense(resource.license)
    : null;
  const license: LicenseEntry | null =
    formattedLicense && (formattedLicense.title || formattedLicense.url)
      ? { title: formattedLicense.title, url: formattedLicense.url || null }
      : null;

  // `MeasurementTechnique.name` may be an array; the shared DefinedTerm cell
  // only renders string names, so join them the way the card does.
  const measurementTechnique = Array.isArray(resource.measurementTechnique)
    ? resource.measurementTechnique.map(technique => ({
        ...technique,
        name: Array.isArray(technique?.name)
          ? technique.name.join(', ')
          : technique?.name,
      }))
    : resource.measurementTechnique;

  return {
    ...resource,
    includedInDataCatalog: catalog
      ? { name: catalog.name ?? '', url: catalogUrl }
      : null,
    measurementTechnique,
    // Columns derived from `funding`, `sample`, `usageInfo` and `license`.
    // Stored as arrays (or null when empty) so getCells stacks multiple
    // entries per record uniformly.
    funder: funderEntries.length > 0 ? funderEntries : null,
    fundingId: fundingIdEntries.length > 0 ? fundingIdEntries : null,
    usageInfo: usageInfoEntries.length > 0 ? usageInfoEntries : null,
    license,
    ...getSampleCounts(resource.sample),
  };
};

/** Stacked list of entries rendered as external links, or plain text. */
const renderLinkList = (
  entries: { label: string; url: string | null }[] | null,
) => {
  if (!entries || entries.length === 0) return null;
  return (
    <ExpandableList gap={1}>
      {entries.map((entry, idx) =>
        entry.url ? (
          <Link key={idx} href={entry.url} isExternal fontSize='sm'>
            {entry.label}
          </Link>
        ) : (
          <Text key={idx} fontSize='sm'>
            {entry.label}
          </Text>
        ),
      )}
    </ExpandableList>
  );
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
      const label = (value as string) || (data?.alternateName as string) || '';
      const id = data?.id as string | undefined;
      if (!label) return null;
      return id ? (
        <NextLink
          // referrerPath is the current path of the page and is used for
          // breadcrumbs in the resources page.
          href={{ pathname: '/resources/', query: { id, referrerPath } }}
          as={`/resources?id=${id}`}
          passHref
          prefetch={false}
        >
          <Link as='div' fontSize='sm'>
            {label}
          </Link>
        </NextLink>
      ) : (
        <Text fontSize='sm'>{label}</Text>
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
      const catalog = value as { name: string; url: string | null } | null;
      if (!catalog) return null;
      return catalog.url ? (
        <Link href={catalog.url} isExternal fontSize='sm'>
          {catalog.name || catalog.url}
        </Link>
      ) : (
        <Text fontSize='sm'>{catalog.name}</Text>
      );
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
      return renderLinkList(
        entries?.map(({ name, identifier }) => ({
          label: name,
          url: identifier,
        })) ?? null,
      );
    }

    // Funding ID: identifier linked to the funding URL.
    if (column.property === 'fundingId') {
      const entries = value as FundingIdEntry[] | null;
      return renderLinkList(
        entries?.map(({ identifier, url }) => ({ label: identifier, url })) ??
          null,
      );
    }

    // Usage Info: name (or "Usage Agreement") linked to the usage URL.
    if (column.property === 'usageInfo') {
      const entries = value as UsageInfoEntry[] | null;
      return renderLinkList(
        entries?.map(({ name, url }) => ({ label: name, url })) ?? null,
      );
    }

    // License: title linked to the license URL.
    if (column.property === 'license') {
      const license = value as LicenseEntry | null;
      if (!license) return null;
      return license.url ? (
        <Link href={license.url} isExternal fontSize='sm'>
          {license.title || license.url}
        </Link>
      ) : (
        <Text fontSize='sm'>{license.title}</Text>
      );
    }

    // Sample counts: the number alone, blank when the record has none.
    if (
      column.property === 'experimentalSamples' ||
      column.property === 'populationSamples'
    ) {
      const count = value as number | null;
      return count == null ? null : (
        <Text fontSize='sm'>{count.toLocaleString()}</Text>
      );
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
