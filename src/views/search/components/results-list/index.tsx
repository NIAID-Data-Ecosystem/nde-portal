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
import {
  SampleResultsTable,
  ALL_SAMPLE_COLUMNS,
} from './components/sample-results-table';
import {
  DataCollectionResultsTable,
  ALL_DATA_COLLECTION_COLUMNS,
} from './components/data-collection-results-table';
import { useSearchResultsFetchedContext } from '../../context/search-results-fetched-context';
import {
  CustomizeColumnsPopover as SampleCustomizeColumnsPopover,
  DEFAULT_VISIBLE_COLUMN_IDS as SAMPLE_DEFAULT_VISIBLE_COLUMN_IDS,
  CUSTOM_VISIBLE_COLUMNS_STORAGE_KEY as SAMPLE_CUSTOM_VISIBLE_COLUMNS_STORAGE_KEY,
  CUSTOM_COLUMN_ORDER_STORAGE_KEY as SAMPLE_CUSTOM_COLUMN_ORDER_STORAGE_KEY,
} from './components/sample-results-table/components/CustomizeColumnsPopover';
import {
  CustomizeColumnsPopover as DataCollectionCustomizeColumnsPopover,
  DEFAULT_VISIBLE_COLUMN_IDS as DC_DEFAULT_VISIBLE_COLUMN_IDS,
  CUSTOM_VISIBLE_COLUMNS_STORAGE_KEY as DC_CUSTOM_VISIBLE_COLUMNS_STORAGE_KEY,
  CUSTOM_COLUMN_ORDER_STORAGE_KEY as DC_CUSTOM_COLUMN_ORDER_STORAGE_KEY,
} from './components/data-collection-results-table/components/CustomizeColumnsPopover';
import { BIOSAMPLE_EXTRA_FILTER } from '../../hooks/useBioSampleAggregation';
import { FetchSearchResultsResponse } from 'src/utils/api/types';
import {
  RESULT_FIELDS,
  SAMPLE_FIELDS,
  DATA_COLLECTION_FIELDS,
} from '../../config/fields';

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

// Build the ColumnConfig list expected by each CustomizeColumnsPopover.
const SAMPLE_COLUMN_CONFIGS = ALL_SAMPLE_COLUMNS.map(col => ({
  id: col.id,
  title: col.title,
}));

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

  // For Samples and DataCollection tabs, use extra fields for the table columns.
  const isSamplesTab = id === 's';
  const isDataCollectionTab = id === 'dc';

  // Each tab type uses a minimal, table-specific field list rather than the
  // shared RESULT_FIELDS base (which carries many card-only fields that the
  // tables never render).
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
    isDataCollectionTab
      ? getInitialDataCollectionVisibleColumnIds()
      : DC_DEFAULT_VISIBLE_COLUMN_IDS,
  );
  const [dcColumnOrder, setDcColumnOrder] = useState<string[]>(() =>
    isDataCollectionTab
      ? getInitialDataCollectionColumnOrder()
      : ALL_DATA_COLLECTION_COLUMNS.map(c => c.id),
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
        {/* Toolbar controls: Sort, size, download metadata, and optional extra actions. For Samples and DataCollections tab the "Customize Columns" button is injected via the extraActions prop so it appears to the left of Download Metadata. */}
        <SearchResultsToolbar
          id={id}
          params={params}
          extraActions={
            isSamplesTab ? (
              <SampleCustomizeColumnsPopover
                columnsList={SAMPLE_COLUMN_CONFIGS}
                onVisibleColumnsChange={setVisibleColumnIds}
                onColumnOrderChange={setColumnOrder}
              />
            ) : isDataCollectionTab ? (
              <DataCollectionCustomizeColumnsPopover
                columnsList={DATA_COLLECTION_COLUMN_CONFIGS}
                onVisibleColumnsChange={setDcVisibleColumnIds}
                onColumnOrderChange={setDcColumnOrder}
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
            visibleColumnIds={dcVisibleColumnIds}
            columnOrder={dcColumnOrder}
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
