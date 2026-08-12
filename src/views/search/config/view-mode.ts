import { SearchViewMode, TabType } from '../types';

// Options shown in the "View mode" radio, in display order.
export const VIEW_MODE_OPTIONS: { value: SearchViewMode; label: string }[] = [
  { value: 'card', label: 'Card' },
  { value: 'table', label: 'Table' },
];

// Tabs that let the user pick a view mode. Samples ('s') is deliberately
// excluded: it is table-only.
export const TABS_WITH_VIEW_MODE: TabType['id'][] = ['d', 'ct', 'dc'];

// Tabs that should default to something other than 'card'.
export const DEFAULT_VIEW_MODE_BY_TAB: Partial<
  Record<TabType['id'], SearchViewMode>
> = {
  dc: 'table',
};

export const getDefaultViewModeForTab = (
  tabId: TabType['id'],
): SearchViewMode => DEFAULT_VIEW_MODE_BY_TAB[tabId] ?? 'card';

// localStorage key holding the user's view mode preference for a given tab.
export const getViewModeStorageKey = (tabId: TabType['id']): string =>
  `search-view-mode-${tabId}`;

export const isSearchViewMode = (value: unknown): value is SearchViewMode =>
  VIEW_MODE_OPTIONS.some(option => option.value === value);
