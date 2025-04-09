import React from 'react';
import { Box, Flex, HStack } from '@chakra-ui/react';
import { FacetProps, TopicPageProps } from '../types';
import { fetchSearchResults } from 'src/utils/api';
import { useQuery } from '@tanstack/react-query';
import { FacetTerm, FetchSearchResultsResponse } from 'src/utils/api/types';
import { ChartWrapper } from '../layouts/chart-wrapper';
import { BrushableListChart } from '../visualizations/brushable-list-chart';
import { getSearchResultsRoute } from '../helpers';
import { getMetadataTheme } from 'src/components/icon/helpers';
import { theme } from 'src/theme';
import { TreemapChart } from '../visualizations/treemap-chart';

interface DataTypesProps {
  query: TopicPageProps['attributes']['query'];
  topic: string;
}

const facets = [
  {
    label: 'Pathogen',
    value: 'infectiousAgent.name',
    fill: theme.colors[getMetadataTheme('infectiousAgent')][300] as string,
    colorScheme: theme.colors[getMetadataTheme('infectiousAgent')],
  },
  {
    label: 'Measurement Technique',
    value: 'measurementTechnique.name',
    fill: theme.colors[getMetadataTheme('measurementTechnique')][300] as string,
    colorScheme: theme.colors[getMetadataTheme('measurementTechnique')],
  },
  {
    label: 'Health Condition',
    value: 'healthCondition.name',
    fill: theme.colors[getMetadataTheme('healthCondition')][300] as string,
    colorScheme: theme.colors[getMetadataTheme('healthCondition')],
  },
] as FacetProps[];

export const PropertyTreemapLists = ({ query, topic }: DataTypesProps) => {
  const [listView, setListView] = React.useState(true);

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
    Array<FacetProps & { terms: FacetTerm[] }>
  >({
    queryKey: ['search-results', params],
    queryFn: async () => await fetchSearchResults(params),
    select: data => {
      if (!data)
        return [{ colorScheme: '', fill: '', label: '', value: '', terms: [] }];
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
    <Flex flexDirection='column'>
      <ChartWrapper
        title={`Resources mentioning ${topic} also mentioned the following:`}
        description={
          listView
            ? `Explore the table by dragging the blue box horizontally on the bar chart to scroll through most popular metadata properties (100 top results) or resize it to filter a specific range. The list rows updates dynamically based on the selection.`
            : 'Click on rectangle to view all related results within the portal.'
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
            const props = {
              facet,
              data: terms,
              getSearchRoute: (term: string) => {
                return getSearchResultsRoute({
                  facet: facet.value,
                  querystring: query.q,
                  term,
                });
              },
            };
            return (
              <Box
                key={facet.value}
                flex={1}
                minWidth={{ base: '100%', sm: '380px' }}
                maxWidth={{ base: 'unset', lg: '500px' }}
              >
                {listView ? (
                  <BrushableListChart {...props} />
                ) : (
                  <TreemapChart {...props} />
                )}
              </Box>
            );
          })}
        </HStack>
      </ChartWrapper>
    </Flex>
  );
};
