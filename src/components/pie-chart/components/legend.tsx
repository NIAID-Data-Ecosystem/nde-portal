import React from 'react';
import {
  Box,
  Flex,
  Heading,
  Image,
  Link,
  SimpleGrid,
  Tag,
  Text,
} from 'nde-design-system';
import { LegendOrdinal } from '@visx/legend';
import { formatNumber } from 'src/utils/helpers';
import NextLink from 'next/link';
import { queryFilterObject2String } from 'src/components/filters';
import { colorScale, formatPieChartData } from '../helpers';
import { RawDataProps } from '../types';
import { assetPrefix } from 'next.config';
import NIAID_FUNDED from 'configs/niaid-sources.json';

const Label = ({
  text,
  count,
  source,
  swatchColor,
  badges,
  abstract,
}: {
  text: string;
  source: string;
  count: number;
  swatchColor?: string;
  badges?: { text: string; color?: string }[];
  abstract?: string;
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
              {text} <br />
              <Text
                as='span'
                lineHeight='shorter'
                fontSize='sm'
                fontWeight='normal'
              >
                {formatNumber(count)} records
              </Text>
            </Text>
          </Box>
        </Flex>
      )}
      {abstract && (
        <Text fontSize={'xs'} mt={1}>
          {abstract}
        </Text>
      )}
      <Flex flexFlow='wrap' mb={-1}>
        {badges?.map(({ color, text }, i) => (
          <Box key={`${text}-${i}`} mb={-1} mt={1} mr={1}>
            <Tag bg={color || 'gray'} size='sm'>
              {text}
            </Tag>
          </Box>
        ))}
      </Flex>
    </>
  );
};

export const Legend = ({ data: rawData }: { data: RawDataProps[] }) => {
  const data = formatPieChartData(rawData);
  const colors = [
    '#4e79a7',
    '#f28e2c',
    '#e15759',
    '#76b7b2',
    '#59a14f',
    '#edc949',
    '#af7aa1',
  ];
  // apply each color to each data object as object.value
  const dataWithColors = data.map((d, i) => {
    return {
      ...d,
      value: colors[i],
    };
  });

  // niaid sources
  const niaidRepos = NIAID_FUNDED.niaid.repositories.map(({ id }) => id);
  const niaidRepoInfo = NIAID_FUNDED.niaid['repositories'];

  const niaid_labels = dataWithColors.reduce((r, datum) => {
    if (datum.data) {
      datum.data.map(d => {
        if (niaidRepos.includes(d.term)) {
          d.abstract = niaidRepoInfo.find(({ id }) => id === d.term)?.abstract;
          d.genre = niaidRepoInfo.find(({ id }) => id === d.term)?.genre;
          r.push(d);
        }
      });
    }
    if (niaidRepos.includes(datum.term)) {
      datum.abstract = niaidRepoInfo.find(
        ({ id }) => id === datum.term,
      )?.abstract;
      datum.genre = niaidRepoInfo.find(({ id }) => id === datum.term)?.genre;
      r.push(datum);
    }
    return r;
  }, [] as { term: string; count: number; abstract?: string; value?: string; genre?: string[] }[]);
  const numSources = niaid_labels.length || 0;
  const numDatasets = niaid_labels.reduce((r, v) => (r += v.count), 0);

  // generalist sources
  const generalistRepos = NIAID_FUNDED.generalist.repositories.map(
    ({ id }) => id,
  );
  const generalistRepoInfo = NIAID_FUNDED.generalist['repositories'];

  const generalist_labels = dataWithColors.reduce((r, datum) => {
    if (datum.data) {
      datum.data.map(d => {
        if (generalistRepos.includes(d.term)) {
          d.abstract = generalistRepoInfo.find(
            ({ id }) => id === d.term,
          )?.abstract;
          d.genre = generalistRepoInfo.find(({ id }) => id === d.term)?.genre;
          r.push(d);
        }
      });
    }
    if (generalistRepos.includes(datum.term)) {
      datum.abstract = generalistRepoInfo.find(
        ({ id }) => id === datum.term,
      )?.abstract;
      datum.genre = generalistRepoInfo.find(
        ({ id }) => id === datum.term,
      )?.genre;
      r.push(datum);
    }
    return r;
  }, [] as { term: string; count: number; abstract?: string; value?: string; genre?: string[] }[]);
  const generalistNumSources = generalist_labels.length || 0;
  const generalistNumDatasets = generalist_labels.reduce(
    (r, v) => (r += v.count),
    0,
  );

  // iid sources
  const iidRepos = NIAID_FUNDED.iid.repositories.map(({ id }) => id);
  const iidReposInfo = NIAID_FUNDED.iid['repositories'];

  const iid_labels = dataWithColors.reduce((r, datum) => {
    if (datum.data) {
      datum.data.map(d => {
        if (iidRepos.includes(d.term)) {
          d.abstract = iidReposInfo.find(({ id }) => id === d.term)?.abstract;
          d.genre = iidReposInfo.find(({ id }) => id === d.term)?.genre;
          r.push(d);
        }
      });
    }
    if (iidRepos.includes(datum.term)) {
      datum.abstract = iidReposInfo.find(
        ({ id }) => id === datum.term,
      )?.abstract;
      datum.genre = iidReposInfo.find(({ id }) => id === datum.term)?.genre;
      r.push(datum);
    }
    return r;
  }, [] as { term: string; count: number; abstract?: string; value?: string; genre?: string[] }[]);
  const iidNumSources = iid_labels.length || 0;
  const iidNumDatasets = iid_labels.reduce((r, v) => (r += v.count), 0);

  // common fund sources
  // const commonFundRepos = NIAID_FUNDED.commonFund.repositories.map(({ id }) => id);
  // const commonFundInfo = NIAID_FUNDED.commonFund['repositories']

  // const commonFund_labels = dataWithColors.reduce((r, datum) => {
  //   if (datum.data) {
  //     datum.data.map(d => {
  //       if (commonFundRepos.includes(d.term)) {
  //         d.abstract = commonFundInfo.find(({ id }) => id === d.term)?.abstract
  //         d.genre = commonFundInfo.find(({ id }) => id === d.term)?.genre
  //         r.push(d);
  //       }
  //     });
  //   }
  //   if (commonFundRepos.includes(datum.term)) {
  //     datum.abstract = commonFundInfo.find(({ id }) => id === datum.term)?.abstract
  //     datum.genre = commonFundInfo.find(({ id }) => id === datum.term)?.genre
  //     r.push(datum);
  //   }
  //   return r;
  // }, [] as { term: string; count: number; abstract?: string; value?: string; genre?: string[]; }[]);
  // const commonFundNumSources = commonFund_labels.length || 0;
  // const commonFundNumDatasets = commonFund_labels.reduce((r, v) => (r += v.count), 0);
  // const borderStyles = {
  //   border: '1px solid',
  //   borderColor: 'gray.200',
  //   borderRadius: 'semi',
  //   p: 2,
  // };

  return (
    <Flex
      className='chart-legend'
      w='100%'
      minWidth={[200, 200, 300]}
      justifyContent={{ base: 'center', sm: 'space-between', md: 'center' }}
      flexDirection={{ base: 'column', md: 'row' }}
      flexWrap='wrap'
    >
      {/* Legend */}
      {/* <Flex
        flexDirection='column' */}
      {/* // minW={{ base: '500px' }}
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
              NIAID Funded Data
            </Heading>
          </Flex> */}

      {/* 1. niaid funded labels */}
      {/* <>
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
                    p={3}
                    justifyContent='space-between' */}
      {/* // p={2}
                  // justifyContent='space-around' */}
      {/* > */}
      {/* {niaid_labels.map((label, i) => {
                      return (
                        <Flex
                          // border={'1px solid red'}
                          key={`${label.term}-${i}`}
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
                            swatchColor={label.value || '#FF9DA7'}
                            badges={label.genre && label.genre.map(g => ({ text: g, color: 'gray.500' }))}
                            abstract={label.abstract}
                          /> */}
      {/* <Text fontSize={'xs'} mt={1}>
                            {label.abstract}
                          </Text> */}
      {/* </Flex>
                      );
                    })}
                  </Flex>
                </Flex>
              </Flex>
            </Box>
          </>
        </Box>
      </Flex> */}
      {/* Legend 2 */}
      <Flex
        flexDirection='column'
        // minW={{ base: '500px' }}
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
            <Heading size='h5' mx={4} color='text.body'>
              IID Domain Repositories
            </Heading>
          </Flex>

          {/* 2. iid labels */}
          <>
            <Box>
              <Flex flex={1} flexDirection='column'>
                <Flex flexDirection='row' p={2} justifyContent='space-around'>
                  {iidNumSources > 0 && (
                    <Text fontSize='sm'>
                      <Text as='span' fontWeight='bold' fontSize='xl' mr={1}>
                        {formatNumber(iidNumSources)}
                      </Text>{' '}
                      source{iidNumSources === 1 ? '' : 's'}
                    </Text>
                  )}

                  {iidNumDatasets > 0 && (
                    <Text fontSize='sm'>
                      <Text as='span' fontWeight='bold' fontSize='xl' mr={1}>
                        {formatNumber(iidNumDatasets)}
                      </Text>{' '}
                      dataset{iidNumDatasets === 1 ? '' : 's'}
                    </Text>
                  )}
                </Flex>
                <Flex bg='grey' flexWrap='wrap'>
                  <Flex
                    flex={1}
                    mt={1}
                    w='100%'
                    flexWrap='wrap'
                    bg='whiteAlpha.900'
                    p={3}
                    justifyContent='space-between'
                    // p={2}
                    // justifyContent='space-around'
                  >
                    {iid_labels.map((label, i) => {
                      return (
                        <Flex
                          key={`${label.term}-${i}`}
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
                            swatchColor={label.value || '#FF9DA7'}
                            badges={
                              label.genre &&
                              label.genre.map(g => ({
                                text: g,
                                color: 'gray.500',
                              }))
                            }
                            abstract={label.abstract}
                          />
                          {/* <Text fontSize={'xs'} mt={1}>
                            {label.abstract}
                          </Text> */}
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
      {/* Legend 3 */}
      <Flex
        flexDirection='column'
        // minW={{ base: '500px' }}
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
          <Flex direction={'column'}>
            <Heading size='h5' mx={4} color='text.body'>
              Generalist Data
            </Heading>
            <Text fontSize={'xs'} mx={4} color='text.body'>
              Caveat: Currently all datasets from general repositories are
              included, not only those related to infectious and immune-mediated
              diseases (IID).
            </Text>
          </Flex>

          {/* 3. generalist labels */}
          <>
            <Box>
              <Flex flex={1} flexDirection='column'>
                <Flex flexDirection='row' p={2} justifyContent='space-around'>
                  {generalistNumSources > 0 && (
                    <Text fontSize='sm'>
                      <Text as='span' fontWeight='bold' fontSize='xl' mr={1}>
                        {formatNumber(generalistNumSources)}
                      </Text>{' '}
                      source{generalistNumSources === 1 ? '' : 's'}
                    </Text>
                  )}

                  {generalistNumDatasets > 0 && (
                    <Text fontSize='sm'>
                      <Text as='span' fontWeight='bold' fontSize='xl' mr={1}>
                        {formatNumber(generalistNumDatasets)}
                      </Text>{' '}
                      dataset{generalistNumDatasets === 1 ? '' : 's'}
                    </Text>
                  )}
                </Flex>
                <Flex bg='grey' flexWrap='wrap'>
                  <Flex
                    flex={1}
                    mt={1}
                    w='100%'
                    flexWrap='wrap'
                    bg='whiteAlpha.900'
                    p={3}
                    justifyContent='space-between'
                    // p={2}
                    // justifyContent='space-around'
                  >
                    {generalist_labels.map((label, i) => {
                      return (
                        <Flex
                          key={`${label.term}-${i}`}
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
                            swatchColor={label.value || '#FF9DA7'}
                            badges={
                              label.genre &&
                              label.genre.map(g => ({
                                text: g,
                                color: 'gray.500',
                              }))
                            }
                            abstract={label.abstract}
                          />
                          {/* <Text fontSize={'xs'} mt={1}>
                            {label.abstract}
                          </Text> */}
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
      {/* Legend 4 */}
      {/* <Flex
        flexDirection='column' */}
      {/* // minW={{ base: '500px' }} */}
      {/* minW={{ base: '300px' }}
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
            <Heading size='h5' mx={4} color='text.body'>
              Common Fund Data
            </Heading>
          </Flex> */}

      {/* 4. common fund labels */}
      {/* <>
            <Box>
              <Flex flex={1} flexDirection='column'>
                <Flex flexDirection='row' p={2} justifyContent='space-around'>
                  {commonFundNumSources > 0 && (
                    <Text fontSize='sm'>
                      <Text as='span' fontWeight='bold' fontSize='xl' mr={1}>
                        {formatNumber(commonFundNumSources)}
                      </Text>{' '}
                      source{commonFundNumSources === 1 ? '' : 's'}
                    </Text>
                  )}

                  {commonFundNumDatasets > 0 && (
                    <Text fontSize='sm'>
                      <Text as='span' fontWeight='bold' fontSize='xl' mr={1}>
                        {formatNumber(commonFundNumDatasets)}
                      </Text>{' '}
                      dataset{commonFundNumDatasets === 1 ? '' : 's'}
                    </Text>
                  )}
                </Flex>
                <Flex bg='grey' flexWrap='wrap'>
                  <Flex
                    flex={1}
                    mt={1}
                    w='100%'
                    flexWrap='wrap'
                    bg='whiteAlpha.900'
                    p={3}
                    justifyContent='space-between' */}
      {/* // p={2}
                  // justifyContent='space-around' */}
      {/* >
                    {commonFund_labels.map((label, i) => {
                      return (
                        <Flex
                          key={`${label.term}-${i}`}
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
                            swatchColor={label.value || '#FF9DA7'}
                            badges={label.genre && label.genre.map(g => ({ text: g, color: 'gray.500' }))}
                            abstract={label.abstract}
                          /> */}
      {/* <Text fontSize={'xs'} mt={1}>
                            {label.abstract}
                          </Text> */}
      {/* </Flex>
                      );
                    })}
                  </Flex>
                </Flex>
              </Flex>
            </Box>
          </>
        </Box>
      </Flex> */}

      {/* 2. all legend labels */}
      {/* <Box
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
                      <Box w='100%' key={label.text}>
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
                </SimpleGrid> */}
      {/* grouped "other" type labels */}
      {/* {labels.map((label, i) => {
                  if (label.text.toLowerCase() !== 'other') {
                    return <React.Fragment key={i}></React.Fragment>;
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
          }} */}
      {/* </LegendOrdinal> */}
      {/* </Box> */}
    </Flex>
  );
};
