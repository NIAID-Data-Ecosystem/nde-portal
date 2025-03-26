import React from 'react';
import { Box, Text } from '@chakra-ui/react';
import { SectionTitle } from '../layouts/section';
import { Link } from 'src/components/link';
import { TopicPageProps } from '../types';
import { fetchSearchResults } from 'src/utils/api';
import { useQuery } from '@tanstack/react-query';
import { FacetTerm, FetchSearchResultsResponse } from 'src/utils/api/types';
import { DonutChart } from '../visualizations/other-donut-chart';
import { scaleOrdinal } from '@visx/scale';
import {
  APIResourceType,
  formatResourceTypeForDisplay,
} from 'src/utils/formatting/formatResourceType';

interface DataTypesChartProps {
  query: TopicPageProps['attributes']['query'];
  topic: string;
}

const getFillColor = scaleOrdinal({
  domain: ['Dataset', 'ComputationalTool', 'ResourceCatalog'],
  range: ['#e8c543', '#ff8359', '#6e95fc'],
});

export const DataTypesChart = ({ query, topic }: DataTypesChartProps) => {
  // Fetch data types for query.
  const params = {
    q: query.q,
    facet_size: query.facet_size,
    facets: '@type',
    size: 0,
  };
  const { data, isLoading } = useQuery<
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
    <Box maxWidth='50%'>
      <SectionTitle as='h4'>Data Types</SectionTitle>
      <Text>
        An overview of resource types retrieved from a search on{' '}
        <Link href={`/search?q=${query.q}`}>{topic}</Link>.
      </Text>

      {/* Donut Chart */}
      {data && (
        <DonutChart
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
        />
      )}
      {/* TO DO: Add Error state */}
      {/* TO DO: Add Loading state */}
    </Box>
  );
};
