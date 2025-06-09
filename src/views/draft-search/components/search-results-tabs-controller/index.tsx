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
import { CompactCard } from '../results-list/components/compact-card';
import { Carousel } from 'src/components/carousel';
import { CarouselWrapper } from '../layout/carousel-wrapper';

const CAROUSEL_RESULTS_FIELDS = [
  '_meta',
  '@type',
  'id',
  'about',
  'alternateName',
  'conditionsOfAccess',
  'date',
  'description',
  'hasAPI',
  'includedInDataCatalog',
  'name',
];

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

  const searchResultsData = useSearchResultsData({
    ...queryParams,
    facets: ['@type'],
  });

  const { data } = searchResultsData.response;

  // Get resource catalog records
  const carouselResultsData = useSearchResultsData({
    ...queryParams,
    filters: {
      ...queryParams.filters,
      '@type': ['ResourceCatalog'],
    },
    fields: CAROUSEL_RESULTS_FIELDS,
    size: 50,
  });

  const { data: carouselData, isLoading: carouselIsLoading } =
    carouselResultsData.response;

  // Sort carousel data alphabetically by name
  const sortedCarouselData = useMemo(() => {
    if (!carouselData?.results) return null;

    const sorted = [...carouselData.results].sort((a, b) => {
      const nameA = a.name || '';
      const nameB = b.name || '';
      return nameA.localeCompare(nameB, undefined, { sensitivity: 'base' });
    });

    return { ...carouselData, results: sorted };
  }, [carouselData]);

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
                        {section.type === 'ResourceCatalog' && (
                          <CarouselWrapper>
                            <Carousel gap={8}>
                              {carouselIsLoading
                                ? // Show loading skeleton cards when data is loading
                                  Array(3)
                                    .fill(0)
                                    .map((_, index) => (
                                      <CompactCard
                                        key={`loading-${index}`}
                                        isLoading={true}
                                        referrerPath={router.asPath}
                                      />
                                    ))
                                : // Show actual data when loaded
                                  (sortedCarouselData?.results || []).map(
                                    carouselCard => (
                                      <CompactCard
                                        key={carouselCard.id}
                                        data={carouselCard}
                                        isLoading={false}
                                        referrerPath={router.asPath}
                                      />
                                    ),
                                  )}
                            </Carousel>
                          </CarouselWrapper>
                        )}
                        {section.type !== 'ResourceCatalog' && (
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
