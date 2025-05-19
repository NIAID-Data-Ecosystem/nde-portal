import React, { useMemo } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  Tag,
  Text,
  TabPanel,
} from '@chakra-ui/react';
import { useSearchContext } from '../../context/search-context';
import { useSearchQueryParams } from '../../hooks/useSearchQueryParams';
import { useSearchResultsData } from '../../hooks/useSearchResultsData';
import { TabType } from '../../types';
import SearchResults from '../results';
import { updateRoute } from '../../utils/update-route';
import { SearchTabs } from '../tabs';

interface SearchResultsControllerProps {
  colorScheme?: string;
  tabs: TabType[];
}

export const SearchResultsController = ({
  colorScheme = 'secondary',
  tabs,
}: SearchResultsControllerProps) => {
  const router = useRouter();

  // Selected tab index is stored in context to sync with other components.
  const { selectedIndex, setSelectedIndex, selectedTab } = useSearchContext();

  // Update URL query param when a new tab is selected.
  const handleTabChange = (index: number) => {
    setSelectedIndex(index);
    const selectedTab = tabs[index];
    updateRoute(router, { tab: selectedTab.id });
  };

  // Get the current search parameters from the URL and fetch facet data.
  const queryParams = useSearchQueryParams();
  const searchResultsData = useSearchResultsData({
    ...queryParams,
    facets: ['@type'],
  });
  const { data } = searchResultsData.response;

  // Enhance each tab with facet counts for the types it represents.
  const tabsWithCounts = useMemo(
    () =>
      tabs.map(tab => {
        const tabTypesWithCount = tab.types.map(
          ({ label, type }) => {
            const terms = data?.facets?.['@type']?.terms ?? [];
            const facet = terms.find(t => t.term === type);
            return {
              label,
              type,
              count: facet?.count || 0,
            };
          },
          [data?.facets],
        );

        return {
          ...tab,
          types: tabTypesWithCount,
        };
      }),
    [data?.facets, tabs],
  );

  return (
    <Box w='100%'>
      {/* Render each tab with its label(s) and count(s) */}
      <SearchTabs
        index={selectedIndex}
        onChange={handleTabChange}
        colorScheme={colorScheme}
        tabs={tabsWithCounts}
        renderTabPanels={() =>
          tabs.map(tab => (
            <TabPanel key={tab.id}>
              {/* Each panel renders the carousel, pagination, result list for the selected tab */}
              <SearchResults
                types={tab.types
                  .map(t => t.type)
                  .filter(type => type !== 'ResourceCatalog')}
              />
            </TabPanel>
          ))
        }
      />
    </Box>
  );
};
