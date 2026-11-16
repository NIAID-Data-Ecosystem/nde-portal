import type { TabType } from 'src/views/search/types';

import type { SearchTable } from '../create-search-table';
import { computationalToolsTable } from './computational-tools';
import { dataCollectionsTable } from './data-collections';
import { datasetsTable } from './datasets';
import { samplesTable } from './samples';

/**
 * The Search tables on the shared DataTable, by tab id. Tabs not listed here
 * still use the legacy `ResultsTable` (see `results-list/index.tsx`).
 */
export const SEARCH_TABLES: Partial<Record<TabType['id'], SearchTable>> = {
  d: datasetsTable,
  ct: computationalToolsTable,
  dc: dataCollectionsTable,
  s: samplesTable,
};
