import React, { useMemo } from 'react';
import { useRouter } from 'next/router';
import { ListItem, UnorderedList } from '@chakra-ui/react';
import Card from './components/card';
import { ErrorMessage } from './components/error';
import { useSearchQueryParams } from '../../hooks/useSearchQueryParams';
import { useSearchResultsData } from '../../hooks/useSearchResultsData';
import { EmptyState } from './components/empty';

/*
[COMPONENT INFO]:
 Search results pages displays the list of records returned by a search.
 Contains pagination and search results cards.
*/

const SearchResults = ({ types }: { types: string[] }) => {
  const router = useRouter();
  // Selected tab index is stored in context to sync with other components.
  const queryParams = useSearchQueryParams();

  const { response, params } = useSearchResultsData({
    ...queryParams,
    filters: {
      ...queryParams.filters,
      '@type': types,
    },
    fields: [
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
    ],
  });

  const { data, isLoading, error } = response;

  const numCards = useMemo(
    () =>
      Math.min(
        isLoading ? queryParams.size : data?.results?.length || 0,
        queryParams.size,
      ),
    [isLoading, data?.results?.length, queryParams.size],
  );

  if (error) {
    return (
      <ErrorMessage
        error={error}
        querystring={params.q === '__all__' ? '' : params.q}
      />
    );
  }

  if (!isLoading && (!data || data?.results?.length === 0)) {
    return <EmptyState />;
  }

  return (
    <>
      {numCards > 0 && (
        <UnorderedList
          className='search-results-cards'
          ml={0}
          flex={3}
          w='100%'
        >
          {Array(numCards)
            .fill(null)
            .map((_, idx) => {
              return (
                <ListItem key={idx} my={4} mb={8}>
                  <Card
                    isLoading={!router.isReady || isLoading}
                    data={data?.results[idx]}
                    referrerPath={router.asPath}
                    querystring={queryParams.q}
                  />
                </ListItem>
              );
            })}
        </UnorderedList>
      )}
    </>
  );
};

export default SearchResults;
