import { BaseColumn } from '../components/results-table/types';
import {
  COMPUTATIONAL_TOOL_REQUIRED_COLUMN_IDS,
  DATASET_REQUIRED_COLUMN_IDS,
  DATA_COLLECTION_REQUIRED_COLUMN_IDS,
  SAMPLE_REQUIRED_COLUMN_IDS,
} from '../components/results-table/constants';
import { ALL_SAMPLE_COLUMNS } from '../components/sample-results-table';
import { ALL_DATA_COLLECTION_COLUMNS } from '../components/data-collection-results-table';
import { ALL_DATASET_COLUMNS } from '../components/dataset-results-table';
import { ALL_COMPUTATIONAL_TOOL_COLUMNS } from '../components/computational-tool-results-table';

/**
 * Per-table-type configuration for the Customize Columns popover and the
 * column visibility / ordering state that lives in the results list.
 *
 * Adding a new table type means adding one entry here plus the table component
 * itself.
 */
export type ResultsTableType =
  | 'sample'
  | 'data-collection'
  | 'dataset'
  | 'computational-tool';

export interface ResultsTableSettings {
  /** Master column list for the table type. */
  columns: BaseColumn[];
  /** Column IDs that can never be hidden. */
  requiredIds: string[];
  /** Column IDs visible before the user customizes anything. */
  defaultVisibleIds: string[];
  /** localStorage key holding the visible column IDs. */
  storageKeyVisible: string;
  /** localStorage key holding the column display order. */
  storageKeyOrder: string;
}

export const RESULTS_TABLE_SETTINGS: Record<
  ResultsTableType,
  ResultsTableSettings
> = {
  sample: {
    columns: ALL_SAMPLE_COLUMNS,
    requiredIds: [...SAMPLE_REQUIRED_COLUMN_IDS],
    defaultVisibleIds: [
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
    ],
    storageKeyVisible: 'search-visible-sample-columns',
    storageKeyOrder: 'search-sample-column-order',
  },
  'data-collection': {
    columns: ALL_DATA_COLLECTION_COLUMNS,
    requiredIds: [...DATA_COLLECTION_REQUIRED_COLUMN_IDS],
    // All Data Collection columns are visible by default.
    defaultVisibleIds: [
      'name',
      'source',
      'about',
      'exampleOfWork',
      'conditionsOfAccess',
      'date',
      'description',
      'healthCondition',
      'infectiousAgent',
      'species',
      'topicCategory',
      'isBasedOn',
      'collectionSize',
    ],
    storageKeyVisible: 'search-visible-data-collection-columns',
    storageKeyOrder: 'search-data-collection-column-order',
  },
  dataset: {
    columns: ALL_DATASET_COLUMNS,
    requiredIds: [...DATASET_REQUIRED_COLUMN_IDS],
    defaultVisibleIds: [
      'name',
      'includedInDataCatalog',
      'date',
      'description',
      'conditionsOfAccess',
      'healthCondition',
      'species',
      'measurementTechnique',
      'funder',
    ],
    storageKeyVisible: 'search-visible-dataset-columns',
    storageKeyOrder: 'search-dataset-column-order',
  },
  'computational-tool': {
    columns: ALL_COMPUTATIONAL_TOOL_COLUMNS,
    requiredIds: [...COMPUTATIONAL_TOOL_REQUIRED_COLUMN_IDS],
    defaultVisibleIds: [
      'name',
      'includedInDataCatalog',
      'date',
      'description',
      'conditionsOfAccess',
      'applicationCategory',
      'programmingLanguage',
      'operatingSystem',
      'funder',
    ],
    storageKeyVisible: 'search-visible-computational-tool-columns',
    storageKeyOrder: 'search-computational-tool-column-order',
  },
};
