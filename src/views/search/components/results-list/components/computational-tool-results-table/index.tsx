import React, { useMemo } from 'react';
import { FormattedResource } from 'src/utils/api/types';
import { ResultsTable } from '../results-table';
import { BaseColumn } from '../results-table/types';
import { withWidth } from '../results-table/utils';
import {
  createResourceGetCells,
  toResourceRow,
} from '../results-table/resource-cells';
import { COMPUTATIONAL_TOOL_REQUIRED_COLUMN_IDS } from '../results-table/constants';

export interface ComputationalToolColumn extends BaseColumn {}

/**
 * Only the fields the API can sort on are listed with a value here; everything
 * else is `null` (not server-sortable). Kept in one map so the sortable set is
 * visible at a glance.
 */
const COLUMN_API_SORT_FIELDS: Record<string, string | null> = {
  name: 'name.raw',
  includedInDataCatalog: 'includedInDataCatalog.name',
  date: 'date',
  conditionsOfAccess: 'conditionsOfAccess',
};

export const ALL_COMPUTATIONAL_TOOL_COLUMNS: ComputationalToolColumn[] = [
  {
    id: 'name',
    title: 'Name',
    property: 'name',
    isSortable: true,
    apiSortField: COLUMN_API_SORT_FIELDS['name'],
    props: withWidth('250px'),
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
    id: 'date',
    title: 'Date',
    property: 'date',
    isSortable: true,
    apiSortField: COLUMN_API_SORT_FIELDS['date'],
    props: withWidth('130px'),
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
    id: 'conditionsOfAccess',
    title: 'Conditions of Access',
    property: 'conditionsOfAccess',
    isSortable: true,
    apiSortField: COLUMN_API_SORT_FIELDS['conditionsOfAccess'],
    props: withWidth('180px'),
  },
  {
    id: 'applicationCategory',
    title: 'Application Category',
    property: 'applicationCategory',
    isSortable: false,
    apiSortField: null,
    props: withWidth('200px'),
  },
  {
    id: 'programmingLanguage',
    title: 'Programming Language',
    property: 'programmingLanguage',
    isSortable: false,
    apiSortField: null,
    props: withWidth('200px'),
  },
  {
    id: 'operatingSystem',
    title: 'Operating System',
    property: 'operatingSystem',
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
    id: 'author',
    title: 'Author',
    property: 'author',
    isSortable: false,
    apiSortField: null,
    props: withWidth('200px'),
  },
  {
    id: 'availableOnDevice',
    title: 'Available on Device',
    property: 'availableOnDevice',
    isSortable: false,
    apiSortField: null,
    props: withWidth('180px'),
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
    id: 'output',
    title: 'Output',
    property: 'output',
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
    id: 'softwareVersion',
    title: 'Software Version',
    property: 'softwareVersion',
    isSortable: false,
    apiSortField: null,
    props: withWidth('160px'),
  },
  {
    id: 'softwareRequirements',
    title: 'Software Requirements',
    property: 'softwareRequirements',
    isSortable: false,
    apiSortField: null,
    props: withWidth('200px'),
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
    id: 'topicCategory',
    title: 'Topic Category',
    property: 'topicCategory',
    isSortable: false,
    apiSortField: null,
    props: withWidth('160px'),
  },
  {
    id: 'fundingId',
    title: 'Funding ID',
    property: 'fundingId',
    isSortable: false,
    apiSortField: null,
    props: withWidth('280px'),
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
    id: 'isAccessibleForFree',
    title: 'Free Access',
    property: 'isAccessibleForFree',
    isSortable: false,
    apiSortField: null,
    props: withWidth('140px'),
  },
  {
    id: 'doi',
    title: 'DOI',
    property: 'doi',
    isSortable: false,
    apiSortField: null,
    props: withWidth('180px'),
  },
];

export const toRow = toResourceRow;

interface ComputationalToolResultsTableProps {
  results: FormattedResource[];
  isLoading: boolean;
  /** Current path, forwarded to the record page for breadcrumbs. */
  referrerPath?: string;
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
   */
  currentSort?: string;
  /**
   * Called when the user clicks a sortable column header arrow.
   * Receives the API sort field and the desired direction.
   */
  onSortChange?: (apiField: string, ascending: boolean) => void;
}

export const ComputationalToolResultsTable = ({
  results,
  isLoading,
  referrerPath,
  visibleColumnIds,
  columnOrder,
  currentSort,
  onSortChange,
}: ComputationalToolResultsTableProps) => {
  // Memoized so the cell renderer identity is stable across re-renders.
  const getCells = useMemo(
    () => createResourceGetCells(referrerPath),
    [referrerPath],
  );

  return (
    <ResultsTable
      columns={ALL_COMPUTATIONAL_TOOL_COLUMNS}
      results={results}
      isLoading={isLoading}
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
