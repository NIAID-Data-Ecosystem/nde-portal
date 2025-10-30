import React, { createContext, useContext, useState } from 'react';

import { tabs } from '../config/tabs';
import { TabType } from '../types';

interface SearchContextValue {
  tabs: TabType[];
  selectedTab: TabType;
  setSelectedTab: (tab: TabType['id']) => void;
  selectedIndex: number;
  setSelectedIndex: (index: number) => void;
  filters: Record<string, string[]>;
  setFilters: (filters: Record<string, string[]>) => void;
}

const SearchContext = createContext<SearchContextValue | undefined>(undefined);

/**
 * Handles the search context for the draft search page.
 * Provides the selected tab, index, and filters.
 *
 */
export const SearchTabsProvider: React.FC<{
  children: React.ReactNode;
  initialTab?: TabType['id'];
}> = ({ children, initialTab = tabs.find(t => t.isDefault)?.id }) => {
  const initialIndex = tabs.findIndex(t => t.id === initialTab);
  const [selectedIndex, setSelectedIndex] = useState(
    initialIndex !== -1 ? initialIndex : 0,
  );
  const selectedTab = tabs[selectedIndex];
  const setSelectedTab = (tab: TabType['id']) => {
    const index = tabs.findIndex(t => t.id === tab);
    if (index !== -1) {
      setSelectedIndex(index);
    }
  };
  const [filters, setFilters] = useState<Record<string, string[]>>({});

  return (
    <SearchContext.Provider
      value={{
        tabs,
        selectedTab,
        setSelectedTab,
        selectedIndex,
        setSelectedIndex,
        filters,
        setFilters,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};

export const useSearchTabsContext = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearchContext must be used within a SearchProvider');
  }
  return context;
};
