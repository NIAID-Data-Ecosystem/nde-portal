import { List, VStack } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import React, { useCallback, useMemo } from 'react';
import { Alert } from 'src/components/alert';
import { FetchSearchResultsResponse } from 'src/utils/api/types';
import {
  SHOW_DATA_COLLECTIONS_VIEW_MODES,
  SHOW_SEARCH_VIEW_MODES,
} from 'src/utils/feature-flags';

import {
  DATA_COLLECTION_FIELDS,
  RESULT_FIELDS,
  SAMPLE_FIELDS,
} from '../../config/fields';
import { TABS_WITH_VIEW_MODE } from '../../config/view-mode';
import { usePaginationContext } from '../../context/pagination-context';
import { useSearchResultsFetchedContext } from '../../context/search-results-fetched-context';
import { useSearchTabsContext } from '../../context/search-tabs-context';
import { BIOSAMPLE_EXTRA_FILTER } from '../../hooks/useBioSampleAggregation';
import { useSearchQueryFromURL } from '../../hooks/useSearchQueryFromURL';
import { useSearchResultsData } from '../../hooks/useSearchResultsData';
import { useViewMode } from '../../hooks/useViewMode';
import { SearchViewMode, TabType } from '../../types';
import { updateRoute } from '../../utils/update-route';
import Card from './components/card';
import { EmptyState } from './components/empty';
import { ErrorMessage } from './components/error';
import { MAX_RESULTS, Pagination } from './components/pagination';
import { SEARCH_TABLES } from './components/results-table/tables';
import { SearchResultsToolbar } from './components/toolbar';
import { ViewModeRadio } from './components/toolbar/components/view-mode-radio';
import { getSectionFilters } from './utils/resource-type-filter';

/*
[COMPONENT INFO]:
 Search results pages displays the list of records returned by a search.
 Contains pagination and search results cards. The Samples tab always shows
 a table; the other tabs show a table instead of cards in their table view
 (see SEARCH_TABLES).
*/

export const SearchResults = ({
  id,
  tabs,
  types,
  tabCountsPending = false,
}: {
  id: TabType['id'];
  tabs: TabType[];
  types: string[];
  /**
   * The result counts that pick the active tab are still loading for this
   * search. They can move the page to another tab, so until they arrive an
   * empty page here shows as loading, not as "No results found".
   */
  tabCountsPending?: boolean;
}) => {
  const router = useRouter();

  // Get the selected tab index from the search context.
  const { selectedIndex } = useSearchTabsContext();
  const activeTabId = tabs[selectedIndex].id;

  // Retrieve pagination state for the current tab.
  // This allows each tab to fetch the correct page of results independently.
  const { getPagination, setPagination } = usePaginationContext();
  const { from, size, sort } = getPagination(id);

  // Selected tab index is stored in context to sync with other components.
  const urlQueryParams = useSearchQueryFromURL();

  // Persisted per-tab card/table preference. Only some tabs offer the choice,
  // and the Data Collections tab is gated behind its own flag.
  const showViewMode =
    SHOW_SEARCH_VIEW_MODES &&
    TABS_WITH_VIEW_MODE.includes(id) &&
    (id !== 'dc' || SHOW_DATA_COLLECTIONS_VIEW_MODES);
  const [viewMode, setViewMode] = useViewMode(id);

  // For Samples and DataCollection tabs, use extra fields for the table columns.
  const isSamplesTab = id === 's';
  const isDataCollectionTab = id === 'dc';
  // The Datasets and Computational Tools tabs render either cards or a table,
  // depending on the user's view mode preference. The flag is checked here as
  // well as on the radio: a user may already have "table" persisted in
  // localStorage, and that must not surface a view the flag hides.
  const isDatasetTable =
    SHOW_SEARCH_VIEW_MODES && id === 'd' && viewMode === 'table';
  const isComputationalToolTable =
    SHOW_SEARCH_VIEW_MODES && id === 'ct' && viewMode === 'table';
  // Data Collections also offer both views, but default to cards. Unlike the
  // two tabs above, this tab predates the view mode radio and was table-only,
  // so when either flag hides the radio it must fall back to the table rather
  // than to the card default.
  const isDataCollectionTable =
    isDataCollectionTab &&
    (!SHOW_SEARCH_VIEW_MODES ||
      !SHOW_DATA_COLLECTIONS_VIEW_MODES ||
      viewMode === 'table');
  // The tab's table (see SEARCH_TABLES), when it shows one rather than cards.
  const showsTable =
    isSamplesTab ||
    isDatasetTable ||
    isComputationalToolTable ||
    isDataCollectionTable;
  const searchTable = showsTable ? SEARCH_TABLES[id] : undefined;

  // Each tab type uses a minimal, tab-specific field list rather than the
  // shared RESULT_FIELDS base (which carries many fields that other tabs never
  // render). Note these are selected by tab, not by view mode: an identical
  // field list keeps the query key the same for both view modes, so toggling
  // card/table never triggers a refetch, and it stays matched to the prefetch
  // in the tabs controller. The Dataset table reuses RESULT_FIELDS for the same
  // reason.
  const fields = isSamplesTab
    ? SAMPLE_FIELDS
    : isDataCollectionTab
    ? DATA_COLLECTION_FIELDS
    : RESULT_FIELDS;

  // The table view shown, described for the XLSX "Custom Result View"
  // download: its visible columns in the user's order, as the table shows
  // them. Card views have none. Every tab has a table, so the hook runs in
  // both views and the hook order never changes.
  const tableExport = SEARCH_TABLES[id].useCustomViewExport();
  const customViewExport = searchTable ? tableExport : undefined;

  // Drops results that aren't one of this section's types. Most queries are
  // already scoped to them, but when the selected `@type` filter excludes
  // every one of them, the section queries the selected types instead (see
  // `getSectionTypeFilter`). Dropping those results is what leaves the
  // section empty, so this is still needed.
  const selectByType = useCallback(
    (data: FetchSearchResultsResponse | undefined) => {
      if (types && types.length > 0 && data) {
        return {
          results: data.results.filter(result =>
            types.includes(result['@type'] as string),
          ),
          total: data.total,
          facets: data.facets,
        };
      }
      return data;
    },
    // `types` is a prop passed as a stable array literal at each call site
    // (e.g. types={['Sample']}), so this callback only recreates when the
    // actual type values change.
    [types],
  );

  const { response, params } = useSearchResultsData(
    {
      ...urlQueryParams,
      from,
      size,
      sort,
      filters: getSectionFilters(types, urlQueryParams.filters),
      // For the Samples tab, append the BioSample constraint via additionalFilter.
      additionalFilter: isSamplesTab ? BIOSAMPLE_EXTRA_FILTER : undefined,
      fields,
    },
    {
      // Only fetch data when the router is ready and the active tab is selected.
      // This prevents unnecessary data fetching when switching tabs.
      enabled: router.isReady && id === activeTabId,
      select: selectByType,
    },
  );

  const { data, isRefetching, isFetching, error, isFetched } = response;

  // A filter can leave this section empty while another tab has results
  // (e.g. a source with only Data Collections, picked on the Datasets tab).
  // The page then switches to that tab once the tab counts arrive (see the
  // tabs controller), but this section's results often arrive first. Showing
  // the empty state in that gap flashes "No results found" for a filter that
  // does have results, so keep loading until the counts are in.
  const isLoading =
    response.isLoading ||
    (tabCountsPending && !error && !data?.results?.length);

  const { markResultsFetching, markResultsFetched } =
    useSearchResultsFetchedContext();
  const isActiveTab = id === activeTabId;

  React.useEffect(() => {
    if (!isActiveTab) return;

    if (isFetching) {
      markResultsFetching();
      return;
    }

    if (isFetched) {
      markResultsFetched();
    }
  }, [
    isActiveTab,
    isFetching,
    isFetched,
    markResultsFetching,
    markResultsFetched,
  ]);

  const numCards = useMemo(
    () =>
      Math.min(
        isLoading ? urlQueryParams.size : data?.results?.length || 0,
        urlQueryParams.size,
      ),
    [isLoading, data?.results?.length, urlQueryParams.size],
  );

  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !router.isReady) {
    return null;
  }

  if (error) {
    return (
      <ErrorMessage
        error={error}
        querystring={params.q === '__all__' ? '' : params.q}
      />
    );
  }

  if (!isLoading && (!data?.results || data.results.length === 0)) {
    return <EmptyState />;
  }

  // Shared pagination handler used by both top and bottom pagination controls.
  const handlePageChange = (newFrom: number) => {
    const update = { from: newFrom };
    setPagination(id, update);
    updateRoute(router, update);
  };

  /**
   * Called by tables when the user clicks a column sort toggle.
   * Converts the API field + direction into the sort string format used
   * elsewhere (e.g. `"-name.raw"` for descending), then updates both
   * pagination state and the URL (identical to how the toolbar sort
   * dropdown works, including the reset to page 1).
   */
  const handleSortChange = (apiField: string, ascending: boolean) => {
    const newSort = ascending ? apiField : `-${apiField}`;
    const update = { sort: newSort, from: 1 };
    setPagination(id, update);
    updateRoute(router, update);
  };

  return (
    <>
      <VStack borderRadius='semi' px={4} py={2}>
        {/* Toolbar controls: Sort, size, download metadata, and optional extra actions. Whenever a table is shown, its "Customize Columns" button is injected via the extraActions prop so it appears to the left of Download Metadata. */}
        <SearchResultsToolbar
          id={id}
          params={params}
          customViewExport={customViewExport}
          viewModeControl={
            showViewMode ? (
              <ViewModeRadio
                id={id}
                label='View mode'
                value={viewMode}
                onValueChange={({ value }) => {
                  value && setViewMode(value as SearchViewMode);
                }}
              />
            ) : undefined
          }
          extraActions={
            searchTable ? <searchTable.ColumnCustomizer /> : undefined
          }
        />

        {/* Pagination controls */}
        <Pagination
          id='pagination-top'
          ariaLabel='Paginate through resources.'
          selectedPage={from}
          selectedPerPage={size}
          handleSelectedPage={handlePageChange}
          loading={isLoading || isRefetching}
          total={data?.total || 0}
        />

        {/* Display banner on last page if results exceed amount allotted by API */}
        {from === Math.floor(MAX_RESULTS / size) && (
          <Alert status='info' title='Results Limit Reached'>
            Only the first {MAX_RESULTS.toLocaleString()} results are displayed,
            please limit your query to get better results or use our API to
            download all results.
          </Alert>
        )}

        {searchTable ? (
          <searchTable.Table
            results={data?.results || []}
            // Any fetch, not just the first: a refetch of cached results
            // keeps them up with a small loading indicator over the rows.
            // `isLoading` adds an empty page held for the tab counts.
            loading={!router.isReady || isFetching || isLoading}
            currentSort={sort}
            onSortChange={handleSortChange}
          />
        ) : (
          /* Dataset / ComputationalTool / DataCollection tabs in card view: render result cards */
          numCards > 0 && (
            <VStack
              className='search-results-cards'
              alignItems='flex-start'
              flex={3}
              ml={0}
              gap={4}
              w='100%'
              asChild
            >
              <List.Root as='ul' pl={0}>
                {Array(numCards)
                  .fill(null)
                  .map((_, idx) => {
                    return (
                      // No result at `idx` while loading, including an empty
                      // page held for the tab counts.
                      <List.Item
                        key={data?.results?.[idx]?._id || idx}
                        w='100%'
                      >
                        <Card
                          loading={!router.isReady || isLoading}
                          data={data?.results[idx]}
                          referrerPath={router.asPath}
                          querystring={urlQueryParams.q}
                        />
                      </List.Item>
                    );
                  })}
              </List.Root>
            </VStack>
          )
        )}

        {/* Pagination controls */}
        <Pagination
          id='pagination-bottom'
          ariaLabel='Paginate through resources.'
          selectedPage={from}
          selectedPerPage={size}
          handleSelectedPage={handlePageChange}
          loading={isLoading || isRefetching}
          total={data?.total || 0}
        />
      </VStack>
    </>
  );
};
