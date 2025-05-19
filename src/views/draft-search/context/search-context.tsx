import React, { createContext, useContext, useState } from 'react';
import { TabType } from '../types';
import { formatResourceTypeForDisplay } from 'src/utils/formatting/formatResourceType';

// Order of tabs in the UI
// is determined by the order of this array
export const tabs: TabType[] = [
  {
    id: 'd',
    types: [
      {
        label: formatResourceTypeForDisplay('Dataset') + 's',
        type: 'Dataset',
      },
      {
        label: formatResourceTypeForDisplay('ResourceCatalog') + 's',
        type: 'ResourceCatalog',
      },
    ],
    isDefault: true,
  },
  {
    id: 'ct',
    types: [
      {
        label: formatResourceTypeForDisplay('ComputationalTool') + 's',
        type: 'ComputationalTool',
      },
    ],
  },
];

interface SearchContextValue {
  selectedTab: TabType;
  setSelectedTab: (tab: TabType['id']) => void;
  selectedIndex: number;
  setSelectedIndex: (index: number) => void;
  filters: Record<string, string[]>;
  setFilters: (filters: Record<string, string[]>) => void;
}

const SearchContext = createContext<SearchContextValue | undefined>(undefined);

export const SearchProvider: React.FC<{
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

export const useSearchContext = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearchContext must be used within a SearchProvider');
  }
  return context;
};
