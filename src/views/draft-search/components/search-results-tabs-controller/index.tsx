import React, { useMemo } from 'react';
import { useRouter } from 'next/router';
import { TabPanel } from '@chakra-ui/react';
import { useSearchTabsContext } from '../../context/search-tabs-context';
import { useSearchQueryFromURL } from '../../hooks/useSearchQueryFromURL';
import { SearchResults } from '../results-list';
import { updateRoute } from '../../utils/update-route';
import { AccordionContent, AccordionWrapper } from '../layout/accordion';
import { useSearchResultsData } from '../../hooks/useSearchResultsData';
import { usePaginationContext } from '../../context/pagination-context';
import { SearchTabs } from '../layout/tabs';
import { FetchSearchResultsResponse } from 'src/utils/api/types';

interface SearchResultsControllerProps {
  colorScheme?: string;
  initialData: FetchSearchResultsResponse;
}

export const SearchResultsController = ({
  colorScheme = 'secondary',
  initialData,
}: SearchResultsControllerProps) => {
  const router = useRouter();
  // Selected tab index is stored in context to sync with other components.
  const { selectedIndex, setSelectedIndex, tabs } = useSearchTabsContext();

  // Handle pagination with tab changes.
  const { getPagination, setPagination } = usePaginationContext();

  // Update URL query param when a new tab is selected.
  const handleTabChange = (index: number) => {
    setSelectedIndex(index);
    const selectedTab = tabs[index];
    const paginationState = getPagination(selectedTab.id);

    // Ensure pagination state is set for the selected tab.
    setPagination(selectedTab.id, paginationState);

    // Update the URL with the new tab and pagination state.
    updateRoute(router, { ...paginationState, tab: selectedTab.id });
  };

  // Get the current search parameters from the URL and fetch facet data.
  const queryParams = useSearchQueryFromURL();

  const searchResultsData = useSearchResultsData(
    {
      q: queryParams.q,
      filters: queryParams.filters,
      facets: ['@type'],
      facet_size: 100,
    },
    {
      initialData,
    },
  );

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
    <>
      {/* Render each tab with its label(s) and count(s) */}
      <SearchTabs
        index={selectedIndex}
        onChange={handleTabChange}
        colorScheme={colorScheme}
        tabs={tabsWithCounts}
        renderTabPanels={() =>
          tabsWithCounts.map(tab => {
            const sections = tab.types;
            {
              /* Each panel renders the carousel, pagination, result list for the selected tab */
            }
            return (
              <TabPanel key={tab.id}>
                <AccordionWrapper defaultIndex={sections.map((_, i) => i)}>
                  {sections.map(section => {
                    return (
                      <AccordionContent
                        key={section.type}
                        title={`${
                          section.label
                        } (${section.count.toLocaleString()})`}
                      >
                        {/* Render carousel if ResourceCatalog type is included */}
                        {section.type === 'ResourceCatalog' ? (
                          <>Insert carousel here</>
                        ) : (
                          <>
                            {/* Render search results */}
                            <SearchResults
                              id={tab.id}
                              tabs={tabs}
                              types={[section.type]}
                              initialData={initialData}
                            />
                          </>
                        )}
                      </AccordionContent>
                    );
                  })}
                </AccordionWrapper>
              </TabPanel>
            );
          })
        }
      />
    </>
  );
};
