import React from 'react';
import NextLink from 'next/link';
import { Box, Flex, Text } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'src/components/link';
import { fetchSearchResults } from 'src/utils/api';
import { FacetTerm, FetchSearchResultsResponse } from 'src/utils/api/types';
import {
  APIResourceType,
  formatResourceTypeForDisplay,
} from 'src/utils/formatting/formatResourceType';
import {
  getFillColor,
  getSearchResultsRoute,
} from 'src/views/diseases/helpers';
import { TopicQueryProps } from '../../types';
import { ChartWrapper } from '../layouts/chart-wrapper';
import { DonutChart } from '../visualizations/donut-chart';
import { LegendContainer, LegendItem } from './legend';

export const DataTypes = ({ query, topic }: TopicQueryProps) => {
  // Fetch data types for query.
  const params = {
    ...query,
    q: query.q,
    facet_size: query.facet_size,
    facets: '@type',
    size: 0,
  };
  const { data, isLoading, isPlaceholderData, error } = useQuery<
    FetchSearchResultsResponse | undefined,
    Error,
    { terms: FacetTerm[]; total: number }
  >({
    queryKey: ['search-results', params],
    queryFn: async () => await fetchSearchResults(params),
    select: data => {
      if (!data) return { terms: [], total: 0 };
      return {
        terms: data.facets?.['@type']?.terms || [],
        total: data?.total || 0,
      };
    },
    placeholderData: () => {
      return {
        results: [],
        total: 0,
        facets: {
          '@type': {
            _type: 'terms',
            terms: [
              {
                count: 0,
                term: 'Dataset',
              },
              {
                count: 0,
                term: 'ComputationalTool',
              },
            ],
            other: 0,
            missing: 0,
            total: 0,
          },
        },
      };
    },
    enabled: !!query.q,
  });

  return (
    <Flex flexWrap='wrap' width='100%'>
      <Flex flex={3} flexDirection='column' minWidth={250}>
        <ChartWrapper
          title='Data Types'
          description={
            <Text>
              An overview of resource types retrieved from a search on{' '}
              <NextLink
                passHref
                href={getSearchResultsRoute({
                  query: params,
                  facet: params.facets,
                })}
                legacyBehavior
              >
                <Link>{topic}</Link>
              </NextLink>
              .
            </Text>
          }
          error={error}
          isLoading={isLoading || isPlaceholderData}
          skeletonProps={{
            minHeight: '200px',
            width: '100%',
          }}
        >
          {data?.terms && (
            <DonutChart
              title='Resource Type Distribution'
              description=' A donut chart showing the distribution of different resource types
            by count. The chart is interactive and allows users to click on each segment to
            view more details about that resource type.'
              width={400}
              height={280}
              donutThickness={20}
              data={data.terms}
              getFillColor={getFillColor}
              labelStyles={{
                fill: '#2f2f2f',
                transformLabel: term =>
                  formatResourceTypeForDisplay(term as APIResourceType),
              }}
              getRoute={term => {
                return getSearchResultsRoute({
                  query: params,
                  facet: params.facets,
                  term,
                });
              }}
            />
          )}
        </ChartWrapper>
      </Flex>
      <Box flex={1} p={4} minWidth={250}>
        <LegendContainer>
          {data?.terms
            ?.sort((a, b) => {
              return b.count - a.count;
            })
            .map(({ term, count }) => {
              return (
                <LegendItem
                  key={term}
                  count={count}
                  isLoading={isLoading || isPlaceholderData}
                  swatchBg={getFillColor(term)}
                >
                  <NextLink
                    href={getSearchResultsRoute({
                      query: params,
                      facet: params.facets,
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
          <LegendItem
            key='total'
            count={data?.total}
            isLoading={isLoading || isPlaceholderData}
          >
            <NextLink
              href={getSearchResultsRoute({
                query: params,
              })}
              passHref
            >
              <Link as='p'>Total</Link>
            </NextLink>
          </LegendItem>
        </LegendContainer>
      </Box>
    </Flex>
  );
};
