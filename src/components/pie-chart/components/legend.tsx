import React from 'react';
import {
  Badge,
  Box,
  Flex,
  Heading,
  Image,
  Link,
  SimpleGrid,
  Tag,
  Text,
} from 'nde-design-system';
import { LegendOrdinal, LegendItem } from '@visx/legend';
import { formatNumber } from 'src/utils/helpers';
import NextLink from 'next/link';
import { queryFilterObject2String } from 'src/components/filters';
import { colorScale, formatPieChartData } from '../helpers';
import { DataProps, RawDataProps } from '../types';
import { assetPrefix } from 'next.config';
import NIAID_FUNDED from 'configs/niaid-sources.json';

const Label = ({
  text,
  count,
  source,
  swatchColor,
  badges,
}: {
  text: string;
  source: string;
  count: number;
  swatchColor?: string;
  badges?: { text: string; color?: string }[];
}) => {
  return (
    <>
      {source ? (
        <Box>
          <Flex alignItems={'center'}>
            {swatchColor && <Box bg={swatchColor} w={3} h={3} mr={3} />}
            <Box>
              <NextLink
                href={{
                  pathname: `/search`,
                  query: {
                    q: '',
                    filters: queryFilterObject2String({
                      'includedInDataCatalog.name': [source],
                    }),
                  },
                }}
                passHref
              >
                <Link
                  color='text.body'
                  _hover={{ color: 'text.body' }}
                  lineHeight='1rem'
                  _visited={{ color: 'text.body' }}
                  fontWeight='semibold'
                >
                  {text}
                </Link>
              </NextLink>

              <Text lineHeight='shorter' fontSize='sm' fontWeight='normal'>
                {formatNumber(count)} records
              </Text>
            </Box>
          </Flex>
        </Box>
      ) : (
        <Flex alignItems='flex-start'>
          {swatchColor && <Box bg={swatchColor} w={3} h={3} mr={3} />}
          <Box>
            <Text lineHeight='shorter' fontWeight='semibold'>
              {text}
              <Text lineHeight='shorter' fontSize='sm' fontWeight='normal'>
                {formatNumber(count)} records
              </Text>
            </Text>
          </Box>
        </Flex>
      )}
      {badges?.map(({ color, text }, i) => (
        <Box key={`${text}-${i}`} mt={2}>
          <Tag bg={color || 'gray'} size='sm'>
            {text}
          </Tag>
        </Box>
      ))}
    </>
  );
};

export const Legend = ({ data: rawData }: { data: RawDataProps[] }) => {
  const data = formatPieChartData(rawData);
  const niaidRepos = NIAID_FUNDED.repositories.map(({ id }) => id);

  const niaid_labels = data.reduce((r, datum) => {
    if (datum.data) {
      datum.data.map(d => {
        if (niaidRepos.includes(d.term)) {
          r.push(d);
        }
      });
    }
    if (niaidRepos.includes(datum.term)) {
      r.push(datum);
    }
    return r;
  }, [] as { term: string; count: number }[]);
  const numSources = niaid_labels.length || 0;
  const numDatasets = niaid_labels.reduce((r, v) => (r += v.count), 0);
  const borderStyles = {
    border: '1px solid',
    borderColor: 'gray.200',
    borderRadius: 'semi',
    p: 2,
  };
  return (
    <Flex
      className='chart-legend'
      w='100%'
      minWidth={[200, 200, 300]}
      // maxW={{ base: 600, lg: 'unset' }}
      justifyContent={{ base: 'center', sm: 'space-between', md: 'center' }}
      flexDirection={{ base: 'column', md: 'row' }}
      flexWrap='wrap'
    >
      {/* Legend */}
      <Flex
        flexDirection='column'
        minW={{ base: '300px' }}
        maxW='600px'
        flex={1}
        m={2}
      >
        <Box
          bg='#fff'
          borderRadius='semi'
          boxShadow='base'
          p={4}
          border='1px solid'
          borderColor='gray.200'
        >
          <Flex>
            <Image
              maxH='50px'
              src={`${assetPrefix || ''}/assets/NIH-logo.png`}
              alt='NIAID logo.'
            />
            <Heading size='h5' mx={4} color='text.body'>
              NIAID funded data
            </Heading>
          </Flex>

          {/* 1. niaid funded labels */}
          <>
            <Box>
              <Flex flex={1} flexDirection='column'>
                <Flex flexDirection='row' p={2} justifyContent='space-around'>
                  {numSources > 0 && (
                    <Text fontSize='sm'>
                      <Text as='span' fontWeight='bold' fontSize='xl' mr={1}>
                        {formatNumber(numSources)}
                      </Text>{' '}
                      source{numSources === 1 ? '' : 's'}
                    </Text>
                  )}

                  {numDatasets > 0 && (
                    <Text fontSize='sm'>
                      <Text as='span' fontWeight='bold' fontSize='xl' mr={1}>
                        {formatNumber(numDatasets)}
                      </Text>{' '}
                      dataset{numDatasets === 1 ? '' : 's'}
                    </Text>
                  )}
                </Flex>
                <Flex bg='niaid.color' flexWrap='wrap'>
                  <Flex
                    flex={1}
                    mt={1}
                    w='100%'
                    flexWrap='wrap'
                    bg='whiteAlpha.900'
                    p={2}
                    justifyContent='space-around'
                  >
                    {niaid_labels.map(label => {
                      return (
                        <Flex
                          key={label.term}
                          flexDirection='column'
                          flex='1 1 50%'
                          p={2}
                          minW='200px'
                          maxW='250px'
                          wordBreak='break-word'
                        >
                          <Label
                            text={label.term}
                            count={label.count}
                            source={label.term}
                          />
                        </Flex>
                      );
                    })}
                  </Flex>
                </Flex>
              </Flex>
            </Box>
          </>
        </Box>
      </Flex>
      {/* 2. all legend labels */}
      <Box
        flex={1}
        m={2}
        ml={{ base: 2, lg: 6 }}
        maxW={{ base: 'unset', lg: '900px' }}
      >
        <LegendOrdinal scale={colorScale(data)} direction='column'>
          {labels => {
            return (
              <Box>
                <SimpleGrid
                  minChildWidth={{ base: '100%', md: '400px', lg: '300px' }}
                  spacingX={2}
                  spacingY={4}
                  w='100%'
                  maxW={{ base: 'unset', lg: '800px' }}
                >
                  {labels.map((label, i) => {
                    if (label.text === 'Other') {
                      return;
                    }
                    const datum = data.filter(d => d.term === label.text)[0];
                    return (
                      <Box w='100%' key={i}>
                        <Label
                          swatchColor={label.value}
                          text={label.text}
                          count={datum.count}
                          source={datum.data ? '' : datum.term}
                        />
                        {datum.data && (
                          <Box
                            borderLeft='1px solid'
                            borderColor='gray.200'
                            pl={4}
                            mt={4}
                            w='100%'
                          >
                            <SimpleGrid
                              templateColumns={{
                                md: 'repeat(2, 215px)',
                              }}
                              spacing={2}
                              w='100%'
                            >
                              {datum.data.map((d, i) => (
                                <Flex key={i} flexDirection='column'>
                                  <Label
                                    text={d.term}
                                    count={d.count}
                                    source={d.term}
                                  />
                                </Flex>
                              ))}
                            </SimpleGrid>
                          </Box>
                        )}
                      </Box>
                    );
                  })}
                </SimpleGrid>
                {/* grouped "other" type labels */}
                {labels.map((label, i) => {
                  if (label.text.toLowerCase() !== 'other') {
                    return <></>;
                  }
                  const datum = data.filter(d => d.term === label.text)[0];
                  return (
                    <Box w='100%' key={i} my={6}>
                      <Label
                        swatchColor={label.value}
                        text={label.text}
                        count={datum.count}
                        source={datum.data ? '' : datum.term}
                      />

                      {datum.data && (
                        <Box
                          borderLeft='1px solid'
                          borderColor='gray.200'
                          pl={4}
                          mt={4}
                          w='100%'
                        >
                          <SimpleGrid
                            minChildWidth={{ md: '275px' }}
                            spacing={2}
                            w='100%'
                          >
                            {datum.data.map((d, i) => {
                              const isNiaid =
                                niaid_labels.filter(
                                  ({ term }) => term === d.term,
                                ).length > 0;

                              return (
                                <Flex
                                  key={i}
                                  flexDirection='column'
                                  {...borderStyles}
                                >
                                  <Label
                                    text={d.term}
                                    count={d.count}
                                    source={d.term}
                                    badges={
                                      isNiaid
                                        ? [
                                            {
                                              text: 'NIAID Funded',
                                              color: 'niaid.color',
                                            },
                                          ]
                                        : []
                                    }
                                  />
                                </Flex>
                              );
                            })}
                          </SimpleGrid>
                        </Box>
                      )}
                      {i === labels.length - 1 && (
                        <Box my={4}>
                          <NextLink
                            href={{
                              pathname: '/sources/',
                            }}
                            passHref
                          >
                            <Link>Learn more about our sources</Link>
                          </NextLink>
                        </Box>
                      )}
                    </Box>
                  );
                })}
              </Box>
            );
          }}
        </LegendOrdinal>
      </Box>
    </Flex>
  );
};
