// @ts-nocheck
// [TO DO]: type d3 to get it to work with typescript

import React from 'react';
import * as d3 from 'd3';
import {
  Box,
  Button,
  Heading,
  ListItem,
  Select,
  Text,
  UnorderedList,
} from 'nde-design-system';
import { SelectedFilterType } from 'src/components/summary-page';
import { FetchSearchResultsResponse } from 'src/utils/api/types';
import { useQuery } from 'react-query';
import { queryFilterObject2String } from 'src/components/filter';
import { fetchSearchResults } from 'src/utils/api';
import LoadingSpinner from 'src/components/loading';
import { Error } from 'src/components/error';
import { useRouter } from 'next/router';

interface ChartTemplateProps {
  // Stringified query.
  queryString: string;
  // Filters object
  filters: SelectedFilterType;
  // HandlerFn for updating filters
  updateFilters: (updatedFilters: SelectedFilterType) => void;
}

export const ChartTemplate: React.FC<ChartTemplateProps> = ({
  queryString,
  filters,
  updateFilters,
}) => {
  /*
  State for all grant names. Note: We want don't want this state to update with the filters so that the dropdown is always complete with all the options.
  */
  const router = useRouter();

  // All the facets that you need.
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

  // This query function is interchangeable for both queries we have below.
  const queryFn = (queryString: string, filters?: {}) => {
    if (typeof queryString !== 'string' && !queryString) {
      return;
    }
    const filter_string = filters ? queryFilterObject2String(filters) : null;

    return fetchSearchResults({
      q: filter_string
        ? `${
            queryString === '__all__' ? '' : `${queryString} AND `
          }${filter_string}`
        : `${queryString}`,
      facet_size: 1000,
      facets: facets.join(','),
    });
  };

  /*
  Get Grant names. We might extract this query to "pages/summary.tsx" and just get all the facets we need that are unchanging in one spot. I use a similar query for Filters and will probably need the same for my viz.
  */
  const {
    data: grantNames,
    isLoading: grantNamesIsLoading,
    error: grantNamesError,
  } = useQuery<FetchSearchResultsResponse | undefined, Error>(
    [
      'search-results',
      {
        q: queryString,
        facets,
      },
    ],
    () => queryFn(queryString),
    {
      refetchOnWindowFocus: false,
      select: d => {
        // This is where we can transform the data received and shape it.
        const grants = d?.facets?.['funding.funder.name'].terms;
        if (grants) {
          return grants;
        }
        return [];
      },
    },
  );

  /*
  Get all the data you wanted.
  */
  const {
    data: responseData,
    isLoading: responseDataIsLoading,
    error: responseDataError,
  } = useQuery<FetchSearchResultsResponse | undefined, Error>(
    [
      'search-results',
      {
        q: queryString,
        // note that [filters] is now a dependency
        filters,
        facets,
      },
    ],
    // note that [filters] is now added to the query function.
    () => queryFn(queryString, filters),
    {
      refetchOnWindowFocus: false,
      select: d => {
        // This is where we can transform the data received and shape it.
        return {
          ...d,
          total: d['total'],
          '@type': d['facets']['@type']['terms'],
          dateModified: d['facets']['dateModified']['terms'],
          'includedInDataCatalog.name':
            d['facets']['includedInDataCatalog.name']['terms'],
          'infectiousAgent.name': d['facets']['infectiousAgent.name']['terms'],
          'infectiousDisease.name':
            d['facets']['infectiousDisease.name']['terms'],
          'measurementTechnique.name':
            d['facets']['measurementTechnique.name']['terms'],
          date: d['facets']['date']['terms'],
        };
      },
    },
  );

  // Error state
  if (responseDataError || grantNamesError) {
    return (
      <Error
        message="It's possible that the server is experiencing some issues."
        bg='transparent'
        color='#fff'
        minH='unset'
      >
        {/* reload page */}
        <Button flex={1} onClick={() => router.reload()} variant='solid'>
          Retry
        </Button>
      </Error>
    );
  }

  return (
    <div id='chart-template'>
      {grantNamesIsLoading && (
        <LoadingSpinner isLoading={grantNamesIsLoading}></LoadingSpinner>
      )}
      {grantNames && (
        <Box color='#fff'>
          Grants
          <Select
            bg='#fff'
            color='black'
            placeholder='Filter by Grant'
            /*
            The user could select many grants so Select isn't the best but just to give an example. */
            value={filters['funding.funder.name'][0]}
            onChange={e => {
              e.currentTarget.value &&
                updateFilters({
                  'funding.funder.name': [e.currentTarget.value],
                });
            }}
          >
            {grantNames?.map(grant => {
              return (
                <option key={grant.term} value={grant.term}>
                  {grant.term}
                </option>
              );
            })}
          </Select>
        </Box>
      )}

      <Box w='100%' m={4}>
        {responseDataIsLoading && (
          <LoadingSpinner isLoading={responseDataIsLoading}></LoadingSpinner>
        )}
        {responseData && (
          <>
            {/* Total Resources */}
            <Text color='#fff'>{responseData.total} items</Text>

            {/* Measurement techniques */}
            <Box my={2}>
              <Heading as='h2' size='h6' color='#fff'>
                Measurement Techniques (
                {responseData['measurementTechnique.name'].length})
              </Heading>
              {responseData['measurementTechnique.name'].length > 0 ? (
                <UnorderedList
                  ml={0}
                  maxH={'300px'}
                  overflow='auto'
                  color='#fff'
                  border='2px solid'
                >
                  {responseData['measurementTechnique.name'].map(
                    (measurementTechnique, i) => (
                      <ListItem
                        key={measurementTechnique.term}
                        bg={i % 2 ? 'tertiary.900' : 'transparent'}
                        p={2}
                      >
                        {measurementTechnique.term}
                      </ListItem>
                    ),
                  )}
                </UnorderedList>
              ) : (
                <Text color='white'>
                  No measurement techniques available for selection.
                </Text>
              )}
            </Box>

            {/* Infectious Agent */}
            <Box my={2}>
              <Heading as='h2' size='h6' color='#fff'>
                Infectious Agent/ Pathogen (
                {responseData['infectiousAgent.name'].length})
              </Heading>
              {responseData['infectiousAgent.name'].length > 0 ? (
                <UnorderedList
                  ml={0}
                  maxH={'300px'}
                  overflow='auto'
                  color='#fff'
                  border='2px solid'
                >
                  {responseData['infectiousAgent.name'].map(
                    (infectiousAgent, i) => (
                      <ListItem
                        key={infectiousAgent.term}
                        bg={i % 2 ? 'tertiary.900' : 'transparent'}
                        p={2}
                      >
                        {infectiousAgent.term}
                      </ListItem>
                    ),
                  )}
                </UnorderedList>
              ) : (
                <Text color='white'>
                  No infectious agents available for selection.
                </Text>
              )}
            </Box>
          </>
        )}
      </Box>
    </div>
  );
};
