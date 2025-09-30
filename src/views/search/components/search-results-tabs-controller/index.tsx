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
import { ResourceCatalogCard } from '../results-list/components/carousel-compact-card/resource-catalog-card';
import { DiseaseOverviewCard } from '../results-list/components/carousel-compact-card/disease-overview-card';
import { Carousel } from 'src/components/carousel';
import { CarouselWrapper } from '../layout/carousel-wrapper';
import { EmptyState } from '../results-list/components/empty';
import { TabType } from '../../types';
import { useDiseaseData } from '../../hooks/useDiseaseData';
import { generateOtherResourcesTitle } from '../../config/tabs';

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
  const { selectedIndex, setSelectedIndex, tabs } = useSearchTabsContext();
  const { getPagination, setPagination } = usePaginationContext();

  const handleTabChange = (index: number) => {
    setSelectedIndex(index);
    const selectedTab = tabs[index];
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

  const hasResourceCatalogRecords = useMemo(() => {
    const terms = facetData?.facets?.['@type']?.terms ?? [];
    const resourceCatalogFacet = terms.find(t => t.term === 'ResourceCatalog');
    return (resourceCatalogFacet?.count || 0) > 0;
  }, [facetData?.facets]);

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

  const shouldShowCarousel = hasResourceCatalogRecords || hasMatchingDiseases;
  const isCarouselLoading =
    (hasResourceCatalogRecords && (carouselIsLoading || carouselIsPending)) ||
    diseaseIsLoading;

  const tabsWithFacetCounts = useMemo(
    () =>
      tabs.map(tab => {
        const tabTypesWithCount = tab.types.map(({ label, type }) => {
          const terms = facetData?.facets?.['@type']?.terms ?? [];
          const facet = terms.find(t => t.term === type);
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
    [facetData?.facets, tabs, matchingDiseases.length],
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
                  key={`${tab.id}-${defaultIndices.join(
                    '-',
                  )}-${hasMatchingDiseases}-${matchingDiseases.length}`}
                  defaultIndex={defaultIndices}
                >
                  {sections.map((section, idx) => {
                    if (section.type === 'Disease') return null;

                    // For ResourceCatalog, render "Other Resources" with carousel
                    if (section.type === 'ResourceCatalog') {
                      return (
                        <AccordionContent
                          key='other-resources'
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
