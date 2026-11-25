import type { TabType } from 'src/views/search/types';

import type { SearchTable } from '../create-search-table';
import { computationalToolsTable } from './computational-tools';
import { dataCollectionsTable } from './data-collections';
import { datasetsTable } from './datasets';
import { samplesTable } from './samples';

/**
 * The Search tables, by tab id: the table a tab shows in table view (and the
 * Samples tab always). See `results-list/index.tsx`. Every tab has one, so the
 * results list can call a table's hooks unconditionally.
 */
export const SEARCH_TABLES: Record<TabType['id'], SearchTable> = {
  d: datasetsTable,
  ct: computationalToolsTable,
  dc: dataCollectionsTable,
  s: samplesTable,
};
