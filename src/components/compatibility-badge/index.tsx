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
      {/* <Box>
        <Text color='gray.600' fontSize='sm'>
          Monochrome GridPlot
        </Text>
        <Flex alignItems='center'>
          <Image
            mr={10}
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
      </Box> */}
      <Box position='sticky' top={0} bg='white' zIndex='10000'>
        <Text color='gray.600' fontSize='sm'>
          Legend
        </Text>
        <Image
          src='/assets/temp/viz-legend.png'
          alt='viz-legend'
          border='1px solid'
          borderColor='gray.200'
          borderRadius='semi'
        />
        <Text
          fontStyle='italic'
          fontSize='12px'
          maxW='500px'
          lineHeight='shorter'
          my={2}
        >
          Note: Augmentation dots only appear on AccessClinicalData to allow
          testers to determine whether they prefer the visualizations with or
          without the dots.
        </Text>
      </Box>
      <Box>
        <Text color='gray.600' fontSize='sm'>
          Duochrome GridPlot
        </Text>

        <Flex alignItems='center'>
          <Image
            src='/assets/temp/02.png'
            alt='duochrome-gridplot-legend'
            border='1px solid'
            borderColor='gray.200'
            borderRadius='semi'
            mr={10}
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
            src='/assets/temp/03.png'
            alt='BarChart-GridPlot-Hybrid'
            border='1px solid'
            borderColor='gray.200'
            borderRadius='semi'
            mr={10}
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
          <Image
            src='/assets/temp/04.png'
            alt='Arcs'
            border='1px solid'
            borderColor='gray.200'
            borderRadius='semi'
            mr={10}
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
            src='/assets/temp/05.png'
            alt='arc-segments-two'
            border='1px solid'
            borderColor='gray.200'
            borderRadius='semi'
            mr={10}
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
        <Flex alignItems='center'>
          <Image
            src='/assets/temp/06.png'
            alt='circular'
            border='1px solid'
            borderColor='gray.200'
            borderRadius='semi'
            mr={10}
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
        </Flex>
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
