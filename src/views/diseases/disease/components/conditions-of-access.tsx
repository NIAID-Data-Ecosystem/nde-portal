import { Box, Flex, Text } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import NextLink from 'next/link';
import { Link } from 'src/components/link';
import { theme } from 'src/theme';
import { fetchSearchResults } from 'src/utils/api';
import { FetchSearchResultsResponse } from 'src/utils/api/types';
import {
  formatConditionsOfAccess,
  getColorScheme,
  getConditionsOfAccessDescription,
} from 'src/utils/formatting/formatConditionsOfAccess';
import { getSearchResultsRoute } from 'src/views/diseases/helpers';
import { TopicQueryProps } from '../../types';
import { ChartWrapper } from '../layouts/chart-wrapper';
import {
  FacetTermsWithDetails,
  StackedBarChart,
} from '../visualizations/stacked-bar-chart';
import { LegendContainer, LegendItem } from './legend';
import DISEASE_PAGE_COPY from '../disease-page.json';
import { MarkdownContent } from '../layouts/markdown-content';

export const ConditionsOfAccess = ({ query, topic }: TopicQueryProps) => {
  // Fetch conditionsOfAccess for query.
  const params = {
    ...query,
    q: query.q,
    facet_size: query.facet_size,
    facets: 'conditionsOfAccess',
    size: 0,
  };
  const { data, isLoading, isPlaceholderData, error } = useQuery<
    FetchSearchResultsResponse | undefined,
    Error,
    { terms: FacetTermsWithDetails[]; total: number }
  >({
    queryKey: ['search-results', params],
    queryFn: async () => await fetchSearchResults(params),
    select: data => {
      const terms =
        data?.facets?.['conditionsOfAccess']?.terms?.map(access => {
          const label = formatConditionsOfAccess(access.term);
          const colorScheme = getColorScheme(label);

          return {
            ...access,
            label: label || '',
            description: getConditionsOfAccessDescription(label),
            colorScheme,
            fill: theme.colors[colorScheme][300] as string,
          };
        }) || [];
      return {
        terms,
        total: data?.facets?.['conditionsOfAccess']?.total || 0,
      };
    },
    placeholderData: () => {
      return {
        results: [],
        total: 0,
        facets: {
          conditionsOfAccess: {
            _type: 'terms',
            terms: [
              {
                count: 0,
                term: 'Open',
              },
              {
                count: 0,
                term: 'Controlled',
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
          title={DISEASE_PAGE_COPY['charts']['conditions-of-access']['title']}
          description={
            <MarkdownContent
              template={
                DISEASE_PAGE_COPY['charts']['conditions-of-access'][
                  'description'
                ]
              }
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
          {data && (
            <StackedBarChart
              title='Title'
              description='Description'
              data={data}
              defaultDimensions={{
                width: 450,
                height: 100,
                margin: { top: 25, right: 30, bottom: 20, left: 0 },
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
          {data?.terms?.map(({ description, fill, label, term, count }) => {
            return (
              <LegendItem
                key={term}
                count={count}
                isLoading={isLoading || isPlaceholderData}
                swatchBg={fill}
              >
                <Box>
                  <NextLink
                    href={getSearchResultsRoute({
                      query: params,
                      facet: params.facets,
                      term: term as string,
                    })}
                    passHref
                  >
                    <Link as='p'>{label}</Link>
                  </NextLink>
                  <Text lineHeight='shorter' mt={1}>
                    {description}
                  </Text>
                </Box>
              </LegendItem>
            );
          })}
          <LegendItem
            key='total'
            count={data?.total}
            isLoading={isLoading || isPlaceholderData}
          >
            Total
          </LegendItem>
        </LegendContainer>
      </Box>
    </Flex>
  );
};
