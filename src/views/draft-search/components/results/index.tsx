import React, { useMemo } from 'react';
import { useRouter } from 'next/router';
import { ListItem, UnorderedList, VStack } from '@chakra-ui/react';
import Card from './components/card';
import { ErrorMessage } from './components/error';
import { useSearchQueryFromURL } from '../../hooks/useSearchQueryFromURL';
import { useSearchResultsData } from '../../hooks/useSearchResultsData';
import { EmptyState } from './components/empty';
import { Pagination } from './components/pagination';
import { TabType } from '../../types';
import { useSearchContext } from '../../context/search-context';
import { usePaginationContext } from '../../context/pagination-context';
import { updateRoute } from '../../utils/update-route';
import { SearchResultsToolbar } from './components/toolbar';

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
/*
[COMPONENT INFO]:
 Search results pages displays the list of records returned by a search.
 Contains pagination and search results cards.
*/

const SearchResults = ({
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
  const { selectedIndex } = useSearchContext();
  const activeTabId = tabs[selectedIndex].id;

  // Retrieve pagination state for the current tab.
  // This allows each tab to fetch the correct page of results independently.
  const { getPagination, setPagination } = usePaginationContext();
  const { from, size, sort } = getPagination(id);

  // Selected tab index is stored in context to sync with other components.
  const urlQueryParams = useSearchQueryFromURL();

  const { response, params } = useSearchResultsData(
    {
      ...urlQueryParams,
      from,
      size,
      filters: {
        ...urlQueryParams.filters,
        '@type': types,
      },
      fields: RESULT_FIELDS,
    },
    {
      // Only fetch data when the router is ready and the active tab is selected.
      // This prevents unnecessary data fetching when switching tabs.
      enabled: router.isReady && id === activeTabId,
    },
  );

  const { data, isLoading, error } = response;

  const numCards = useMemo(
    () =>
      Math.min(
        isLoading ? urlQueryParams.size : data?.results?.length || 0,
        urlQueryParams.size,
      ),
    [isLoading, data?.results?.length, urlQueryParams.size],
  );

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
          handleSelectedPage={newFrom => {
            const update = { from: newFrom };
            setPagination(id, update);
            updateRoute(router, update);
            return;
          }}
          isLoading={isLoading}
          total={data?.total || 0}
        />
        {/* Search results cards */}
        {numCards > 0 && (
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
        )}
        {/* Pagination controls */}
        <Pagination
          id='pagination-bottom'
          ariaLabel='Paginate through resources.'
          selectedPage={from}
          selectedPerPage={size}
          handleSelectedPage={newFrom => {
            const update = { from: newFrom };
            setPagination(id, update);
            updateRoute(router, update);
            return;
          }}
          isLoading={isLoading}
          total={data?.total || 0}
        />
      </VStack>
    </>
  );
};

export default SearchResults;
