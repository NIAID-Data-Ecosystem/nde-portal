import React, { useMemo } from 'react';
import { useRouter } from 'next/router';
import { Flex, ListItem, UnorderedList, VStack } from '@chakra-ui/react';
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
import { SortDropdown } from './components/sort';
import { DownloadMetadata } from 'src/components/download-metadata';
import { defaultQuery } from '../../config/defaultQuery';

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
  const { from, size } = getPagination(id);

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

  const sort = '_score';

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
      {/* Add Pagination */}
      <VStack borderRadius='semi' boxShadow='base' bg='white' px={4} py={2}>
        <Flex
          borderBottom={{ base: '1px solid' }}
          borderColor={{ base: 'page.alt' }}
          flexDirection={{ base: 'column-reverse', md: 'row' }}
          alignItems={{ base: 'unset', md: 'center' }}
          pb={2}
        >
          <SortDropdown
            sortOrder={sort}
            handleSortOrder={sort => {
              updateRoute(router, {
                sort,
                from: defaultQuery.from,
              });
            }}
            selectedPerPage={size}
            handleSelectedPerPage={newSize => {
              const update = { size: newSize, from: 1 };
              // Update pagination state for the current tab.
              setPagination(id, update);
              updateRoute(router, update);
            }}
          />
          <DownloadMetadata
            flex={1}
            pb={{ base: 2, md: 0 }}
            exportFileName={`nde-results-${params.q.replaceAll(' ', '_')}`}
            params={params}
            buttonProps={{ variant: 'outline' }}
          >
            Download Metadata
          </DownloadMetadata>
        </Flex>
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
      </VStack>
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
    </>
  );
};

export default SearchResults;
