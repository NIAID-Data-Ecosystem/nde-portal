import React, { useMemo, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { Collapse, ListItem, UnorderedList, VStack } from '@chakra-ui/react';
import Card from './components/card';
import { ErrorMessage } from './components/error';
import { useSearchQueryFromURL } from '../../hooks/useSearchQueryFromURL';
import { useSearchResultsData } from '../../hooks/useSearchResultsData';
import { EmptyState } from './components/empty';
import { MAX_RESULTS, Pagination } from './components/pagination';
import { TabType } from '../../types';
import { useSearchTabsContext } from '../../context/search-tabs-context';
import { usePaginationContext } from '../../context/pagination-context';
import { updateRoute } from '../../utils/update-route';
import { SearchResultsToolbar } from './components/toolbar';
import Banner from 'src/components/banner';
import { SampleResultsTable } from './components/sample-results-table';
import { DataCollectionResultsTable } from './components/data-collection-results-table';
import { DatasetResultsTable } from './components/dataset-results-table';
import { ComputationalToolResultsTable } from './components/computational-tool-results-table';
import { useSearchResultsFetchedContext } from '../../context/search-results-fetched-context';
import { CustomizeColumnsPopover } from './components/results-table/components/CustomizeColumnsPopover';
import {
  RESULTS_TABLE_SETTINGS,
  ResultsTableType,
} from './config/table-settings';
import {
  resolveStoredOrderedIds,
  resolveStoredVisibleIds,
} from 'src/components/select-and-order-popover';
import {
  ViewMode,
  ViewModeRadio,
} from './components/toolbar/components/view-mode-radio';
import { BIOSAMPLE_EXTRA_FILTER } from '../../hooks/useBioSampleAggregation';
import { FetchSearchResultsResponse } from 'src/utils/api/types';
import {
  RESULT_FIELDS,
  SAMPLE_FIELDS,
  DATA_COLLECTION_FIELDS,
  DATASET_TABLE_FIELDS,
  COMPUTATIONAL_TOOL_TABLE_FIELDS,
} from '../../config/fields';

/*
[COMPONENT INFO]:
 Search results pages displays the list of records returned by a search.
 Contains pagination and search results cards. The Samples ('s') and
 DataCollection ('dc') tabs always render a table. The Dataset and
 ComputationalTool sections render cards by default and let the user switch to
 a table via the "View mode" radio in the toolbar.
*/

export const SearchResults = ({
  id,
  tabs,
  types,
}: {
  id: TabType['id'];
  tabs: TabType[];
  types: string[];
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

  // Samples and DataCollections always render as a table.
  const isSamplesTab = id === 's';
  const isDataCollectionTab = id === 'dc';

  // The 'd' tab renders one SearchResults per accordion section, so key the
  // view-mode toggle off the section type rather than the tab id: only the
  // Dataset section should offer it (ResourceCatalog renders a carousel).
  const isDatasetSection = types.includes('Dataset');
  const isComputationalToolSection = types.includes('ComputationalTool');
  const supportsViewToggle = isDatasetSection || isComputationalToolSection;

  const [viewMode, setViewMode] = useState<ViewMode>('card');
  const isTableView = supportsViewToggle && viewMode === 'table';

  // Which table this instance renders when a table is showing. Fixed for the
  // lifetime of the component (it depends only on props), so the column state
  // below can be initialized at mount even while the card view is active.
  const tableType: ResultsTableType | null = isSamplesTab
    ? 'sample'
    : isDataCollectionTab
    ? 'data-collection'
    : isDatasetSection
    ? 'dataset'
    : isComputationalToolSection
    ? 'computational-tool'
    : null;

  const tableSettings = tableType ? RESULTS_TABLE_SETTINGS[tableType] : null;

  // Samples and DataCollections are table-only; the other two are opt-in.
  const showTable = isSamplesTab || isDataCollectionTab || isTableView;

  // Each table uses a minimal, table-specific field list rather than the
  // shared RESULT_FIELDS base (which carries many card-only fields that the
  // tables never render).
  const fields = isSamplesTab
    ? SAMPLE_FIELDS
    : isDataCollectionTab
    ? DATA_COLLECTION_FIELDS
    : isTableView && isDatasetSection
    ? DATASET_TABLE_FIELDS
    : isTableView && isComputationalToolSection
    ? COMPUTATIONAL_TOOL_TABLE_FIELDS
    : RESULT_FIELDS;

  // Column visibility / ordering for whichever table is active. Initialized
  // lazily from localStorage so the first client render already has the right
  // columns and does not flicker.
  const [visibleColumnIds, setVisibleColumnIds] = useState<string[]>(() =>
    tableSettings
      ? resolveStoredVisibleIds({
          storageKey: tableSettings.storageKeyVisible,
          allIds: tableSettings.columns.map(col => col.id),
          defaultVisibleIds: tableSettings.defaultVisibleIds,
          requiredIds: tableSettings.requiredIds,
        })
      : [],
  );
  const [columnOrder, setColumnOrder] = useState<string[]>(() =>
    tableSettings
      ? resolveStoredOrderedIds({
          storageKey: tableSettings.storageKeyOrder,
          allIds: tableSettings.columns.map(col => col.id),
          requiredIds: tableSettings.requiredIds,
        })
      : [],
  );

  // Column configs for the Customize Columns popover.
  const columnConfigs = useMemo(
    () =>
      tableSettings
        ? tableSettings.columns.map(col => ({ id: col.id, title: col.title }))
        : [],
    [tableSettings],
  );

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
      filters: {
        ...urlQueryParams.filters,
        '@type': [...(urlQueryParams?.filters?.['@type'] || types || [])],
      },
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

  const { data, isLoading, isRefetching, isFetching, error, isFetched } =
    response;

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
      <VStack borderRadius='semi' bg='white' px={4} py={2}>
        {/* Toolbar controls: Sort, size, download metadata, and optional extra
        actions. Whenever a table is showing, the "Customize Columns" button is
        injected via the extraActions prop so it appears to the left of Download
        Metadata. The Card / Table radio gets its own row above the rest. */}
        <SearchResultsToolbar
          id={id}
          params={params}
          viewModeControl={
            supportsViewToggle ? (
              <ViewModeRadio
                id={`${id}-${types.join('-')}`}
                value={viewMode}
                onChange={setViewMode}
              />
            ) : undefined
          }
          extraActions={
            showTable && tableSettings ? (
              <CustomizeColumnsPopover
                columnsList={columnConfigs}
                storageKeyVisible={tableSettings.storageKeyVisible}
                storageKeyOrder={tableSettings.storageKeyOrder}
                defaultVisibleIds={tableSettings.defaultVisibleIds}
                requiredIds={tableSettings.requiredIds}
                onVisibleColumnsChange={setVisibleColumnIds}
                onColumnOrderChange={setColumnOrder}
              />
            ) : undefined
          }
        />

        {/* Pagination controls */}
        <Pagination
          id='pagination-top'
          ariaLabel='Paginate through resources.'
          selectedPage={from}
          selectedPerPage={size}
          handleSelectedPage={handlePageChange}
          isLoading={isLoading || isRefetching}
          total={data?.total || 0}
        />

        {/* Display banner on last page if results exceed amount allotted by API */}
        <Collapse in={from === Math.floor(MAX_RESULTS / size)} animateOpacity>
          <Banner status='info'>
            Only the first {MAX_RESULTS.toLocaleString()} results are displayed,
            please limit your query to get better results or use our API to
            download all results.
          </Banner>
        </Collapse>

        {/* Samples tab */}
        {isSamplesTab ? (
          <SampleResultsTable
            results={data?.results || []}
            isLoading={!router.isReady || isLoading}
            visibleColumnIds={visibleColumnIds}
            columnOrder={columnOrder}
            currentSort={sort}
            onSortChange={handleSortChange}
          />
        ) : isDataCollectionTab ? (
          /* DataCollection tab */
          <DataCollectionResultsTable
            results={data?.results || []}
            isLoading={!router.isReady || isLoading}
            visibleColumnIds={visibleColumnIds}
            columnOrder={columnOrder}
            currentSort={sort}
            onSortChange={handleSortChange}
          />
        ) : isTableView && isDatasetSection ? (
          /* Dataset tab, table view */
          <DatasetResultsTable
            results={data?.results || []}
            isLoading={!router.isReady || isLoading}
            referrerPath={router.asPath}
            visibleColumnIds={visibleColumnIds}
            columnOrder={columnOrder}
            currentSort={sort}
            onSortChange={handleSortChange}
          />
        ) : isTableView && isComputationalToolSection ? (
          /* ComputationalTool tab, table view */
          <ComputationalToolResultsTable
            results={data?.results || []}
            isLoading={!router.isReady || isLoading}
            referrerPath={router.asPath}
            visibleColumnIds={visibleColumnIds}
            columnOrder={columnOrder}
            currentSort={sort}
            onSortChange={handleSortChange}
          />
        ) : (
          /* Dataset / ComputationalTool tabs: render result cards */
          numCards > 0 && (
            <VStack
              as={UnorderedList}
              className='search-results-cards'
              alignItems='flex-start'
              flex={3}
              ml={0}
              spacing={4}
              w='100%'
            >
              {Array(numCards)
                .fill(null)
                .map((_, idx) => {
                  return (
                    <ListItem key={data?.results?.[idx]._id || idx} w='100%'>
                      <Card
                        isLoading={!router.isReady || isLoading}
                        data={data?.results[idx]}
                        referrerPath={router.asPath}
                        querystring={urlQueryParams.q}
                      />
                    </ListItem>
                  );
                })}
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
          isLoading={isLoading || isRefetching}
          total={data?.total || 0}
        />
      </VStack>
    </>
  );
};
