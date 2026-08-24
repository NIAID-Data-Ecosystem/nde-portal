import React, { useMemo } from 'react';
import { Text } from '@chakra-ui/react';
import { Column } from 'src/components/table';
import { FormattedResource } from 'src/utils/api/types';
import { formatAuthorsList2String } from 'src/utils/helpers/authors';
import { ResultsTable } from '../results-table';
import { BaseColumn } from '../results-table/types';
import {
  CatalogEntry,
  FunderEntry,
  LicenseEntry,
  normalizeTermNames,
  toArray,
  toCatalogEntry,
  toFunderEntries,
  toLicenseEntry,
  withWidth,
} from '../results-table/utils';
import { renderCellData } from '../results-table/components/Cells';
import { ExpandableText } from '../results-table/components/ExpandableCells';
import {
  LinkEntry,
  LinkListCell,
  LinkOrTextCell,
  ResourceNameCell,
} from '../results-table/components/SharedCells';
import { COMPUTATIONAL_TOOL_REQUIRED_COLUMN_IDS } from '../results-table/constants';

export interface ComputationalToolColumn extends BaseColumn {}

/*
 Columns mirror the metadata the Computational Tool card displays: the card
 header fields (name, source, date, author, access, description), then the
 tool-specific sections rendered in the card body (application categories,
 programming languages, operating systems), then the properties in the card's
 metadata accordion in its SORT_ORDER_COMPTOOL order, and finally Topic
 Category, which the card sorts last. Labels match the card's wording.
*/
export const ALL_COMPUTATIONAL_TOOL_COLUMNS: ComputationalToolColumn[] = [
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
    id: 'applicationCategory',
    title: 'Application Categories',
    property: 'applicationCategory',
    isSortable: false,
    apiSortField: null,
    props: withWidth('190px'),
  },
  {
    id: 'programmingLanguage',
    title: 'Programming Languages',
    property: 'programmingLanguage',
    isSortable: false,
    apiSortField: null,
    props: withWidth('190px'),
  },
  {
    id: 'operatingSystem',
    title: 'Operating System',
    property: 'operatingSystem',
    isSortable: false,
    apiSortField: null,
    props: withWidth('150px'),
  },
  {
    id: 'input',
    title: 'Input',
    property: 'input',
    isSortable: false,
    apiSortField: null,
    props: withWidth('180px'),
  },
  {
    id: 'featureList',
    title: 'Feature List',
    property: 'featureList',
    isSortable: false,
    apiSortField: null,
    props: withWidth('200px'),
  },
  {
    id: 'output',
    title: 'Output',
    property: 'output',
    isSortable: false,
    apiSortField: null,
    props: withWidth('180px'),
  },
  {
    id: 'softwareHelp',
    title: 'Software Help',
    property: 'softwareHelp',
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
    id: 'license',
    title: 'License',
    property: 'license',
    isSortable: false,
    apiSortField: null,
    props: withWidth('160px'),
  },
  {
    id: 'softwareVersion',
    title: 'Software Version',
    property: 'softwareVersion',
    isSortable: false,
    apiSortField: null,
    props: withWidth('150px'),
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

export const toRow = (resource: FormattedResource): Record<string, unknown> => {
  // Software help: the card drops entries without a url, joins an array name,
  // and falls back to the url when no name is left. In practice `name` always
  // arrives as an array (e.g. ["General"]) despite its declared string type.
  const softwareHelpEntries: LinkEntry[] = toArray<{
    name?: string | string[];
    url: string;
  }>(resource.softwareHelp)
    .filter(entry => entry?.url)
    .map(entry => {
      const label = Array.isArray(entry.name)
        ? entry.name.filter(Boolean).join(', ') || entry.url
        : entry.name || entry.url;
      return { label, url: entry.url };
    });

  return {
    ...resource,
    includedInDataCatalog: toCatalogEntry(resource.includedInDataCatalog),
    // These DefinedTerm-shaped properties can carry an array `name`.
    input: normalizeTermNames(resource.input),
    output: normalizeTermNames(resource.output),
    featureList: normalizeTermNames(resource.featureList),
    softwareHelp: softwareHelpEntries.length > 0 ? softwareHelpEntries : null,
    funder: toFunderEntries(resource.funding),
    license: toLicenseEntry(resource.license),
  };
};

// Builds the cell renderer for this table.
export const createGetCells =
  (referrerPath?: string) =>
  ({
    column,
    data,
    loading,
  }: {
    column: Column;
    data: Record<string, unknown>;
    loading?: boolean;
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

    // Source: { name, url } => link or plain text.
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
      return <ExpandableText text={authors} noOfLines={3} loading={loading} />;
    }

    // Description: clamped to a few lines with a "Show more" / "Show less" toggle.
    if (column.property === 'description') {
      return (
        <ExpandableText
          text={(value as string) || ''}
          noOfLines={4}
          loading={loading}
        />
      );
    }

    // Software Help: each help resource linked by name.
    if (column.property === 'softwareHelp') {
      return <LinkListCell entries={value as LinkEntry[] | null} />;
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

    // License: title linked to the license URL.
    if (column.property === 'license') {
      const license = value as LicenseEntry | null;
      if (!license) return null;
      return <LinkOrTextCell label={license.title} url={license.url} />;
    }

    // applicationCategory, programmingLanguage, operatingSystem and
    // softwareVersion are string arrays; input, output, featureList and
    // topicCategory are DefinedTerm arrays. The shared renderer handles both.
    return renderCellData({ column, data: value as any, loading });
  };

interface ComputationalToolResultsTableProps {
  results: FormattedResource[];
  loading: boolean;
  /**
   * IDs of columns that should be visible.
   * When undefined, all columns are shown.
   */
  visibleColumnIds?: string[];
  /**
   * Full ordered list of all column IDs (visible + hidden).
   * The table renders visible columns in this order.
   * When undefined, the default ALL_COMPUTATIONAL_TOOL_COLUMNS order is used.
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

export const ComputationalToolResultsTable = ({
  results,
  loading,
  visibleColumnIds,
  columnOrder,
  currentSort,
  onSortChange,
  referrerPath,
}: ComputationalToolResultsTableProps) => {
  const getCells = useMemo(() => createGetCells(referrerPath), [referrerPath]);

  return (
    <ResultsTable
      columns={ALL_COMPUTATIONAL_TOOL_COLUMNS}
      results={results}
      loading={loading}
      toRow={toRow}
      getCells={getCells}
      ariaLabel='Computational tool search results'
      caption='Table of computational tool search results'
      requiredColumnIds={
        COMPUTATIONAL_TOOL_REQUIRED_COLUMN_IDS as unknown as string[]
      }
      visibleColumnIds={visibleColumnIds}
      columnOrder={columnOrder}
      currentSort={currentSort}
      onSortChange={onSortChange}
    />
  );
};
