import React, { useMemo, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { TabPanel } from '@chakra-ui/react';
import { useQueryClient } from '@tanstack/react-query';
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
import {
  SHOW_SAMPLES_TAB,
  SHOW_DATA_COLLECTIONS_TAB,
} from 'src/utils/feature-flags';
import {
  useBioSampleAggregation,
  BIOSAMPLE_EXTRA_FILTER,
} from '../../hooks/useBioSampleAggregation';
import { queryFilterObject2String } from '../filters/utils/query-string';
import { fetchSearchResults, Params } from 'src/utils/api';
import { defaultQuery } from '../../config/defaultQuery';
import { SAMPLE_FIELDS, DATA_COLLECTION_FIELDS } from '../../config/fields';

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

// Stable empty array used as the fallback when useDiseaseData returns no
// diseases, so that the carouselItems memo does not see a new array reference
// on every render.
const EMPTY_DISEASES: never[] = [];

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
  const queryClient = useQueryClient();

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
      { shallow: true },
    );
  };

  const queryParams = useSearchQueryFromURL();
  const searchResultsData = useSearchResultsData(
    {
      q: queryParams.q,
      filters: queryParams.filters,
      facets: ['@type'],
      facet_size: 100,
      size: 0,
      use_ai_search: queryParams.use_ai_search ?? 'false',
    },
    { enabled: router.isReady },
  );

  const { data: facetData } = searchResultsData.response;

  // Serialize the currently selected filters so the BioSample aggregation
  // respects them.
  const serializedFilters = useMemo(
    () => queryFilterObject2String(queryParams.filters || {}) || '',
    [queryParams.filters],
  );

  // Provide the accurate count for the Samples tab label and the facet
  // counts for Sample-category filters. Runs in parallel with the main
  // aggregation so the count is visible even when the Samples tab is not
  // active. Passes extra_filter so user-selected filters are respected.
  const bioSampleAgg = useBioSampleAggregation(
    {
      q: queryParams.q,
      use_ai_search: queryParams.use_ai_search ?? 'false',
      advancedSearch: queryParams.advancedSearch,
      extra_filter: serializedFilters,
    },
    { enabled: router.isReady },
  );

  const bioSampleTotal = bioSampleAgg.data?.total ?? 0;

  // Prefetch the Sample table query in the background.
  useEffect(() => {
    if (!router.isReady || !SHOW_SAMPLES_TAB) return;

    const sampleExtraFilter = serializedFilters
      ? `${serializedFilters} AND ${BIOSAMPLE_EXTRA_FILTER}`
      : BIOSAMPLE_EXTRA_FILTER;

    const sampleParams: Params = {
      q: queryParams.q,
      extra_filter: sampleExtraFilter,
      facets: '',
      fields: SAMPLE_FIELDS,
      sort: defaultQuery.sort,
      size: `${defaultQuery.size}`,
      from: '0',
      use_metadata_score: 'false',
      use_ai_search: queryParams.use_ai_search ?? 'false',
    };

    queryClient.prefetchQuery({
      queryKey: ['search-results', sampleParams],
      queryFn: () => fetchSearchResults(sampleParams),
      staleTime: 1000 * 60 * 2,
    });
  }, [
    router.isReady,
    queryParams.q,
    serializedFilters,
    queryParams.use_ai_search,
    queryClient,
  ]);

  // Prefetch the DataCollection table query.
  useEffect(() => {
    if (!router.isReady || !SHOW_DATA_COLLECTIONS_TAB) return;

    const dcParams: Params = {
      q: queryParams.q,
      extra_filter: serializedFilters,
      facets: '',
      fields: DATA_COLLECTION_FIELDS,
      sort: defaultQuery.sort,
      size: `${defaultQuery.size}`,
      from: '0',
      use_metadata_score: 'false',
      use_ai_search: queryParams.use_ai_search ?? 'false',
    };

    queryClient.prefetchQuery({
      queryKey: ['search-results', dcParams],
      queryFn: () => fetchSearchResults(dcParams),
      staleTime: 1000 * 60 * 2,
    });
  }, [
    router.isReady,
    queryParams.q,
    serializedFilters,
    queryParams.use_ai_search,
    queryClient,
  ]);

  // Determine the correct tab based on actual search results.
  useEffect(() => {
    if (!facetData?.facets || !router.isReady) return;
    const facetCounts =
      facetData?.facets?.['@type']?.terms?.map(term => ({
        type: term.term,
        count: term.count,
      })) || [];

    // Override the Sample count with the accurate BioSample-scoped total.
    const facetCountsWithBioSample = facetCounts.map(f =>
      f.type === 'Sample' ? { ...f, count: bioSampleTotal } : f,
    );

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
        facetCountsWithBioSample.some(f => f.type === type && f.count > 0),
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
    const calculatedTabId = getDefaultTabId(
      tabs,
      facetCountsWithBioSample,
      selectedTypes,
    );

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
          { shallow: true },
        );
      }
    }
  }, [
    facetData?.facets,
    bioSampleTotal,
    queryParams.filters,
    router.isReady,
    router.query.q,
  ]);

  const hasResourceCatalogRecords = useMemo(() => {
    const terms = facetData?.facets?.['@type']?.terms ?? [];
    const resourceCatalogFacet = terms.find(t => t.term === 'ResourceCatalog');
    return (resourceCatalogFacet?.count || 0) > 0;
  }, [facetData?.facets]);

  const carouselResultsData = useSearchResultsData(
    {
      q: queryParams.q,
      filters: { ...queryParams.filters, ['@type']: ['ResourceCatalog'] },
      fields: CAROUSEL_RESULTS_FIELDS,
      facets: ['@type'],
      size: 50,
      sort: 'name.raw',
      use_ai_search: queryParams.use_ai_search ?? 'false',
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
    diseases: matchingDiseasesRaw,
    isLoading: diseaseIsLoading,
    hasMatchingDiseases,
  } = useDiseaseData({
    searchQuery: queryParams.q || '',
    selectedFilters: queryParams.filters || {},
    enabled: true,
  });

  // Use a stable empty-array reference when there are no diseases so that the
  // carouselItems memo below does not invalidate on every render.
  const matchingDiseases =
    matchingDiseasesRaw.length === 0 ? EMPTY_DISEASES : matchingDiseasesRaw;

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
      tabs
        .filter(tab => {
          if (
            !SHOW_SAMPLES_TAB &&
            tab.types.every(({ type }) => type === 'Sample')
          ) {
            return false;
          }
          if (
            !SHOW_DATA_COLLECTIONS_TAB &&
            tab.types.every(({ type }) => type === 'DataCollection')
          ) {
            return false;
          }
          return true;
        })
        .map(tab => {
          const tabTypesWithCount = tab.types
            .filter(
              ({ type }) =>
                (type !== 'Sample' || SHOW_SAMPLES_TAB) &&
                (type !== 'DataCollection' || SHOW_DATA_COLLECTIONS_TAB),
            )
            .map(({ label, type }) => {
              const terms = facetData?.facets?.['@type']?.terms ?? [];
              const facet = terms.find(t => t.term === type);
              let count = facet?.count || 0;

              if (type === 'Disease') {
                count = matchingDiseases.length;
              }

              // Use the BioSample-scoped total for the Sample type so the tab
              // label reflects only @type:Sample AND additionalType:"BioSample".
              if (type === 'Sample') {
                count = bioSampleTotal;
              }

              return { label, type, count };
            });

          return {
            ...tab,
            types: tabTypesWithCount,
          };
        }),
    [facetData?.facets, matchingDiseases.length, bioSampleTotal],
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
      } else if (section.type === 'Sample') {
        if (section.count > 0 || section.count === 0) {
          indices.push(index);
        }
      } else if (section.type === 'DataCollection') {
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
                    if (section.type === 'Sample' && !SHOW_SAMPLES_TAB)
                      return null;
                    if (
                      section.type === 'DataCollection' &&
                      !SHOW_DATA_COLLECTIONS_TAB
                    )
                      return null;

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

                    // For Dataset, ComputationalTool, Sample, and DataCollection
                    // render normal search results.
                    // The Sample accordion title uses bioSampleTotal so it matches the tab label.
                    const sectionCount =
                      section.type === 'Sample'
                        ? bioSampleTotal
                        : section.count;

                    // For Dataset and ComputationalTool, render normal search results
                    return (
                      <AccordionContent
                        key={section.type}
                        title={`${
                          section.label
                        } (${sectionCount.toLocaleString()})`}
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
