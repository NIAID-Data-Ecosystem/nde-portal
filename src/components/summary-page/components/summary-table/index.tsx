import React, { useCallback, useEffect, useState } from 'react';
import type { NextPage } from 'next';
import { PageContainer, PageContent } from 'src/components/page-container';
import { useQueries, useQuery } from 'react-query';
import { fetchSearchResults } from 'src/utils/api';
import {
  Box,
  Center,
  Divider,
  Flex,
  Heading,
  Skeleton,
  Spinner,
} from 'nde-design-system';
import { Error, ErrorCTA } from 'src/components/error';
import { queryFilterObject2String } from 'src/components/search-results-page/components/filters/helpers';
import {
  FetchSearchResultsResponse,
  PropertyNameWithURL,
} from 'src/utils/api/types';
import LoadingSpinner from 'src/components/loading';
import { useRouter } from 'next/router';
import TableData from './table-data';

export const SummaryTable = ({ sample_query }) => {
  const [filters, setFilters] = useState<{
    '@type': string[];
    'funding.identifier': string[];
    'measurementTechnique.name': string[];
    'includedInDataCatalog.name': string[];
    'infectiousDisease.name': string[];
  }>({
    '@type': [],
    'funding.identifier': [],
    'measurementTechnique.name': [],
    'includedInDataCatalog.name': [],
    'infectiousDisease.name': [],
  });

  const router = useRouter();
  // EXAMPLE  query for trying
  let queryString =
    sample_query['funding.identifier'] &&
    queryFilterObject2String({
      'funding.identifier': sample_query['funding.identifier'],
    });

  const DEFAULT_SIZE = 1000;
  const { data, isLoading, error } = useQuery<
    FetchSearchResultsResponse | undefined,
    Error
  >(
    [
      'search-results',
      {
        q: queryString,
        size: DEFAULT_SIZE,
        filters,
      },
    ],
    () => {
      if (typeof queryString !== 'string' && !queryString) {
        return;
      }

      const filter_string = queryFilterObject2String(filters);

      return fetchSearchResults({
        q: filter_string
          ? `${
              queryString === '__all__' ? '' : `${queryString} AND `
            }${filter_string}`
          : `${queryString}`,
        size: `${DEFAULT_SIZE}`,
        from: `0`,
      });
    },
    { refetchOnWindowFocus: false },
  );

  return (
    <PageContent>
      <TableData isLoading={isLoading} data={data?.results} />
    </PageContent>
  );
};
