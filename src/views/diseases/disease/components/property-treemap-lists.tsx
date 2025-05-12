import React from 'react';
import {
  Box,
  Flex,
  HStack,
  Radio,
  RadioGroup,
  Stack,
  Text,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { getMetadataTheme } from 'src/components/icon/helpers';
import { InfoLabel } from 'src/components/info-label';
import { theme } from 'src/theme';
import { fetchSearchResults } from 'src/utils/api';
import { FacetTerm, FetchSearchResultsResponse } from 'src/utils/api/types';
import { ChartWrapper } from '../layouts/chart-wrapper';
import { BrushableListChart } from '../visualizations/brushable-list-chart';
import { TreemapChart } from '../visualizations/treemap-chart';
import { getSearchResultsRoute } from '../../helpers';
import { FacetProps, TopicQueryProps } from '../../types';
import {
  fillTemplatePlaceholders,
  MarkdownContent,
} from '../layouts/markdown-content';
import { headingStyles, SectionTitle } from '../layouts/section';
import DISEASE_PAGE_COPY from '../disease-page.json';
import { getMetadataDescription } from 'src/components/metadata';

const facets = [
  {
    label: 'Health Condition',
    value: 'healthCondition.name',
    fill: theme.colors[getMetadataTheme('healthCondition')][300] as string,
    colorScheme: theme.colors[getMetadataTheme('healthCondition')],
    tooltip: getMetadataDescription('healthCondition', 'Dataset'),
  },
  {
    label: 'Measurement Technique',
    value: 'measurementTechnique.name',
    fill: theme.colors[getMetadataTheme('measurementTechnique')][300] as string,
    colorScheme: theme.colors[getMetadataTheme('measurementTechnique')],
    tooltip: getMetadataDescription('measurementTechnique', 'Dataset'),
  },
  {
    label: 'Pathogen',
    value: 'infectiousAgent.name',
    fill: theme.colors[getMetadataTheme('infectiousAgent')][300] as string,
    colorScheme: theme.colors[getMetadataTheme('infectiousAgent')],
    tooltip: getMetadataDescription('infectiousAgent', 'Dataset'),
  },
] as FacetProps[];

const { skeletonHeight, ...textProps } = headingStyles['h5'];

export const PropertyTreemapLists = ({ query, topic }: TopicQueryProps) => {
  const [listView, setListView] = React.useState(true);

  // Fetch data types for query.
  const params = {
    ...query,
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
        return [
          {
            colorScheme: '',
            fill: '',
            label: '',
            value: '',
            tooltip: '',
            terms: [],
          },
        ];
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

  const defaultDimensions = {
    width: 450,
    height: 420,
    margin: { top: 4, right: 4, bottom: 4, left: 4 },
  };
  return (
    <Flex flexDirection='column' width='100%'>
      <Stack
        alignItems='flex-start'
        flexDirection={{ base: 'column', lg: 'row' }}
        flexWrap='wrap'
        spacing={{ base: 2, lg: 6 }}
        width='100%'
      >
        <Box flex={2}>
          <SectionTitle as='h4'>
            {fillTemplatePlaceholders(
              DISEASE_PAGE_COPY['charts']['treemaplist']['title'],
              {
                topic,
              },
            )}
          </SectionTitle>

          <MarkdownContent
            template={DISEASE_PAGE_COPY['charts']['treemaplist']['description']}
            replacements={{
              topic,
            }}
          />
        </Box>

        {/* Toggle for charts types */}
        <Flex
          alignItems={{ base: 'flex-start', md: 'flex-end' }}
          flex={1}
          flexDirection='column'
          px={{ base: 0, md: 4 }}
        >
          <Text fontWeight='medium' lineHeight='short'>
            Select Chart Type
          </Text>
          <RadioGroup
            onChange={value => setListView(value === 'list')}
            value={`${listView ? 'list' : 'treemap'}`}
          >
            <Stack direction='row'>
              <Radio value='list'>List</Radio>
              <Radio value='treemap'>Treemap</Radio>
            </Stack>
          </RadioGroup>
        </Flex>
      </Stack>
      <ChartWrapper
        error={error}
        isLoading={isLoading}
        skeletonProps={{
          minHeight: defaultDimensions.height,
          width: '100%',
        }}
      >
        {/* Property Charts */}
        <HStack mt={4} alignItems='flex-start' spacing={6} flexWrap='wrap'>
          {data?.map(({ terms, ...facet }) => {
            const props = {
              facet,
              data: terms,
              getSearchRoute: (term: string) => {
                return getSearchResultsRoute({
                  query: params,
                  facet: facet.value,
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
                <InfoLabel
                  title={facet.label}
                  tooltipText={facet.tooltip}
                  textProps={textProps}
                />

                {listView ? (
                  <BrushableListChart {...props} />
                ) : (
                  <TreemapChart
                    {...props}
                    title={`Distribution of ${facet.label}`}
                    description={`
                      A treemap chart showing the distribution of the top ten ${facet.label} terms by count. Each rectangle represents a term.
                      The size of the rectangle is proportional to the count of the term. Click on a rectangle to view all related results within the portal.`}
                    data={terms.slice(0, 10)}
                    defaultDimensions={defaultDimensions}
                  />
                )}
              </Box>
            );
          })}
        </HStack>
      </ChartWrapper>
    </Flex>
  );
};
