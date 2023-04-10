import React from 'react';
import { Box, Flex, Heading, Link, Tag, Text } from 'nde-design-system';
import { formatNumber } from 'src/utils/helpers';
import NextLink from 'next/link';
import { queryFilterObject2String } from 'src/components/filters';
import { formatPieChartData } from '../helpers';
import { RawDataProps } from '../types';
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

  // generalist sources
  const generalistRepos = NIAID_FUNDED.generalist.repositories.map(
    ({ id }) => id,
  );
  const generalistRepoInfo = NIAID_FUNDED.generalist['repositories'];
  const iidRepos = NIAID_FUNDED.iid.repositories.map(({ id }) => id);
  const iidReposInfo = NIAID_FUNDED.iid['repositories'];

  const generalist_labels = dataWithColors.reduce((r, datum) => {
    if (datum.data) {
      datum.data.map(d => {
        // if not specifically an iid repo, consider it a generalist repo. This is to account for repos that are added to api without config file info.
        // [TO DO]: Eventually this info will be set in the metadata and we won't need to hardcode it in a config file.
        if (!iidRepos.includes(d.term)) {
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

  return (
    <Flex
      className='chart-legend'
      w='100%'
      minWidth={[200, 200, 300]}
      justifyContent={{ base: 'center', sm: 'space-between', md: 'center' }}
      flexDirection={{ base: 'column', md: 'row' }}
      flexWrap='wrap'
    >
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
                      record{iidNumDatasets === 1 ? '' : 's'}
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
          <Flex flexDirection='column'>
            <Heading size='h5' mx={4} color='text.body'>
              Generalist Repositories
            </Heading>
            <Text fontSize={'xs'} mx={4} color='text.body'>
              Caveat: Currently all records from general repositories are
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
                      record{generalistNumDatasets === 1 ? '' : 's'}
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
    </Flex>
  );
};
