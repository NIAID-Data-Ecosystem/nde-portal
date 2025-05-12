import React from 'react';
import NextLink from 'next/link';
import { Box, Flex } from '@chakra-ui/react';
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
import { MarkdownContent } from '../layouts/markdown-content';
import DISEASE_PAGE_COPY from '../disease-page.json';

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
    <Flex width='100%' flexDirection='column' minWidth={250}>
      <ChartWrapper
        title={DISEASE_PAGE_COPY['charts']['types']['title']}
        description={
          <MarkdownContent
            template={DISEASE_PAGE_COPY['charts']['types']['description']}
            replacements={{
              topic,
            }}
          />
        }
        error={error}
        isLoading={isLoading || isPlaceholderData}
        skeletonProps={{
          minHeight: '200px',
          width: '100%',
        }}
      >
        <Flex
          flexWrap='wrap'
          justifyContent='center'
          width={{ base: '100%', lg: 'unset' }}
        >
          <Box
            flex={2}
            minWidth={{ base: 'unset', lg: 350 }}
            width={{ base: '100%', lg: 'unset' }}
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
          </Box>

          {/* legend */}
          <Box flex={1} minWidth={250}>
            <LegendContainer tableHeader='Data Types and Resources'>
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
                          {formatResourceTypeForDisplay(
                            term as APIResourceType,
                          )}
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
      </ChartWrapper>
    </Flex>
  );
};
