import { useMemo } from 'react';
import { Box, Flex, Heading, Stack, Text } from '@chakra-ui/react';
import { useFacetsData } from 'src/components/filters/hooks/useFacetsData';
import { Params } from 'src/utils/api';
import { formatNumber } from 'src/utils/helpers';
import { Radar } from './radar';
import { FILTERS_CONFIG } from 'src/components/search-results-page/components/filters/helpers';

interface SearchResultsVisualizationsProps {
  queryParams: Params;
  total: number;
}

const facets = [
  'healthCondition.name',
  'infectiousAgent.name',
  'species.displayName',
  'funding.funder.name',
  'conditionsOfAccess',
  // 'variableMeasured',
  'measurementTechnique.name',
];
export const SearchResultsVisualizations = ({
  queryParams,
}: SearchResultsVisualizationsProps) => {
  const [{ data, total, error, isLoading, isUpdating }] = useFacetsData({
    queryParams,
    facets,
  });

  const RADAR_DATA = useMemo(() => {
    return Object.entries(data)
      .filter(([key]) => key !== 'date')
      .map(([key, values]) => {
        const exists = values.find(({ term }) => term === '_exists_');
        const count = exists ? exists.count : 0;

        return {
          key,
          name: FILTERS_CONFIG[key]?.name || key,
          count,
          // frequency: count,
          frequency: Math.round((count / total) * 100),
        };
      });
  }, [data, total]);

  return (
    <Stack spacing={4} flexDirection='row' sx={{ '>*': { minWidth: '300px' } }}>
      <Box
        bg='white'
        border='1px solid'
        borderColor='gray.100'
        mb={6}
        borderRadius='semi'
        py={2}
        px={4}
      >
        <Text fontSize='xs' fontWeight='normal' color='gray.800'>
          Results
        </Text>
        <Text fontSize='md' fontWeight='bold'>
          {formatNumber(total)}
        </Text>
      </Box>
      {/* Radar */}
      <Flex bg='white' boxShadow='sm' mb={6} borderRadius='semi' py={2} px={4}>
        {!isLoading && <Radar width={400} height={400} data={RADAR_DATA} />}
      </Flex>
    </Stack>
  );
};
