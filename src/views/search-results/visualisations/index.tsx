import { useMemo } from 'react';
import { Box, Flex, Heading, Stack, Text } from '@chakra-ui/react';
import { useFacetsData } from 'src/components/filters/hooks/useFacetsData';
import { Params } from 'src/utils/api';
import { formatNumber } from 'src/utils/helpers';
import { Radar } from './components/radar';
import { FILTERS_CONFIG } from 'src/components/search-results-page/components/filters/helpers';
import { BrushChart } from './components/area-chart';
import { BadgeWithTooltip } from 'src/components/badges';
import { SourcesChartHorizontal } from './components/sources-chart';
import { TopicDisplay } from 'src/components/resource-sections/components/topics';

interface SearchResultsVisualizationsProps {
  queryParams: Params;
  total: number;
}

const facets = [
  '@type',
  'healthCondition.name',
  'includedInDataCatalog.name',
  'infectiousAgent.displayName',
  'species.displayName',
  'funding.funder.name',
  'conditionsOfAccess',
  'measurementTechnique.name',
  'topicCategory.url',
];
export const SearchResultsVisualizations = ({
  queryParams,
}: SearchResultsVisualizationsProps) => {
  const [{ data, total, error, isLoading }] = useFacetsData({
    queryParams,
    facets,
  });

  const RADAR_DATA = useMemo(() => {
    return Object.entries(data)
      .filter(
        ([key]) =>
          key !== 'date' &&
          key !== 'includedInDataCatalog.name' &&
          key !== '@type' &&
          key !== 'topicCategory.url',
      )
      .map(([key, values]) => {
        const exists = values.find(({ term }) => term === '_exists_');
        const count = exists ? exists.count : 0;
        const name = FILTERS_CONFIG[key]?.name || key;
        return {
          key,
          name,
          count,
          frequency: count,
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [data]);

  const resourceCatalogs =
    data && data?.['@type']?.find(item => item.term === 'ResourceCatalog');
  const datasets =
    data && data?.['@type']?.find(item => item.term === 'Dataset');

  const SourcesChartHorizontalData = useMemo(() => {
    if (!data || !data?.['includedInDataCatalog.name']) return [];
    return (
      data &&
      data?.['includedInDataCatalog.name']
        .filter(source => source.term !== '_exists_')
        .map(({ term, count, displayAs }) => {
          return {
            key: term,
            term,
            displayAs,
            count,
            category: count < 1000 ? 'Other' : displayAs,
          };
        })
        .sort((a, b) => b.count - a.count)
    );
  }, [data]);

  const topics = useMemo(() => {
    return (
      (data &&
        data?.['topicCategory.url']
          ?.filter(
            item =>
              !item.term.includes('_exists_') &&
              item.term.startsWith('http://edamontology.org/'),
          )
          .slice(0, 20)
          .map(({ term, count, displayAs }) => ({
            url: term,
            count,
            displayAs,
          }))) ||
      []
    );
  }, [data]);

  return (
    <>
      <Flex
        bg='white'
        border='1px solid'
        borderColor='gray.100'
        mb={6}
        borderRadius='semi'
        py={2}
        px={4}
        flexDirection='column'
      >
        <Stack flexDirection='row' flexWrap='wrap'>
          {total && total > 0 && (
            <Box
              px={4}
              py={2}
              borderRadius='md'
              minWidth='200px'
              border='1px solid'
              borderColor='page.alt'
            >
              <Text color='gray.700' fontSize='xs' lineHeight='short'>
                Results
              </Text>
              <Text color='tertiary.800' fontSize='md' fontWeight='extrabold'>
                {formatNumber(total)}
              </Text>
            </Box>
          )}
          {datasets && datasets.count > 0 && (
            <Box px={4} py={2} bg='page.alt' borderRadius='md' minWidth='200px'>
              <Text color='gray.700' fontSize='xs' lineHeight='short'>
                Datasets
              </Text>
              <Text color='tertiary.800' fontSize='md' fontWeight='extrabold'>
                {formatNumber(datasets.count)}
              </Text>
            </Box>
          )}
          {resourceCatalogs && resourceCatalogs.count > 0 && (
            <Box px={4} py={2} bg='page.alt' borderRadius='md' minWidth='200px'>
              <Text color='gray.700' fontSize='xs' lineHeight='short'>
                Catalogs
              </Text>
              <Text color='tertiary.800' fontSize='md' fontWeight='extrabold'>
                {formatNumber(resourceCatalogs.count)}
              </Text>
            </Box>
          )}
        </Stack>
      </Flex>
      <Stack
        spacing={4}
        flexDirection='row'
        sx={{ '>*': { minWidth: '300px' } }}
        flexWrap='wrap'
      >
        {/* <!--  Radar -->  */}
        <Box bg='white' boxShadow='sm' mb={6} borderRadius='semi' py={4} px={4}>
          <Heading as='h3' size='sm'>
            Metadata Coverage
          </Heading>
          {!isLoading && <Radar width={300} height={300} data={RADAR_DATA} />}
        </Box>

        {/* <!-- Topics --> */}
        <Box
          bg='white'
          boxShadow='sm'
          mb={6}
          borderRadius='semi'
          py={4}
          px={4}
          flex={1}
          minWidth='500px'
          maxWidth='650px'
        >
          <Heading as='h3' size='sm'>
            Topics
          </Heading>
          {!isLoading && (
            <TopicDisplay
              topics={topics.slice(0, 5)}
              margin={{ top: 20, left: 20, right: 80, bottom: 20 }}
              initialZoom={{
                scaleX: 0.8,
                scaleY: 0.8,
                translateX: 61.79999999999998,
                translateY: 32.135999999999996,
                skewX: 0,
                skewY: 0,
              }}
            />
          )}
        </Box>

        {/* <!-- Sources --> */}
        <Box bg='white' boxShadow='sm' mb={6} borderRadius='semi' py={4} px={4}>
          <Heading as='h3' size='sm'>
            Sources
          </Heading>
          {!isLoading && (
            <SourcesChartHorizontal
              width={400}
              height={900}
              data={SourcesChartHorizontalData}
              params={queryParams}
            />
          )}
        </Box>

        {/* <!--  Release Dates --> */}
        {/* <Box bg='white' boxShadow='sm' mb={6} borderRadius='semi' py={4} px={4}>
          <Heading as='h3' size='sm'>
            Release Dates
          </Heading>
          {!isLoading && (
            <BrushChart width={400} height={400} params={queryParams} />
          )}
        </Box>
        */}
      </Stack>
    </>
  );
};
