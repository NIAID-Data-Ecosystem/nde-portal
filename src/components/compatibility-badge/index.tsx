import { useMetadata } from 'src/hooks/api/useMetadata';
import { ParentSize } from '@visx/responsive';
import HeatMap from './components/heatmap';
import { Box, Flex, Stack, Text } from '@chakra-ui/react';
import { ScrollContainer } from '../scroll-container';
import BarChartHeatMap from './components/barchart-heatmap';

export const CompatibilityBadge = () => {
  const { data } = useMetadata();
  const sources = data?.src
    ? Object.values(data.src)
        .filter(
          source =>
            source?.sourceInfo?.metadata_completeness?.required_fields &&
            source?.sourceInfo?.metadata_completeness?.recommended_fields,
        )
        .sort((a, b) => {
          return a.sourceInfo.name.localeCompare(b.sourceInfo.name);
        })
    : [];

  return (
    <Stack spacing={6}>
      <Box>
        <Text color='gray.600' fontSize='sm'>
          Monochrome GridPlot
        </Text>
        <ScrollContainer>
          <Stack w='100%' flexDirection='row' spacing={4}>
            <Flex>
              {sources.length > 0 &&
                sources.map(source => {
                  return (
                    <Flex
                      key={source.sourceInfo.name}
                      flexDirection='column'
                      alignItems='center'
                    >
                      <Box w='150px' h='100px'>
                        <ParentSize>
                          {({ width, height }) => (
                            <HeatMap
                              width={width}
                              height={height}
                              data={source}
                              isMonoChromatic
                            />
                          )}
                        </ParentSize>
                      </Box>
                      <Text
                        color='gray.600'
                        fontSize='xs'
                        lineHeight='shorter'
                        maxW='150px'
                        px={2}
                        textAlign='center'
                      >
                        {source.sourceInfo.name}
                      </Text>
                    </Flex>
                  );
                })}
            </Flex>
          </Stack>
        </ScrollContainer>
      </Box>
      <Box>
        <Text color='gray.600' fontSize='sm'>
          Duochrome GridPlot
        </Text>
        <ScrollContainer>
          <Stack w='100%' flexDirection='row' spacing={4}>
            <Flex>
              {sources.length > 0 &&
                sources.map(source => {
                  return (
                    <Flex
                      key={source.sourceInfo.name}
                      flexDirection='column'
                      alignItems='center'
                    >
                      <Box w='150px' h='100px'>
                        <ParentSize>
                          {({ width, height }) => (
                            <HeatMap
                              width={width}
                              height={height}
                              data={source}
                              isMonoChromatic={false}
                            />
                          )}
                        </ParentSize>
                      </Box>
                      <Text
                        color='gray.600'
                        fontSize='xs'
                        lineHeight='shorter'
                        maxW='150px'
                        px={2}
                        textAlign='center'
                      >
                        {source.sourceInfo.name}
                      </Text>
                    </Flex>
                  );
                })}
            </Flex>
          </Stack>
        </ScrollContainer>
      </Box>
      <Box>
        <Text color='gray.600' fontSize='sm'>
          BarChart GridPlot Hybrid
        </Text>
        <ScrollContainer>
          <Stack w='100%' flexDirection='row' spacing={4}>
            <Flex>
              {sources.length > 0 &&
                sources.map(source => {
                  return (
                    <Flex
                      key={source.sourceInfo.name}
                      flexDirection='column'
                      alignItems='center'
                    >
                      <Box w='150px' h='100px'>
                        <ParentSize>
                          {({ width, height }) => (
                            <BarChartHeatMap
                              width={width}
                              height={height}
                              data={source}
                              isMonoChromatic={false}
                            />
                          )}
                        </ParentSize>
                      </Box>
                      <Text
                        color='gray.600'
                        fontSize='xs'
                        lineHeight='shorter'
                        maxW='150px'
                        px={2}
                        textAlign='center'
                      >
                        {source.sourceInfo.name}
                      </Text>
                    </Flex>
                  );
                })}
            </Flex>
          </Stack>
        </ScrollContainer>
      </Box>
    </Stack>
  );
};
