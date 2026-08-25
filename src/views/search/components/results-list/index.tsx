import { Collapsible, List, VStack } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import React, { useCallback, useMemo, useState } from 'react';
import Banner from 'src/components/banner';
import {
  resolveStoredOrderedIds,
  resolveStoredVisibleIds,
} from 'src/components/select-and-order-popover';
import { FetchSearchResultsResponse } from 'src/utils/api/types';
import { SHOW_SEARCH_VIEW_MODES } from 'src/utils/feature-flags';

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
import { TabType } from '../../types';
import { updateRoute } from '../../utils/update-route';
import Card from './components/card';
import {
  ALL_COMPUTATIONAL_TOOL_COLUMNS,
  ComputationalToolResultsTable,
} from './components/computational-tool-results-table';
import {
  CUSTOM_COLUMN_ORDER_STORAGE_KEY as CT_CUSTOM_COLUMN_ORDER_STORAGE_KEY,
  CUSTOM_VISIBLE_COLUMNS_STORAGE_KEY as CT_CUSTOM_VISIBLE_COLUMNS_STORAGE_KEY,
  CustomizeColumnsPopover as ComputationalToolCustomizeColumnsPopover,
  DEFAULT_VISIBLE_COLUMN_IDS as CT_DEFAULT_VISIBLE_COLUMN_IDS,
} from './components/computational-tool-results-table/components/CustomizeColumnsPopover';
import {
  ALL_DATA_COLLECTION_COLUMNS,
  DataCollectionResultsTable,
} from './components/data-collection-results-table';
import {
  CUSTOM_COLUMN_ORDER_STORAGE_KEY as DC_CUSTOM_COLUMN_ORDER_STORAGE_KEY,
  CUSTOM_VISIBLE_COLUMNS_STORAGE_KEY as DC_CUSTOM_VISIBLE_COLUMNS_STORAGE_KEY,
  CustomizeColumnsPopover as DataCollectionCustomizeColumnsPopover,
  DEFAULT_VISIBLE_COLUMN_IDS as DC_DEFAULT_VISIBLE_COLUMN_IDS,
} from './components/data-collection-results-table/components/CustomizeColumnsPopover';
import {
  ALL_DATASET_COLUMNS,
  DatasetResultsTable,
} from './components/dataset-results-table';
import {
  CUSTOM_COLUMN_ORDER_STORAGE_KEY as DATASET_CUSTOM_COLUMN_ORDER_STORAGE_KEY,
  CUSTOM_VISIBLE_COLUMNS_STORAGE_KEY as DATASET_CUSTOM_VISIBLE_COLUMNS_STORAGE_KEY,
  CustomizeColumnsPopover as DatasetCustomizeColumnsPopover,
  DEFAULT_VISIBLE_COLUMN_IDS as DATASET_DEFAULT_VISIBLE_COLUMN_IDS,
} from './components/dataset-results-table/components/CustomizeColumnsPopover';
import { EmptyState } from './components/empty';
import { ErrorMessage } from './components/error';
import { MAX_RESULTS, Pagination } from './components/pagination';
import {
  COMPUTATIONAL_TOOL_REQUIRED_COLUMN_IDS,
  DATASET_REQUIRED_COLUMN_IDS,
} from './components/results-table/constants';
import {
  ALL_SAMPLE_COLUMNS,
  SampleResultsTable,
} from './components/sample-results-table';
import {
  CUSTOM_COLUMN_ORDER_STORAGE_KEY as SAMPLE_CUSTOM_COLUMN_ORDER_STORAGE_KEY,
  CUSTOM_VISIBLE_COLUMNS_STORAGE_KEY as SAMPLE_CUSTOM_VISIBLE_COLUMNS_STORAGE_KEY,
  CustomizeColumnsPopover as SampleCustomizeColumnsPopover,
  DEFAULT_VISIBLE_COLUMN_IDS as SAMPLE_DEFAULT_VISIBLE_COLUMN_IDS,
} from './components/sample-results-table/components/CustomizeColumnsPopover';
import { SearchResultsToolbar } from './components/toolbar';
import { ViewModeRadio } from './components/toolbar/components/view-mode-radio';

const readFromStorage = (key: string, fallback: string[]): string[] => {
  if (typeof window === 'undefined') return fallback;
  try {
    const stored = window.localStorage.getItem(key);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // ignore
  }
  return fallback;
};

// Read the persisted visible column IDs from localStorage.
// Falls back to the default subset when no stored value exists.
const getInitialVisibleColumnIds = (): string[] => {
  const stored = readFromStorage(
    SAMPLE_CUSTOM_VISIBLE_COLUMNS_STORAGE_KEY,
    SAMPLE_DEFAULT_VISIBLE_COLUMN_IDS,
  );
  const allIds = ALL_SAMPLE_COLUMNS.map(c => c.id);
  const valid = stored.filter((id: string) => allIds.includes(id));
  return valid.length > 0 ? valid : SAMPLE_DEFAULT_VISIBLE_COLUMN_IDS;
};

// Read the persisted column order from localStorage.
// Falls back to the master column order when no stored value exists.
const getInitialColumnOrder = (): string[] => {
  const allIds = ALL_SAMPLE_COLUMNS.map(c => c.id);
  const stored = readFromStorage(
    SAMPLE_CUSTOM_COLUMN_ORDER_STORAGE_KEY,
    allIds,
  );
  const valid = stored.filter((id: string) => allIds.includes(id));
  if (valid.length > 0) {
    const missing = allIds.filter(id => !valid.includes(id));
    return [...valid, ...missing];
  }
  return allIds;
};

const getInitialDataCollectionVisibleColumnIds = (): string[] => {
  const stored = readFromStorage(
    DC_CUSTOM_VISIBLE_COLUMNS_STORAGE_KEY,
    DC_DEFAULT_VISIBLE_COLUMN_IDS,
  );
  const allIds = ALL_DATA_COLLECTION_COLUMNS.map(c => c.id);
  const valid = stored.filter((id: string) => allIds.includes(id));
  return valid.length > 0 ? valid : DC_DEFAULT_VISIBLE_COLUMN_IDS;
};

const getInitialDataCollectionColumnOrder = (): string[] => {
  const allIds = ALL_DATA_COLLECTION_COLUMNS.map(c => c.id);
  const stored = readFromStorage(DC_CUSTOM_COLUMN_ORDER_STORAGE_KEY, allIds);
  const valid = stored.filter((id: string) => allIds.includes(id));
  if (valid.length > 0) {
    const missing = allIds.filter(id => !valid.includes(id));
    return [...valid, ...missing];
  }
  return allIds;
};

// The Dataset table resolves its persisted state through the popover's own
// exported resolvers, which apply the required-column rules (always visible,
// pinned first) that the hand-rolled helpers above do not.
const ALL_DATASET_COLUMN_IDS = ALL_DATASET_COLUMNS.map(c => c.id);
const DATASET_REQUIRED_IDS = DATASET_REQUIRED_COLUMN_IDS as unknown as string[];

const getInitialDatasetVisibleColumnIds = (): string[] =>
  resolveStoredVisibleIds({
    storageKey: DATASET_CUSTOM_VISIBLE_COLUMNS_STORAGE_KEY,
    allIds: ALL_DATASET_COLUMN_IDS,
    defaultVisibleIds: DATASET_DEFAULT_VISIBLE_COLUMN_IDS,
    requiredIds: DATASET_REQUIRED_IDS,
  });

const getInitialDatasetColumnOrder = (): string[] =>
  resolveStoredOrderedIds({
    storageKey: DATASET_CUSTOM_COLUMN_ORDER_STORAGE_KEY,
    allIds: ALL_DATASET_COLUMN_IDS,
    requiredIds: DATASET_REQUIRED_IDS,
  });

const ALL_CT_COLUMN_IDS = ALL_COMPUTATIONAL_TOOL_COLUMNS.map(c => c.id);
const CT_REQUIRED_IDS =
  COMPUTATIONAL_TOOL_REQUIRED_COLUMN_IDS as unknown as string[];

const getInitialCTVisibleColumnIds = (): string[] =>
  resolveStoredVisibleIds({
    storageKey: CT_CUSTOM_VISIBLE_COLUMNS_STORAGE_KEY,
    allIds: ALL_CT_COLUMN_IDS,
    defaultVisibleIds: CT_DEFAULT_VISIBLE_COLUMN_IDS,
    requiredIds: CT_REQUIRED_IDS,
  });

const getInitialCTColumnOrder = (): string[] =>
  resolveStoredOrderedIds({
    storageKey: CT_CUSTOM_COLUMN_ORDER_STORAGE_KEY,
    allIds: ALL_CT_COLUMN_IDS,
    requiredIds: CT_REQUIRED_IDS,
  });

// Build the ColumnConfig list expected by each CustomizeColumnsPopover.
const SAMPLE_COLUMN_CONFIGS = ALL_SAMPLE_COLUMNS.map(col => ({
  id: col.id,
  title: col.title,
}));

const DATASET_COLUMN_CONFIGS = ALL_DATASET_COLUMNS.map(col => ({
  id: col.id,
  title: col.title,
}));

const COMPUTATIONAL_TOOL_COLUMN_CONFIGS = ALL_COMPUTATIONAL_TOOL_COLUMNS.map(
  col => ({
    id: col.id,
    title: col.title,
  }),
);

const DATA_COLLECTION_COLUMN_CONFIGS = ALL_DATA_COLLECTION_COLUMNS.map(col => ({
  id: col.id,
  title: col.title,
}));

/*
[COMPONENT INFO]:
 Search results pages displays the list of records returned by a search.
 Contains pagination and search results cards. When the active tab is the
 Samples tab ('s') or the DataCollection tab ('dc'), results are rendered
 as a table instead of cards.
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

  // Persisted per-tab card/table preference. Only some tabs offer the choice.
  const showViewMode =
    SHOW_SEARCH_VIEW_MODES && TABS_WITH_VIEW_MODE.includes(id);
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
  // so when the flag hides the radio it must fall back to the table rather
  // than to the card default.
  const isDataCollectionTable =
    isDataCollectionTab && (!SHOW_SEARCH_VIEW_MODES || viewMode === 'table');

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

  // Only initialize column state for the tab type that this instance actually
  // renders. Avoid paying the localStorage read cost for the other table
  // type on every mount.
  const [visibleColumnIds, setVisibleColumnIds] = useState<string[]>(() =>
    isSamplesTab
      ? getInitialVisibleColumnIds()
      : SAMPLE_DEFAULT_VISIBLE_COLUMN_IDS,
  );
  const [columnOrder, setColumnOrder] = useState<string[]>(() =>
    isSamplesTab ? getInitialColumnOrder() : ALL_SAMPLE_COLUMNS.map(c => c.id),
  );
  const [dcVisibleColumnIds, setDcVisibleColumnIds] = useState<string[]>(() =>
    isDataCollectionTable
      ? getInitialDataCollectionVisibleColumnIds()
      : DC_DEFAULT_VISIBLE_COLUMN_IDS,
  );
  const [dcColumnOrder, setDcColumnOrder] = useState<string[]>(() =>
    isDataCollectionTable
      ? getInitialDataCollectionColumnOrder()
      : ALL_DATA_COLLECTION_COLUMNS.map(c => c.id),
  );
  const [datasetVisibleColumnIds, setDatasetVisibleColumnIds] = useState<
    string[]
  >(() =>
    isDatasetTable
      ? getInitialDatasetVisibleColumnIds()
      : DATASET_DEFAULT_VISIBLE_COLUMN_IDS,
  );
  const [datasetColumnOrder, setDatasetColumnOrder] = useState<string[]>(() =>
    isDatasetTable ? getInitialDatasetColumnOrder() : ALL_DATASET_COLUMN_IDS,
  );
  const [ctVisibleColumnIds, setCtVisibleColumnIds] = useState<string[]>(() =>
    isComputationalToolTable
      ? getInitialCTVisibleColumnIds()
      : CT_DEFAULT_VISIBLE_COLUMN_IDS,
  );
  const [ctColumnOrder, setCtColumnOrder] = useState<string[]>(() =>
    isComputationalToolTable ? getInitialCTColumnOrder() : ALL_CT_COLUMN_IDS,
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
        {/* Toolbar controls: Sort, size, download metadata, and optional extra actions. Whenever a table is being rendered (Samples, and Datasets/Computational Tools/Data Collections in table view) the "Customize Columns" button is injected via the extraActions prop so it appears to the left of Download Metadata. */}
        <SearchResultsToolbar
          id={id}
          params={params}
          viewModeControl={
            showViewMode ? (
              <ViewModeRadio id={id} value={viewMode} onChange={setViewMode} />
            ) : undefined
          }
          extraActions={
            isSamplesTab ? (
              <SampleCustomizeColumnsPopover
                columnsList={SAMPLE_COLUMN_CONFIGS}
                onVisibleColumnsChange={setVisibleColumnIds}
                onColumnOrderChange={setColumnOrder}
              />
            ) : isDataCollectionTable ? (
              <DataCollectionCustomizeColumnsPopover
                columnsList={DATA_COLLECTION_COLUMN_CONFIGS}
                onVisibleColumnsChange={setDcVisibleColumnIds}
                onColumnOrderChange={setDcColumnOrder}
              />
            ) : isDatasetTable ? (
              <DatasetCustomizeColumnsPopover
                columnsList={DATASET_COLUMN_CONFIGS}
                onVisibleColumnsChange={setDatasetVisibleColumnIds}
                onColumnOrderChange={setDatasetColumnOrder}
              />
            ) : isComputationalToolTable ? (
              <ComputationalToolCustomizeColumnsPopover
                columnsList={COMPUTATIONAL_TOOL_COLUMN_CONFIGS}
                onVisibleColumnsChange={setCtVisibleColumnIds}
                onColumnOrderChange={setCtColumnOrder}
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
          loading={isLoading || isRefetching}
          total={data?.total || 0}
        />

        {/* Display banner on last page if results exceed amount allotted by API */}
        <Collapsible.Root open={from === Math.floor(MAX_RESULTS / size)}>
          <Collapsible.Content>
            <Banner status='info'>
              Only the first {MAX_RESULTS.toLocaleString()} results are
              displayed, please limit your query to get better results or use
              our API to download all results.
            </Banner>
          </Collapsible.Content>
        </Collapsible.Root>

        {/* Samples tab */}
        {isSamplesTab ? (
          <SampleResultsTable
            results={data?.results || []}
            loading={!router.isReady || isLoading}
            visibleColumnIds={visibleColumnIds}
            columnOrder={columnOrder}
            currentSort={sort}
            onSortChange={handleSortChange}
          />
        ) : isDataCollectionTable ? (
          /* DataCollection tab in table view */
          <DataCollectionResultsTable
            results={data?.results || []}
            loading={!router.isReady || isLoading}
            visibleColumnIds={dcVisibleColumnIds}
            columnOrder={dcColumnOrder}
            currentSort={sort}
            onSortChange={handleSortChange}
          />
        ) : isDatasetTable ? (
          /* Datasets tab in table view */
          <DatasetResultsTable
            results={data?.results || []}
            loading={!router.isReady || isLoading}
            visibleColumnIds={datasetVisibleColumnIds}
            columnOrder={datasetColumnOrder}
            currentSort={sort}
            onSortChange={handleSortChange}
            referrerPath={router.asPath}
          />
        ) : isComputationalToolTable ? (
          /* Computational Tools tab in table view */
          <ComputationalToolResultsTable
            results={data?.results || []}
            loading={!router.isReady || isLoading}
            visibleColumnIds={ctVisibleColumnIds}
            columnOrder={ctColumnOrder}
            currentSort={sort}
            onSortChange={handleSortChange}
            referrerPath={router.asPath}
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
              <List.Root as='ul'>
                {Array(numCards)
                  .fill(null)
                  .map((_, idx) => {
                    return (
                      <List.Item key={data?.results?.[idx]._id || idx} w='100%'>
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
