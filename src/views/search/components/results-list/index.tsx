import React, { useMemo } from 'react';
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

const RESULT_FIELDS = [
  '_meta',
  '@type',
  'alternateName',
  'applicationCategory',
  'author',
  'availableOnDevice',
  'conditionsOfAccess',
  'date',
  'description',
  'doi',
  'featureList',
  'funding',
  'healthCondition',
  'includedInDataCatalog',
  'infectiousAgent',
  'input',
  'isAccessibleForFree',
  'license',
  'measurementTechnique',
  'name',
  'operatingSystem',
  'output',
  'programmingLanguage',
  'sdPublisher',
  'softwareHelp',
  'softwareRequirements',
  'softwareVersion',
  'species',
  'topicCategory',
  'url',
  'usageInfo',
  'variableMeasured',
];

const SAMPLE_EXTRA_FIELDS = [
  'identifier',
  'alternateIdentifier',
  'name',
  'description',
  'sampleType',
  'sex',
  'anatomicalStructure',
  'anatomicalSystem',
  'sampleAvailability',
  'sampleQuantity',
  'developmentalStage',
  'associatedGenotype',
  'cellType',
  'locationOfOrigin',
  'itemLocation',
];

/*
[COMPONENT INFO]:
 Search results pages displays the list of records returned by a search.
 Contains pagination and search results cards. When the active tab is the Samples tab ('s'), results are rendered as a table instead of cards.
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

  // For the Samples tab, use extra fields for the table columns.
  const isSamplesTab = id === 's';
  const fields = isSamplesTab
    ? [...RESULT_FIELDS, ...SAMPLE_EXTRA_FIELDS]
    : RESULT_FIELDS;

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
      fields,
    },
    {
      // Only fetch data when the router is ready and the active tab is selected.
      // This prevents unnecessary data fetching when switching tabs.
      enabled: router.isReady && id === activeTabId,
      select: data => {
        // only return selected types if they are provided
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
    },
  );

  const { data, isLoading, isRefetching, error } = response;

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

  return (
    <>
      <VStack borderRadius='semi' bg='white' px={4} py={2}>
        {/* Toolbar controls: Sort, size, download metadata, and use metadata score (optional) */}
        <SearchResultsToolbar id={id} params={params} />

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

        {/* Samples tab: render a scrollable table instead of cards */}
        {isSamplesTab ? (
          <SampleResultsTable
            results={data?.results || []}
            isLoading={!router.isReady || isLoading}
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
