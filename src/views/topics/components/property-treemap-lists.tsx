import React from 'react';
import { Box, Flex, HStack } from '@chakra-ui/react';
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
import { BrushableListChart } from '../visualizations/brushable-list-chart';
import { getSearchResultsRoute } from '../helpers';
import {
  getMetadataColor,
  getMetadataTheme,
} from 'src/components/icon/helpers';
import { theme } from 'src/theme';

interface DataTypesProps {
  query: TopicPageProps['attributes']['query'];
  topic: string;
}

const facets = [
  {
    label: 'Pathogen',
    value: 'infectiousAgent.name',
    fill: theme.colors[getMetadataTheme('infectiousAgent')][300] as string,
  },
  {
    label: 'Measurement Technique',
    value: 'measurementTechnique.name',
    fill: theme.colors[getMetadataTheme('measurementTechnique')][300] as string,
  },
  {
    label: 'Health Condition',
    value: 'healthCondition.name',
    fill: theme.colors[getMetadataTheme('healthCondition')][300] as string,
  },
];

export const PropertyTreemapLists = ({ query, topic }: DataTypesProps) => {
  // Fetch data types for query.
  const params = {
    q: query.q,
    facet_size: 100,
    facets: facets.map(facet => facet.value).join(','),
    size: 0,
  };

  const { data, isLoading, error } = useQuery<
    FetchSearchResultsResponse | undefined,
    Error,
    { label: string; fill: string; value: string; terms: FacetTerm[] }[]
  >({
    queryKey: ['search-results', params],
    queryFn: async () => await fetchSearchResults(params),
    select: data => {
      if (!data) return [{ fill: '', label: '', value: '', terms: [] }];
      // Get the terms for each facet.
      const terms = facets.map(facet => {
        const facetTerms = data.facets?.[facet.value]?.terms || [];
        return {
          ...facet,
          terms: facetTerms,
        };
      });

      return terms;
    },
    enabled: !!query.q,
  });
  return (
    <Flex>
      <Flex flex={3} flexDirection='column'>
        <ChartWrapper
          title={`Resources mentioning ${topic} also mentioned the following:`}
          description={
            'Click on rectangle to view all related results within the portal.'
          }
          error={error}
          isLoading={isLoading}
          skeletonProps={{
            minHeight: '200px',
            width: '100%',
          }}
        >
          {/* Add toggle for charts */}
          {/* Add charts */}
          <HStack mt={4} alignItems='flex-start' spacing={6} flexWrap='wrap'>
            {data?.map(({ terms, ...facet }) => {
              return (
                <BrushableListChart
                  key={facet.value}
                  facet={facet}
                  data={terms}
                  getSearchRoute={(term: string) => {
                    return getSearchResultsRoute({
                      facet: facet.value,
                      querystring: query.q,
                      term,
                    });
                  }}
                />
              );
            })}
          </HStack>
        </ChartWrapper>
      </Flex>
    </Flex>
  );
};
