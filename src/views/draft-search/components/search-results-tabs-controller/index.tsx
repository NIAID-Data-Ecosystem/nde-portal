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
import { EmptyState } from '../results-list/components/empty';

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

  // Check if there are ResourceCatalog records using facet data
  const hasResourceCatalogRecords = useMemo(() => {
    const terms = data?.facets?.['@type']?.terms ?? [];
    const resourceCatalogFacet = terms.find(t => t.term === 'ResourceCatalog');
    return (resourceCatalogFacet?.count || 0) > 0;
  }, [data?.facets]);

  // Get resource catalog records if they are available
  const carouselResultsData = useSearchResultsData(
    {
      q: queryParams.q || '',
      filters: {
        ...queryParams.filters,
        '@type': ['ResourceCatalog'],
      },
      fields: CAROUSEL_RESULTS_FIELDS,
      size: 50,
      sort: 'name.raw',
    },
    {
      enabled: hasResourceCatalogRecords,
    },
  );

  const { data: carouselData, isLoading: carouselIsLoading } =
    carouselResultsData.response;

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

  // Calculate accordion indices based on ResourceCatalog availability
  const getAccordionIndices = (tabSections: any[]) => {
    return tabSections.reduce((indices: number[], section, index) => {
      // ResourceCatalog section: open if there are records
      if (section.type === 'ResourceCatalog') {
        if (hasResourceCatalogRecords) {
          indices.push(index);
        }
      } else {
        // Non-ResourceCatalog sections: always open
        indices.push(index);
      }
      return indices;
    }, []);
  };

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
            const defaultIndices = getAccordionIndices(sections);
            {
              /* Each panel renders the carousel, pagination, result list for the selected tab */
            }
            return (
              <TabPanel key={tab.id}>
                <AccordionWrapper
                  key={`${tab.id}-${defaultIndices.join('-')}`}
                  defaultIndex={defaultIndices}
                >
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
                          <>
                            {hasResourceCatalogRecords ? (
                              <CarouselWrapper>
                                <Carousel gap={8} isLoading={carouselIsLoading}>
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
                                      (carouselData?.results || []).map(
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
                            ) : (
                              <EmptyState />
                            )}
                          </>
                        )}
                        {section.type !== 'ResourceCatalog' && (
                          <>
                            {/* Render search results */}
                            <SearchResults
                              id={tab.id}
                              tabs={tabs}
                              types={[section.type]}
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
