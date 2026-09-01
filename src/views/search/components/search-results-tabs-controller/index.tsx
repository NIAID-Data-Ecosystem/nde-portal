import { Tabs } from '@chakra-ui/react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import React, { useEffect, useMemo, useRef } from 'react';
import { Carousel } from 'src/components/carousel';
import { fetchSearchResults, Params } from 'src/utils/api';
import { FetchSearchResultsResponse } from 'src/utils/api/types';
import {
  SHOW_DATA_COLLECTIONS_TAB,
  SHOW_SAMPLES_TAB,
} from 'src/utils/feature-flags';

import { defaultQuery, getDefaultSizeForTab } from '../../config/defaultQuery';
import { DATA_COLLECTION_FIELDS, SAMPLE_FIELDS } from '../../config/fields';
import { generateOtherResourcesTitle, tabs } from '../../config/tabs';
import { usePaginationContext } from '../../context/pagination-context';
import { useSearchTabsContext } from '../../context/search-tabs-context';
import {
  BIOSAMPLE_EXTRA_FILTER,
  useBioSampleAggregation,
} from '../../hooks/useBioSampleAggregation';
import { useDiseaseData } from '../../hooks/useDiseaseData';
import { useSearchQueryFromURL } from '../../hooks/useSearchQueryFromURL';
import { useSearchResultsData } from '../../hooks/useSearchResultsData';
import { TabType } from '../../types';
import { getDefaultTabId } from '../../utils/get-default-tab';
import { queryFilterObject2String } from '../filters/utils/query-string';
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
  'creativeWorkStatus',
  'date',
  'description',
  'hasAPI',
  'includedInDataCatalog',
  'name',
  'sourceOrganization',
];

// Stable empty array used as the fallback when useDiseaseData returns no
// diseases, so that the carouselItems memo does not see a new array reference
// on every render.
const EMPTY_DISEASES: never[] = [];

// Result types whose accordion section is expanded by default, regardless of
// how many results it has.
const ALWAYS_EXPANDED_TYPES = new Set([
  'Dataset',
  'ComputationalTool',
  'Sample',
  'DataCollection',
]);

// Sections that never get their own accordion item: Disease is folded into the
// ResourceCatalog "Other Resources" item, and Sample/DataCollection are gated
// behind feature flags.
const isRenderedSection = (section: TabType['types'][number]) => {
  if (section.type === 'Disease') return false;
  if (section.type === 'Sample') return SHOW_SAMPLES_TAB;
  if (section.type === 'DataCollection') return SHOW_DATA_COLLECTIONS_TAB;
  return true;
};

interface SearchResultsControllerProps {
  colorPalette?: string;
  initialData: FetchSearchResultsResponse;
}

export const SearchResultsController = ({
  colorPalette = 'secondary',
  initialData,
}: SearchResultsControllerProps) => {
  const router = useRouter();
  const { selectedTab, setSelectedTab } = useSearchTabsContext();
  const { getPagination, setPagination } = usePaginationContext();
  const queryClient = useQueryClient();

  // Track if the user has chosen a tab. When set, the auto-tab will only
  // override the user choice if there are no results for that tab.
  const userSelectedTabRef = useRef<string | null>(null);

  // v3 Tabs are value-based: the id string is the source of truth, not the
  // index. Indexing into `tabs` here would also be wrong because the rendered
  // list is filtered by feature flags, so its indices need not line up.
  const handleTabChange = (tabId: string) => {
    const nextTab = tabs.find(t => t.id === tabId);
    if (!nextTab) return;

    setSelectedTab(nextTab.id);

    // Record the user choice so the auto-tab respects it.
    userSelectedTabRef.current = nextTab.id;

    const paginationState = getPagination(nextTab.id);

    setPagination(nextTab.id, paginationState);

    return router.replace(
      {
        query: {
          ...router.query,
          ...paginationState,
          tab: nextTab.id,
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
      size: `${getDefaultSizeForTab('s')}`,
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
      size: `${getDefaultSizeForTab('dc')}`,
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
      const currentTab = selectedTab;
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

    // Only update if different from current
    if (calculatedTabId && calculatedTabId !== selectedTab.id) {
      setSelectedTab(calculatedTabId);

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
    router,
    selectedTab,
    setSelectedTab,
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
      // No facets: this query is only read for `results`.
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
    loading: diseaseIsLoading,
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
            .map(({ label, accordionLabel, type }) => {
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

              return { label, accordionLabel, type, count };
            });

          return {
            ...tab,
            types: tabTypesWithCount,
          };
        }),
    [facetData?.facets, matchingDiseases.length, bioSampleTotal],
  );

  // Labels of the sections that should start expanded — these match the `value`
  // given to each accordion item. Primary result types stay open even with no
  // results so their empty state is visible; every other type only opens when
  // it has results (ResourceCatalog also opens when there are matching diseases
  // to show in its carousel).
  const getAccordionDefaultValues = (
    sections: (TabType['types'][number] & { count: number })[],
  ) =>
    sections
      .filter(
        section =>
          isRenderedSection(section) &&
          (ALWAYS_EXPANDED_TYPES.has(section.type) ||
            section.count > 0 ||
            (section.type === 'ResourceCatalog' && hasMatchingDiseases)),
      )
      .map(section => section.label);

  return (
    <>
      <SearchTabs
        value={selectedTab.id}
        onValueChange={e => handleTabChange(e.value)}
        colorPalette={colorPalette}
        tabs={tabsWithFacetCounts}
        renderTabPanels={() =>
          tabsWithFacetCounts.map(tab => {
            const sections = tab.types;
            const defaultValues = getAccordionDefaultValues(sections);

            return (
              <Tabs.Content key={tab.id} value={tab.id}>
                <AccordionWrapper
                  key={`${tab.id}-${defaultValues.join('|')}`}
                  defaultValue={defaultValues}
                >
                  {sections.filter(isRenderedSection).map(section => {
                    // For ResourceCatalog, render "Other Resources" with carousel
                    if (section.type === 'ResourceCatalog') {
                      return (
                        <AccordionContent
                          key={section.label}
                          value={section.label}
                          title={generateOtherResourcesTitle(sections)}
                        >
                          {isCarouselLoading || shouldShowCarousel ? (
                            <CarouselWrapper>
                              <Carousel gap={8} loading={isCarouselLoading}>
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
                                        loading={isCarouselLoading}
                                        referrerPath={router.asPath}
                                      />
                                    ) : (
                                      <DiseaseOverviewCard
                                        data={carouselItem.data}
                                        loading={isCarouselLoading}
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
                    // Use accordionLabel if provided, otherwise fall back to label.
                    return (
                      <AccordionContent
                        key={section.label}
                        value={section.label}
                        title={`${
                          section.accordionLabel ?? section.label
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
              </Tabs.Content>
            );
          })
        }
      />
    </>
  );
};
