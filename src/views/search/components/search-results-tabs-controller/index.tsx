import React, { useMemo, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { TabPanel } from '@chakra-ui/react';
import { useSearchTabsContext } from '../../context/search-tabs-context';
import { useSearchQueryFromURL } from '../../hooks/useSearchQueryFromURL';
import { SearchResults } from '../results-list';
import { AccordionContent, AccordionWrapper } from '../layout/accordion';
import { useSearchResultsData } from '../../hooks/useSearchResultsData';
import { usePaginationContext } from '../../context/pagination-context';
import { SearchTabs } from '../layout/tabs';
import { FetchSearchResultsResponse } from 'src/utils/api/types';
import { ResourceCatalogCard } from '../results-list/components/carousel-compact-card/resource-catalog-card';
import { DiseaseOverviewCard } from '../results-list/components/carousel-compact-card/disease-overview-card';
import { Carousel } from 'src/components/carousel';
import { CarouselWrapper } from '../layout/carousel-wrapper';
import { EmptyState } from '../results-list/components/empty';
import { TabType } from '../../types';
import { generateOtherResourcesTitle, tabs } from '../../config/tabs';
import { getDefaultTabId } from '../../utils/get-default-tab';
import { useDiseaseData } from '../../hooks/useDiseaseData';

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
  const { selectedIndex, setSelectedIndex } = useSearchTabsContext();
  const { getPagination, setPagination } = usePaginationContext();

  // Track if the user has chosen a tab. When set, the auto-tab will only
  // override the user choice if there are no results for that tab.
  const userSelectedTabRef = useRef<string | null>(null);

  const handleTabChange = (index: number) => {
    setSelectedIndex(index);
    const selectedTab = tabs[index];

    // Record the user choice so the auto-tab respects it.
    userSelectedTabRef.current = selectedTab.id;

    const paginationState = getPagination(selectedTab.id);

    setPagination(selectedTab.id, paginationState);

    return router.replace(
      {
        query: {
          ...router.query,
          ...paginationState,
          tab: selectedTab.id,
        },
      },
      undefined,
      {
        shallow: true,
      },
    );
  };

  const queryParams = useSearchQueryFromURL();
  const MAX_RESOURCE_CATALOG_RESULTS = 50;

  const resourceCatalogResultsData = useSearchResultsData(
    {
      q: queryParams.q,
      filters: { ...queryParams.filters, ['@type']: ['ResourceCatalog'] },
      fields: CAROUSEL_RESULTS_FIELDS,
      facets: ['@type'],
      size: MAX_RESOURCE_CATALOG_RESULTS, // apply size since results will be directly rendered in carousel.
      sort: 'name.raw',
      use_ai_search: queryParams.use_ai_search,
    },
    {
      enabled: router.isReady,
    },
  );

  const datasetData = useSearchResultsData(
    {
      q: queryParams.q,
      filters: { ...queryParams.filters, ['@type']: ['Dataset'] },
      facets: ['@type'],
      size: 0, // only the dataset facet counts are needed
      use_ai_search: queryParams.use_ai_search,
    },
    { enabled: router.isReady },
  );

  const compToolsData = useSearchResultsData(
    {
      q: queryParams.q,
      filters: { ...queryParams.filters, ['@type']: ['ComputationalTool'] },
      facets: ['@type'],
      size: 0, // only the computational tool facet counts are needed
      use_ai_search: queryParams.use_ai_search,
    },
    { enabled: router.isReady },
  );
  const facetsData = [
    resourceCatalogResultsData,
    datasetData,
    compToolsData,
  ].map(facetData => {
    const facet = facetData?.response?.data?.facets?.['@type']?.terms?.[0];
    const facetWithType = {
      term: facet?.term || '',
      type: facet?.term || '',
      count: facet?.count || 0,
    };
    // For Resource Catalog, the count should reflect the max num of items we want to show in the carousel, not the total count from the facet.
    if (facet?.term === 'ResourceCatalog') {
      facetWithType.count = Math.min(
        facetWithType.count,
        MAX_RESOURCE_CATALOG_RESULTS,
      );
    }
    return facetWithType;
  });

  // Determine the correct tab based on actual search results
  useEffect(() => {
    if (!facetsData.length || !router.isReady) return;

    // Get selected resource types from filters
    const typeFilter = queryParams.filters?.['@type'];
    const selectedTypes: string[] = Array.isArray(typeFilter)
      ? typeFilter.filter((item): item is string => typeof item === 'string')
      : [];

    // If the user has selected a tab, only leave it when that tab
    // has no associated results anymore.
    if (userSelectedTabRef.current !== null) {
      const currentTab = tabs[selectedIndex];
      const currentTabHasResults = currentTab?.types.some(({ type }) =>
        facetsData.some(f => f.type === type && f.count > 0),
      );

      if (currentTabHasResults) {
        // The user's chosen tab still has associated results. The active tab
        // remains the same.
        return;
      }

      // No results for the chosen tab. Use the auto-tab to select the
      // active tab.
      userSelectedTabRef.current = null;
    }

    // Determine the correct tab
    const calculatedTabId = getDefaultTabId(tabs, facetsData, selectedTypes);

    // Find the index for the tab
    const calculatedIndex = tabs.findIndex(t => t.id === calculatedTabId);

    // Only update if different from current
    if (calculatedIndex !== -1 && calculatedIndex !== selectedIndex) {
      setSelectedIndex(calculatedIndex);

      // Update URL if needed
      if (router.query.tab !== calculatedTabId) {
        router.replace(
          {
            query: {
              ...router.query,
              tab: calculatedTabId,
            },
          },
          undefined,
          {
            shallow: true,
          },
        );
      }
    }
  }, [facetsData, queryParams.filters, router.isReady, router.query.q]);

  const {
    data: carouselData,
    isLoading: carouselIsLoading,
    isPending: carouselIsPending,
  } = resourceCatalogResultsData.response;

  const resourceCatalogData = useMemo(
    () => carouselData?.results || [],
    [carouselData?.results],
  );

  const {
    diseases: matchingDiseases,
    isLoading: diseaseIsLoading,
    hasMatchingDiseases,
  } = useDiseaseData({
    searchQuery: queryParams.q || '',
    selectedFilters: queryParams.filters || {},
    enabled: true,
  });

  const carouselItems = useMemo(() => {
    const items: Array<{ type: 'resource' | 'disease'; data: any }> = [];

    resourceCatalogData.forEach(resource => {
      items.push({ type: 'resource', data: resource });
    });

    matchingDiseases.forEach(disease => {
      items.push({ type: 'disease', data: disease });
    });

    return items;
  }, [resourceCatalogData, matchingDiseases]);

  const hasResourceCatalogRecords = resourceCatalogData.length > 0;
  const shouldShowCarousel = hasResourceCatalogRecords || hasMatchingDiseases;

  const isCarouselLoading =
    (hasResourceCatalogRecords && (carouselIsLoading || carouselIsPending)) ||
    diseaseIsLoading;

  const tabsWithFacetCounts = useMemo(
    () =>
      tabs.map(tab => {
        const tabTypesWithCount = tab.types.map(({ label, type }) => {
          const facet = facetsData.find(t => t.term === type);
          let count = facet?.count || 0;

          if (type === 'Disease') {
            count = matchingDiseases.length;
          }

          return {
            label,
            type,
            count,
          };
        });

        return {
          ...tab,
          types: tabTypesWithCount,
        };
      }),
    [facetsData, tabs, matchingDiseases.length],
  );

  const getAccordionDefaultIndices = (
    sections: (TabType['types'][number] & { count: number })[],
  ) =>
    sections.reduce((indices: number[], section, index) => {
      if (section.type === 'ResourceCatalog') {
        if (section.count > 0 || hasMatchingDiseases) {
          indices.push(index);
        }
      } else if (section.type === 'Dataset') {
        if (section.count > 0 || section.count === 0) {
          indices.push(index);
        }
      } else if (section.type === 'ComputationalTool') {
        if (section.count > 0 || section.count === 0) {
          indices.push(index);
        }
      } else if (section.count > 0) {
        indices.push(index);
      }
      return indices;
    }, []);

  return (
    <>
      <SearchTabs
        index={selectedIndex}
        onChange={handleTabChange}
        colorScheme={colorScheme}
        tabs={tabsWithFacetCounts}
        renderTabPanels={() =>
          tabsWithFacetCounts.map(tab => {
            const sections = tab.types;
            const defaultIndices = getAccordionDefaultIndices(sections);

            return (
              <TabPanel key={tab.id}>
                <AccordionWrapper
                  key={`${tab.id}-${defaultIndices.join('-')}`}
                  defaultIndex={defaultIndices}
                >
                  {sections.map(section => {
                    if (section.type === 'Disease') return null;

                    // For ResourceCatalog, render "Other Resources" with carousel
                    if (section.type === 'ResourceCatalog') {
                      return (
                        <AccordionContent
                          key='resource-catalog'
                          title={generateOtherResourcesTitle(sections)}
                        >
                          {isCarouselLoading || shouldShowCarousel ? (
                            <CarouselWrapper>
                              <Carousel gap={8} isLoading={isCarouselLoading}>
                                {(isCarouselLoading
                                  ? Array(3).fill({
                                      type: 'resource',
                                      data: null,
                                    })
                                  : carouselItems
                                ).map((carouselItem, idx) => (
                                  <div
                                    key={
                                      carouselItem?.data?.id || `loading-${idx}`
                                    }
                                  >
                                    {carouselItem.type === 'resource' ? (
                                      <ResourceCatalogCard
                                        data={carouselItem.data}
                                        isLoading={isCarouselLoading}
                                        referrerPath={router.asPath}
                                      />
                                    ) : (
                                      <DiseaseOverviewCard
                                        data={carouselItem.data}
                                        isLoading={isCarouselLoading}
                                      />
                                    )}
                                  </div>
                                ))}
                              </Carousel>
                            </CarouselWrapper>
                          ) : (
                            <EmptyState />
                          )}
                        </AccordionContent>
                      );
                    }

                    // For Dataset and ComputationalTool, render normal search results
                    return (
                      <AccordionContent
                        key={section.type}
                        title={`${
                          section.label
                        } (${section.count.toLocaleString()})`}
                      >
                        <SearchResults
                          id={tab.id}
                          tabs={tabs}
                          types={[section.type]}
                        />
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
