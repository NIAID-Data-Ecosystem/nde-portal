import React from 'react';
import { Box, Flex } from '@chakra-ui/react';
import NextLink from 'next/link';
import { Link } from 'src/components/link';
import { TopicPageProps } from '../types';
import { fetchSearchResults } from 'src/utils/api';
import { useQuery } from '@tanstack/react-query';
import { FacetTerm, FetchSearchResultsResponse } from 'src/utils/api/types';
import { DonutChart } from '../visualizations/donut-chart';
import { scaleOrdinal } from '@visx/scale';
import {
  APIResourceType,
  formatResourceTypeForDisplay,
} from 'src/utils/formatting/formatResourceType';
import { LegendContainer, LegendItem } from './legend';
import { queryFilterObject2String } from 'src/views/search-results-page/helpers';
import { UrlObject } from 'url';
import { ChartWrapper } from '../layouts/chart-wrapper';

interface DataTypesProps {
  query: TopicPageProps['attributes']['query'];
  topic: string;
}

// Color scale for data types.
const getFillColor = scaleOrdinal({
  domain: ['Dataset', 'ComputationalTool', 'ResourceCatalog'],
  range: ['#e8c543', '#ff8359', '#6e95fc'],
});

// Helper function to generate a URL object for search results.
const getSearchResultsRoute = ({
  querystring,
  facet,
  term,
}: {
  facet: string;
  querystring: string;
  term: string;
}): UrlObject => {
  return {
    pathname: `/search`,
    query: {
      q: querystring,
      filters: queryFilterObject2String({
        [facet]: [term],
      }),
    },
  };
};

export const DataTypes = ({ query, topic }: DataTypesProps) => {
  // Fetch data types for query.
  const params = {
    q: query.q,
    facet_size: query.facet_size,
    facets: '@type',
    size: 0,
  };
  const { data, isLoading, error } = useQuery<
    FetchSearchResultsResponse | undefined,
    Error,
    FacetTerm[]
  >({
    queryKey: ['search-results', params],
    queryFn: async () => await fetchSearchResults(params),
    select: data => {
      if (!data) return [];
      return data.facets['@type'].terms || [];
    },
    enabled: !!query.q,
  });

  return (
    <Flex>
      <Flex flex={3} flexDirection='column'>
        <ChartWrapper
          title='Data Types'
          description={
            <>
              An overview of resource types retrieved from a search on{' '}
              <Link href={`/search?q=${query.q}`}>{topic}</Link>.
            </>
          }
          error={error}
          isLoading={isLoading}
          skeletonProps={{
            minHeight: '200px',
            width: '100%',
          }}
        >
          {data && (
            <DonutChart
              title='Resource Type Distribution'
              description=' A donut chart showing the distribution of different resource types
            by count. The chart is interactive and allows users to click on each segment to
            view more details about that resource type.'
              width={200}
              height={200}
              donutThickness={20}
              data={data}
              getFillColor={getFillColor}
              labelStyles={{
                fill: '#2f2f2f',
                transformLabel: term =>
                  formatResourceTypeForDisplay(term as APIResourceType),
              }}
              getRoute={term => {
                return getSearchResultsRoute({
                  facet: params.facets,
                  querystring: query.q,
                  term,
                });
              }}
            />
          )}
        </ChartWrapper>
      </Flex>
      <Box flex={1} p={4}>
        <LegendContainer>
          {data?.map(({ term, count }) => {
            return (
              <LegendItem
                key={term}
                count={count}
                swatchBg={getFillColor(term)}
              >
                <NextLink
                  href={getSearchResultsRoute({
                    facet: params.facets,
                    querystring: query.q,
                    term: term as string,
                  })}
                  passHref
                >
                  <Link as='p'>
                    {formatResourceTypeForDisplay(term as APIResourceType)}
                  </Link>
                </NextLink>
              </LegendItem>
            );
          })}
        </LegendContainer>
      </Box>
    </Flex>
  );
};
