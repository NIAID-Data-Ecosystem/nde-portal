import type { TabType } from 'src/views/search/types';

import type { SearchTable } from '../create-search-table';
import { computationalToolsTable } from './computational-tools';
import { datasetsTable } from './datasets';

/**
 * The Search tables on the shared DataTable, by tab id. Tabs not listed here
 * still use the legacy `ResultsTable` (see `results-list/index.tsx`).
 */
export const SEARCH_TABLES: Partial<Record<TabType['id'], SearchTable>> = {
  d: datasetsTable,
  ct: computationalToolsTable,
};
