import { Tabs } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import React, { useMemo } from 'react';
import { Carousel } from 'src/components/carousel';
import { FetchSearchResultsResponse } from 'src/utils/api/types';

import { generateOtherResourcesTitle } from '../../config/tabs';
import { usePaginationContext } from '../../context/pagination-context';
import { useSearchTabsContext } from '../../context/search-tabs-context';
import { useDiseaseData } from '../../hooks/useDiseaseData';
import { useSearchQueryFromURL } from '../../hooks/useSearchQueryFromURL';
import { useSearchResultsData } from '../../hooks/useSearchResultsData';
import { TabType } from '../../types';
import { AccordionContent, AccordionWrapper } from '../layout/accordion';
import { CarouselWrapper } from '../layout/carousel-wrapper';
import { SearchTabs } from '../layout/tabs';
import { SearchResults } from '../results-list';
import { DiseaseOverviewCard } from '../results-list/components/carousel-compact-card/disease-overview-card';
import { ResourceCatalogCard } from '../results-list/components/carousel-compact-card/resource-catalog-card';
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
  colorPalette?: string;
  initialData: FetchSearchResultsResponse;
}

export const SearchResultsController = ({
  colorPalette = 'secondary',
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
  ) => {
    return sections.reduce((indices: string[], section, index) => {
      const index_str = index.toString();
      if (section.type === 'ResourceCatalog') {
        if (section.count > 0 || hasMatchingDiseases) {
          indices.push(index_str);
        }
      } else if (section.type === 'Dataset') {
        if (section.count > 0 || section.count === 0) {
          indices.push(index_str);
        }
      } else if (section.type === 'ComputationalTool') {
        if (section.count > 0 || section.count === 0) {
          indices.push(index_str);
        }
      } else if (section.count > 0) {
        indices.push(index_str);
      }
      return indices;
    }, []);
  };

  return (
    <>
      <SearchTabs
        value={`${selectedIndex}`}
        onValueChange={e => handleTabChange(+e.value)}
        colorPalette={colorPalette}
        tabs={tabsWithFacetCounts}
        renderTabPanels={() =>
          tabsWithFacetCounts.map((tab, tabIndex) => {
            const sections = tab.types;
            const defaultIndices = getAccordionDefaultIndices(sections);

            return (
              <Tabs.Content key={tab.id} value={`${tabIndex}`}>
                <AccordionWrapper
                  key={`${tab.id}-${defaultIndices.join(
                    '-',
                  )}-${hasMatchingDiseases}-${matchingDiseases.length}`}
                  defaultValue={defaultIndices}
                >
                  {sections.map((section, sectionIndex) => {
                    if (section.type === 'Disease') return null;

                    // For ResourceCatalog, render "Other Resources" with carousel
                    if (section.type === 'ResourceCatalog') {
                      return (
                        <AccordionContent
                          key='other-resources'
                          title={generateOtherResourcesTitle(sections)}
                          value={`${sectionIndex}`}
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
                                ).map((carouselItem, carouselIndex) => (
                                  <React.Fragment
                                    key={
                                      carouselItem?.data?.id ||
                                      `loading-${carouselIndex}`
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
                                  </React.Fragment>
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
                        value={`${sectionIndex}`}
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
              </Tabs.Content>
            );
          })
        }
      />
    </>
  );
};
