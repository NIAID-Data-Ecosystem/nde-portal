import React, { useMemo } from 'react';
import { useRouter } from 'next/router';
import { TabPanel } from '@chakra-ui/react';
import { useSearchContext } from '../../context/search-context';
import { useSearchQueryParams } from '../../hooks/useSearchQueryParams';
import { useSearchResultsData } from '../../hooks/useSearchResultsData';
import { TabType } from '../../types';
import SearchResults from '../results';
import { CompactCardCarousel } from '../results/components/compact-card-carousel';
import { updateRoute } from '../../utils/update-route';
import { SearchTabs } from '../tabs';
import { AccordionContent, AccordionWrapper } from '../layout/accordion';

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
                        {section.type === 'ResourceCatalog' && data?.results ? (
                          // <>Insert carousel here</>
                          <CompactCardCarousel
                            data={data.results}
                            referrerPath={router.asPath}
                          />
                        ) : (
                          <>
                            {/* Add Pagination */}
                            <SearchResults types={[section.type]} />
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
