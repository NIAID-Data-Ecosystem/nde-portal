import { Tabs } from '@chakra-ui/react';
import { keepPreviousData, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import React, { useEffect, useMemo, useRef } from 'react';
import { Carousel } from 'src/components/carousel';
import { fetchSearchResults, Params } from 'src/utils/api';
import { FetchSearchResultsResponse } from 'src/utils/api/types';
import {
  SHOW_DATA_COLLECTIONS_TAB,
  SHOW_PROGRAM_RESOURCE_UI,
  SHOW_SAMPLES_TAB,
} from 'src/utils/feature-flags';
import { useIsomorphicLayoutEffect } from 'usehooks-ts';

import { defaultQuery, getDefaultSizeForTab } from '../../config/defaultQuery';
import { DATA_COLLECTION_FIELDS, SAMPLE_FIELDS } from '../../config/fields';
import {
  generateOtherResourcesTitle,
  TAB_LABELS,
  tabs,
} from '../../config/tabs';
import { usePaginationContext } from '../../context/pagination-context';
import { useSearchTabsContext } from '../../context/search-tabs-context';
import {
  BIOSAMPLE_EXTRA_FILTER,
  useBioSampleAggregation,
} from '../../hooks/useBioSampleAggregation';
import { useDiseaseData } from '../../hooks/useDiseaseData';
import { useProgramInfoCollections } from '../../hooks/useProgramInfoCollections';
import { useSearchQueryFromURL } from '../../hooks/useSearchQueryFromURL';
import { useSearchResultsData } from '../../hooks/useSearchResultsData';
import { TabType } from '../../types';
import { getDefaultTabId } from '../../utils/get-default-tab';
import { queryFilterObject2String } from '../filters/utils/query-string';
import { AccordionContent, AccordionWrapper } from '../layout/accordion';
import { CarouselWrapper } from '../layout/carousel-wrapper';
import { Count, sumCounts } from '../layout/count';
import { SearchTabs } from '../layout/tabs';
import { SearchResults } from '../results-list';
import { DiseaseOverviewCard } from '../results-list/components/carousel-compact-card/disease-overview-card';
import { ProgramInfoCard } from '../results-list/components/carousel-compact-card/program-info-card';
import { ResourceCatalogCard } from '../results-list/components/carousel-compact-card/resource-catalog-card';
import { EmptyState } from '../results-list/components/empty';
import { getSectionFilters } from '../results-list/utils/resource-type-filter';

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
  'sameAs',
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

  // The results the auto-tab last ran against. The auto-tab only picks a tab
  // when the results change, so that its other dependencies (the selected tab,
  // the router) re-running it after a tab click do not switch the user away
  // from a tab with no results — that tab should show its empty state.
  const autoTabResultsRef = useRef<{
    facets: FetchSearchResultsResponse['facets'];
    bioSampleTotal: number;
  } | null>(null);

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
    // A new search keeps showing the previous counts until its own arrive,
    // rather than dropping every tab and section to zero.
    { enabled: router.isReady, placeholderData: keepPreviousData },
  );

  const { data: facetData } = searchResultsData.response;
  // No `@type` counts for this search yet: none at all, or the previous
  // search's, still showing.
  const facetCountsPending =
    searchResultsData.response.isPending ||
    searchResultsData.response.isPlaceholderData;

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

  // The counts the auto-tab below picks a tab from haven't arrived for this
  // search yet. Both show the previous search's counts in the meantime
  // (`keepPreviousData`), so that counts as pending too.
  const tabCountsPending =
    facetCountsPending ||
    bioSampleAgg.isPending ||
    bioSampleAgg.isPlaceholderData;

  // The Sample and DataCollection prefetches below only help if their params
  // match the first page the tab's results section requests (see
  // `SearchResults`), since both share the query key. That means the same
  // type-scoped filters, and the URL's `use_metadata_score` and
  // `use_ai_search` as they are, without defaults.

  // Prefetch the Sample table query in the background.
  useEffect(() => {
    if (!router.isReady || !SHOW_SAMPLES_TAB) return;

    const sampleFilters =
      queryFilterObject2String(
        getSectionFilters(['Sample'], queryParams.filters),
      ) || '';
    const sampleExtraFilter = sampleFilters
      ? `${sampleFilters} AND ${BIOSAMPLE_EXTRA_FILTER}`
      : BIOSAMPLE_EXTRA_FILTER;

    const sampleParams: Params = {
      q: queryParams.q,
      extra_filter: sampleExtraFilter,
      facets: '',
      fields: SAMPLE_FIELDS,
      sort: defaultQuery.sort,
      size: `${getDefaultSizeForTab('s')}`,
      from: '0',
      use_metadata_score: queryParams.shouldUseMetadataScore ? 'true' : 'false',
      use_ai_search: queryParams.use_ai_search,
    };

    queryClient.prefetchQuery({
      queryKey: ['search-results', sampleParams],
      queryFn: () => fetchSearchResults(sampleParams),
      staleTime: 1000 * 60 * 2,
    });
  }, [
    router.isReady,
    queryParams.q,
    queryParams.filters,
    queryParams.shouldUseMetadataScore,
    queryParams.use_ai_search,
    queryClient,
  ]);

  // Prefetch the DataCollection table query.
  useEffect(() => {
    if (!router.isReady || !SHOW_DATA_COLLECTIONS_TAB) return;

    const dcParams: Params = {
      q: queryParams.q,
      extra_filter:
        queryFilterObject2String(
          getSectionFilters(['DataCollection'], queryParams.filters),
        ) || '',
      facets: '',
      fields: DATA_COLLECTION_FIELDS,
      sort: defaultQuery.sort,
      size: `${getDefaultSizeForTab('dc')}`,
      from: '0',
      use_metadata_score: queryParams.shouldUseMetadataScore ? 'true' : 'false',
      use_ai_search: queryParams.use_ai_search,
    };

    queryClient.prefetchQuery({
      queryKey: ['search-results', dcParams],
      queryFn: () => fetchSearchResults(dcParams),
      staleTime: 1000 * 60 * 2,
    });
  }, [
    router.isReady,
    queryParams.q,
    queryParams.filters,
    queryParams.shouldUseMetadataScore,
    queryParams.use_ai_search,
    queryClient,
  ]);

  // Determine the correct tab based on actual search results.
  // A layout effect, so a switch lands before the browser paints: the render
  // that brings the counts in also shows the current tab's results, and when
  // those are empty they would otherwise flash up just before the switch.
  // It waits for every count, as the ones on screen until then are the
  // previous search's.
  useIsomorphicLayoutEffect(() => {
    if (tabCountsPending || !facetData?.facets || !router.isReady) return;
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
    tabCountsPending,
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
      size: 200,
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
    count: diseaseCount,
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

  // Program collections without a resource catalog, shown as "Program Info"
  // cards after the resource catalogs.
  const {
    programCollections,
    hasProgramInfo,
    isLoading: programInfoIsLoading,
  } = useProgramInfoCollections({
    q: queryParams.q,
    filters: queryParams.filters,
    enabled: router.isReady,
  });
  // `undefined` until the collections first load.
  const programInfoCount = !SHOW_PROGRAM_RESOURCE_UI
    ? 0
    : programInfoIsLoading
    ? undefined
    : programCollections.length;

  const carouselItems = useMemo(() => {
    const items: Array<{
      type: 'resource' | 'program-info' | 'disease';
      data: any;
    }> = [];

    resourceCatalogData.forEach(resource => {
      items.push({ type: 'resource', data: resource });
    });

    programCollections.forEach(collection => {
      items.push({ type: 'program-info', data: collection });
    });

    matchingDiseases.forEach(disease => {
      items.push({ type: 'disease', data: disease });
    });

    return items.sort((a, b) => {
      // sort by name alphabetically
      const nameA = a.data.name?.toLowerCase() || '';
      const nameB = b.data.name?.toLowerCase() || '';
      if (nameA < nameB) return -1;
      if (nameA > nameB) return 1;
      return 0;
    });
  }, [resourceCatalogData, programCollections, matchingDiseases]);

  const shouldShowCarousel =
    hasResourceCatalogRecords || hasMatchingDiseases || hasProgramInfo;

  // Whether there are resource catalogs comes from the `@type` counts, so
  // until those are in for this search the carousel is loading, not empty.
  const isCarouselLoading =
    facetCountsPending ||
    (hasResourceCatalogRecords && (carouselIsLoading || carouselIsPending)) ||
    diseaseIsLoading;

  // The open sections come from the counts and the disease matches (see
  // `getAccordionDefaultValues`), which read as zero while they load. Waiting
  // for them keeps a section from collapsing and re-opening on every search.
  const holdAccordionDefaults = tabCountsPending || diseaseIsLoading;

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
              // `undefined` until the counts first load. A later search shows
              // the previous counts until its own arrive.
              const terms = facetData?.facets?.['@type']?.terms ?? [];
              const facet = terms.find(t => t.term === type);
              let count: number | undefined = facetData
                ? facet?.count || 0
                : searchResultsData.response.isPending
                ? undefined
                : 0;

              if (type === 'Disease') {
                count = diseaseCount;
              }

              // Use the BioSample-scoped total for the Sample type so the tab
              // label reflects only @type:Sample AND additionalType:"BioSample".
              if (type === 'Sample') {
                count = bioSampleAgg.isPending ? undefined : bioSampleTotal;
              }

              return { label, accordionLabel, type, count };
            });

          return {
            ...tab,
            types: tabTypesWithCount,
          };
        }),
    [
      facetData,
      searchResultsData.response.isPending,
      diseaseCount,
      bioSampleAgg.isPending,
      bioSampleTotal,
    ],
  );

  // Types of the sections that should start expanded — these match the `value`
  // given to each accordion item. Types rather than labels: zag builds element
  // ids from the value, and a label's space splits `aria-controls` in two. Primary result types stay open even with no
  // results so their empty state is visible; every other type only opens when
  // it has results (ResourceCatalog also opens when there are matching diseases
  // to show in its carousel).
  const getAccordionDefaultValues = (
    sections: (TabType['types'][number] & { count: number | undefined })[],
  ) =>
    sections
      .filter(
        section =>
          isRenderedSection(section) &&
          (ALWAYS_EXPANDED_TYPES.has(section.type) ||
            (section.count ?? 0) > 0 ||
            (section.type === 'ResourceCatalog' && hasMatchingDiseases)),
      )
      .map(section => section.type);

  return (
    <>
      <SearchTabs
        value={selectedTab.id}
        onValueChange={e => handleTabChange(e.value)}
        colorPalette={colorPalette}
        tabs={tabsWithFacetCounts}
        programInfoCount={programInfoCount}
        renderTabPanels={() =>
          tabsWithFacetCounts.map(tab => {
            const sections = tab.types;
            const defaultValues = getAccordionDefaultValues(sections);

            return (
              <Tabs.Content
                key={tab.id}
                value={tab.id}
                pt={0}
                // Ark leaves a tab's panel on screen until an animation frame
                // after the switch (its presence machine, for exit
                // animations, which these panels don't have). That frame can
                // wait on the new tab's first render, so the old panel stays
                // up beside it, often showing an empty state. Hide it in the
                // same render instead.
                hidden={tab.id !== selectedTab.id}
              >
                <AccordionWrapper
                  defaultValue={defaultValues}
                  holdDefaultValue={holdAccordionDefaults}
                >
                  {sections.filter(isRenderedSection).map(section => {
                    // For ResourceCatalog, render "Other Resources" with carousel
                    if (section.type === 'ResourceCatalog') {
                      const otherResourcesCount = sumCounts(
                        ...sections
                          .filter(
                            ({ type }) =>
                              type === 'ResourceCatalog' || type === 'Disease',
                          )
                          .map(({ count }) => count),
                        programInfoCount,
                      );
                      return (
                        <AccordionContent
                          key={section.label}
                          value={section.type}
                          title={
                            otherResourcesCount === undefined ? (
                              // Which parts the title breaks down depends on
                              // the counts, so it waits for all of them.
                              <>
                                {TAB_LABELS.OTHER_RESOURCES} (
                                <Count count={undefined} />)
                              </>
                            ) : (
                              generateOtherResourcesTitle(
                                sections.map(({ type, count }) => ({
                                  type,
                                  count: count ?? 0,
                                })),
                                programInfoCount,
                              )
                            )
                          }
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
                                      carouselItem?.data?.id
                                        ? `${carouselItem.type}-${carouselItem.data.id}`
                                        : `loading-${idx}`
                                    }
                                  >
                                    {carouselItem.type === 'resource' ? (
                                      <ResourceCatalogCard
                                        data={carouselItem.data}
                                        loading={isCarouselLoading}
                                        referrerPath={router.asPath}
                                      />
                                    ) : carouselItem.type === 'program-info' ? (
                                      <ProgramInfoCard
                                        data={carouselItem.data}
                                        loading={isCarouselLoading}
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
                    // render normal search results, titled with the same count
                    // as the tab label (the BioSample-scoped total for Sample).
                    // Use accordionLabel if provided, otherwise fall back to label.
                    return (
                      <AccordionContent
                        key={section.label}
                        value={section.type}
                        title={
                          <>
                            {section.accordionLabel ?? section.label} (
                            <Count count={section.count} />)
                          </>
                        }
                      >
                        <SearchResults
                          id={tab.id}
                          tabs={tabs}
                          types={[section.type]}
                          tabCountsPending={tabCountsPending}
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
