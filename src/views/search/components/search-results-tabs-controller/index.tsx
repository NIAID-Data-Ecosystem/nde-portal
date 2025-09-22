import React, { useMemo } from 'react';
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
import { CompactCard } from '../results-list/components/compact-card';
import { DiseaseOverviewCard } from '../results-list/components/disease-overview-card';
import { Carousel } from 'src/components/carousel';
import { CarouselWrapper } from '../layout/carousel-wrapper';
import { EmptyState } from '../results-list/components/empty';
import { TabType } from '../../types';
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

  // Get the current search parameters from the URL and fetch facet data.
  const queryParams = useSearchQueryFromURL();

  const searchResultsData = useSearchResultsData(
    {
      q: queryParams.q,
      filters: queryParams.filters,
      facets: ['@type'],
      facet_size: 100,
    },
    { initialData },
  );

  const { data: facetData } = searchResultsData.response;

  // Check if there are ResourceCatalog records using facet data
  const hasResourceCatalogRecords = useMemo(() => {
    const terms = facetData?.facets?.['@type']?.terms ?? [];
    const resourceCatalogFacet = terms.find(t => t.term === 'ResourceCatalog');
    return (resourceCatalogFacet?.count || 0) > 0;
  }, [facetData?.facets]);

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

  const {
    data: carouselData,
    isLoading: carouselIsLoading,
    isPending: carouselIsPending,
  } = carouselResultsData.response;

  const resourceCatalogData = useMemo(
    () => carouselData?.results || [],
    [carouselData?.results],
  );

  // Fetch matching disease data
  const {
    diseases: matchingDiseases,
    isLoading: diseaseIsLoading,
    hasMatchingDiseases,
  } = useDiseaseData({
    searchQuery: queryParams.q || '',
    selectedFilters: queryParams.filters || {},
    enabled: true,
  });

  // Combine carousel items
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

  // Check if carousel should be shown
  const shouldShowCarousel = hasResourceCatalogRecords || hasMatchingDiseases;
  const isCarouselLoading =
    (hasResourceCatalogRecords && (carouselIsLoading || carouselIsPending)) ||
    diseaseIsLoading;

  // Enhance each tab with facet counts for the types it represents.
  const tabsWithFacetCounts = useMemo(
    () =>
      tabs.map(tab => {
        const tabTypesWithCount = tab.types.map(({ label, type }) => {
          const terms = facetData?.facets?.['@type']?.terms ?? [];
          const facet = terms.find(t => t.term === type);
          return {
            label,
            type,
            count: facet?.count || 0,
          };
        });

        return {
          ...tab,
          types: tabTypesWithCount,
        };
      }),
    [facetData?.facets, tabs],
  );

  const getAccordionDefaultIndices = (
    sections: (TabType['types'][number] & { count: number })[],
  ) =>
    sections.reduce((indices: number[], section, index) => {
      if (section.type === 'ResourceCatalog') {
        if (section.count > 0 || hasMatchingDiseases) {
          indices.push(index);
        }
      } else if (section.count > 0) {
        indices.push(index);
      }
      return indices;
    }, []);

  return (
    <>
      {/* Render each tab with its label(s) and count(s) */}
      <SearchTabs
        index={selectedIndex}
        onChange={handleTabChange}
        colorScheme={colorScheme}
        tabs={tabsWithFacetCounts}
        renderTabPanels={() =>
          tabsWithFacetCounts.map(tab => {
            const sections = tab.types;
            // Determine the default indices for the accordion based on sections
            const defaultIndices = getAccordionDefaultIndices(sections);

            return (
              <TabPanel key={tab.id}>
                <AccordionWrapper
                  key={`${tab.id}-${defaultIndices.join(
                    '-',
                  )}-${hasMatchingDiseases}`}
                  defaultIndex={defaultIndices}
                >
                  {sections.map(typeSection => {
                    return (
                      <AccordionContent
                        key={typeSection.type}
                        title={`${
                          typeSection.label
                        } (${typeSection.count.toLocaleString()})`}
                      >
                        {/* Render carousel if ResourceCatalog type is included */}
                        {typeSection.type === 'ResourceCatalog' ? (
                          <>
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
                                        carouselItem?.data?.id ||
                                        `loading-${idx}`
                                      }
                                    >
                                      {carouselItem.type === 'resource' ? (
                                        <CompactCard
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
                          </>
                        ) : (
                          <SearchResults
                            id={tab.id}
                            tabs={tabs}
                            types={[typeSection.type]}
                          />
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
