import { useCallback, useState } from 'react';

import {
  getDefaultViewModeForTab,
  getViewModeStorageKey,
  isSearchViewMode,
} from '../config/view-mode';
import { SearchViewMode, TabType } from '../types';

/**
 * Persistent view mode preference hook.
 * Stores the user's preferred results layout (card or table) for a given tab
 * in localStorage, mirroring how the Customize Columns popover persists column
 * visibility and order.
 */
export const useViewMode = (
  tabId: TabType['id'],
): [SearchViewMode, (next: SearchViewMode) => void] => {
  const key = getViewModeStorageKey(tabId);

  // If there is no stored (or no valid) preference for this tab, use the
  // tab's default.
  const [value, setValue] = useState<SearchViewMode>(() => {
    if (typeof window === 'undefined') return getDefaultViewModeForTab(tabId);
    try {
      const stored = window.localStorage.getItem(key);
      if (isSearchViewMode(stored)) return stored;
    } catch {
      // ignore
    }
    return getDefaultViewModeForTab(tabId);
  });

  const setAndPersist = useCallback(
    (next: SearchViewMode) => {
      setValue(next);
      if (typeof window === 'undefined') return;
      try {
        window.localStorage.setItem(key, next);
      } catch {
        // ignore
      }
    },
    [key],
  );

  return [value, setAndPersist];
};
