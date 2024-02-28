import { useMetadata } from 'src/hooks/api/useMetadata';
import { ParentSize } from '@visx/responsive';
import HeatMap from './components/heatmap';
import { Box, Flex, Image, Link, Stack, Text } from '@chakra-ui/react';
import { ScrollContainer } from '../scroll-container';
import BarChartHeatMap from './components/barchart-heatmap';
import { ArcSegments } from './components/arc-segments';
import { ArcSegmentsTwo } from './components/arc-segments-two';
import { ArcCircle } from './components/arc-circle';

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
    <Stack spacing={8}>
      <Box>
        <Text color='gray.600' fontSize='sm'>
          Monochrome GridPlot
        </Text>
        <Flex alignItems='center'>
          <Image
            mr={20}
            src='/assets/temp/monochrome-gridplot-legend.png'
            alt='monochrome-gridplot-legend'
          />
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
        </Flex>
      </Box>
      <Box>
        <Text color='gray.600' fontSize='sm'>
          Duochrome GridPlot
        </Text>
        <Flex alignItems='center'>
          <Image
            mr={20}
            src='/assets/temp/duochrome-gridplot-legend.png'
            alt='duochrome-gridplot-legend'
          />
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
        </Flex>
      </Box>
      <Box>
        <Text color='gray.600' fontSize='sm'>
          BarChart GridPlot Hybrid
        </Text>
        <Flex alignItems='center'>
          <Image
            mr={20}
            src='/assets/temp/BarChart-GridPlot-Hybrid.png'
            alt='BarChart-GridPlot-Hybrid'
          />
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
                        {/* <Box w='100px' h='200px'> */}
                        <Box w='350px' h='100px'>
                          <ParentSize>
                            {({ width, height }) => (
                              <BarChartHeatMap
                                width={width}
                                height={height}
                                data={source}
                                isMonoChromatic={true}
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
        </Flex>
      </Box>
      <Box>
        <Text color='gray.600' fontSize='sm'>
          Arcs
        </Text>
        <Flex alignItems='center'>
          <Image src='/assets/temp/Arcs.png' alt='Arcs' mr={20} />
          <ScrollContainer>
            <Stack w='100%' flexDirection='row' spacing={4}>
              <Flex>
                {sources.length > 0 &&
                  sources.map((source, idx) => {
                    return (
                      <Flex
                        key={source.sourceInfo.name}
                        flexDirection='column'
                        alignItems='center'
                      >
                        <Box w='150px' mb={1}>
                          <ParentSize>
                            {({ width, height }) => (
                              <ArcSegments
                                width={width}
                                height={height}
                                data={source}
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
        </Flex>
      </Box>
      <Box>
        <Text color='gray.600' fontSize='sm'>
          Arcs 2
        </Text>
        <Flex alignItems='center'>
          <Image
            mr={20}
            src='/assets/temp/arc-segments-two.png'
            alt='arc-segments-two'
          />
          <ScrollContainer>
            <Stack w='100%' flexDirection='row' spacing={4}>
              <Flex>
                {sources.length > 0 &&
                  sources.map((source, idx) => {
                    return (
                      <Flex
                        key={source.sourceInfo.name}
                        flexDirection='column'
                        alignItems='center'
                      >
                        <Box w='150px' mb={1}>
                          <ParentSize>
                            {({ width, height }) => (
                              <ArcSegmentsTwo
                                width={width}
                                height={height}
                                data={source}
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
        </Flex>
      </Box>
      <Box>
        <Text color='gray.600' fontSize='sm'>
          Circular
        </Text>
        <ScrollContainer>
          <Stack w='100%' flexDirection='row' spacing={4}>
            <Flex>
              {sources.length > 0 &&
                sources.map((source, idx) => {
                  return (
                    <Flex
                      key={source.sourceInfo.name}
                      flexDirection='column'
                      alignItems='center'
                    >
                      <Box w='100px' mb={1}>
                        <ParentSize>
                          {({ width, height }) => (
                            <ArcCircle
                              width={width}
                              height={height}
                              data={source}
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
      <Text color='gray.600' fontSize='sm'>
        Data From:{' '}
        <Link href='https://api.nde-dev.biothings.io/v1/metadata'>
          https://api.nde-dev.biothings.io/v1/metadata
        </Link>
      </Text>
    </Stack>
  );
};
