import React from 'react';
import { useRouter } from 'next/router';
import { Flex, Button, Heading } from 'nde-design-system';
import { useQuery } from 'react-query';
import { fetchSearchResults } from 'src/utils/api';
import { FetchSearchResultsResponse } from 'src/utils/api/types';
import { Error } from 'src/components/error';
import LoadingSpinner from 'src/components/loading';
import { useHasMounted } from 'src/hooks/useHasMounted';
import { SelectedFilterType } from '../../../hooks';
import { Nodes as NetworkNodes } from './components/nodes';

interface NetworkProps {
  // Stringified query.
  queryString: string;
  // Filters object
  filters: SelectedFilterType;
  // fn for updating filter selection
  updateFilters: (updatedFilters: SelectedFilterType) => void;
}

export const Network: React.FC<NetworkProps> = ({
  queryString,
  filters,
  updateFilters,
}) => {
  // Check if component has mounted and router has needed info.
  const hasMounted = useHasMounted();
  const router = useRouter();

  /****
   * Fetch Data
   */

  // All the facets that you need. Potentially add select options in the future so users can view different groups together.
  const facets = [
    'includedInDataCatalog.name',
    'infectiousAgent.name',
    '@type',
    'dateModified',
    'infectiousDisease.name',
    'measurementTechnique.name',
    'date',
    'funding.funder.name',
  ];

  const primary_group = 'infectiousAgent.name';
  const secondary_group = 'measurementTechnique.name';
  const queryFn = (queryString: string) => {
    if (typeof queryString !== 'string' && !queryString) {
      return;
    }
    // const filter_string = filters ? queryFilterObject2String(filters) : null;

    return fetchSearchResults({
      q: queryString,
      facet_size: 1000,
      // query facets aggregated by groups.
      facets: `${primary_group}(${secondary_group})`,
      size: 10,
    });
  };

  // Get data. Possible to extract out in the future.
  const {
    data: APIdata,
    isLoading,
    error,
  } = useQuery<FetchSearchResultsResponse | undefined, Error>(
    [
      'search-results',
      {
        q: queryString,
        facets: `${primary_group}(${secondary_group})`,
      },
    ],
    () => queryFn(queryString),
    {
      refetchOnWindowFocus: false,
    },
  );

  const data = APIdata?.facets[primary_group].terms || [];

  const formatted_data = data.map(facet => {
    const group_one_data = {
      id: facet.term,
      name: facet.term,
      count: facet.count, //number of datasets for group term.
      type: primary_group,
    };

    let group_two_data: {
      id: string;
      name: string;
      count: number;
      type: string;
      primaryGroup?: string;
    }[] = [];

    if (
      typeof facet[secondary_group] !== 'string' &&
      typeof facet[secondary_group] !== 'number' &&
      facet[secondary_group]?.terms
    ) {
      group_two_data = facet[secondary_group].terms.map(d => {
        return {
          id: `${facet.term}-${d.term}`,
          name: d.term,
          count: d.count,
          type: secondary_group,
          primaryGroup: facet.term,
        };
      });
    }

    return { name: facet.term, children: [group_one_data, ...group_two_data] };
  });

  // const primary_popular = getMostPopularCount(data, 5);
  if (error) {
    return (
      <Error
        message="It's possible that the server is experiencing some issues."
        bg='whiteAlpha.100'
        color='status.error'
        minH='unset'
      >
        {/* reload page */}
        <Button
          flex={1}
          onClick={() => router.reload()}
          variant='solid'
          colorScheme='negative'
        >
          Retry
        </Button>
      </Error>
    );
  }

  if (isLoading) {
    return <LoadingSpinner isLoading={isLoading} />;
  }

  return data && data.length > 0 ? (
    <Flex justifyContent='center' p={6}>
      <NetworkNodes
        keys={[primary_group, secondary_group]}
        data={formatted_data}
        filters={filters}
        updateFilters={updateFilters}
      />
    </Flex>
  ) : (
    <></>
  );
};
