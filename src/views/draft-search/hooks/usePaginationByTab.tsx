import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { updateRoute } from '../utils/update-route';
import { TabType } from '../types';
import { defaultQuery } from '../config/defaultQuery';

export type PaginationState = {
  from: number;
  size: number;
};

/*
 * [usePaginationByTab]: Hook to manage pagination state for different tabs
 * in a search results page.
 * The hook also synchronizes the pagination state with the URL,
 * allowing users to share links with specific pagination settings.
 */
export const usePaginationByTab = (
  tabs: TabType[],
  activeTabId: string,
  defaultSize = defaultQuery.size,
  defaultFrom = defaultQuery.from,
) => {
  const router = useRouter();

  const [paginationByTab, setPaginationByTab] = useState<
    Record<string, PaginationState>
  >(() => {
    // Initialize pagination state for each tab
    return Object.fromEntries(
      tabs.map(tab => [tab.id, { from: defaultFrom, size: defaultSize }]),
    );
  });

  useEffect(() => {
    if (!router.isReady) return;

    const urlFrom = parseInt(router.query.from as string);
    const urlTab = router.query.tab as string;
    // Ensure the URL tab matches the active tab
    // and that the "from" value is a valid number
    if (urlTab === activeTabId && !isNaN(urlFrom)) {
      setPaginationByTab(prev => ({
        ...prev,
        [activeTabId]: {
          ...prev[activeTabId],
          from: urlFrom,
        },
      }));
    }
  }, [router.isReady, router.query.from, router.query.tab, activeTabId]);

  const setFrom = (tabId: string, newFrom: number) => {
    setPaginationByTab(prev => ({
      ...prev,
      [tabId]: { ...prev[tabId], from: newFrom },
    }));

    // Only update URL if active
    if (tabId === activeTabId) {
      updateRoute(router, { from: newFrom });
    }
  };

  const getPagination = (tabId: string): PaginationState => {
    return paginationByTab[tabId] || { from: defaultFrom, size: defaultSize };
  };

  return {
    getPagination,
    setFrom,
    paginationState: paginationByTab,
  };
};
