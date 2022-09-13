import React from 'react';
import {
  Box,
  Flex,
  Heading,
  Link,
  SimpleGrid,
  Text,
  Wrap,
  WrapItem,
} from 'nde-design-system';
import { LegendOrdinal, LegendItem } from '@visx/legend';
import { formatNumber } from 'src/utils/helpers';
import NextLink from 'next/link';
import { queryFilterObject2String } from 'src/components/filter';
import { colorScale, formatPieChartData, getCount } from '../helpers';
import { RawDataProps } from '../types';

export const Legend = ({ data: rawData }: { data: RawDataProps[] }) => {
  const data = formatPieChartData(rawData);

  const Label = ({
    text,
    count,
    source,
  }: {
    text: string;
    source: string;
    count: number;
  }) => {
    return (
      <>
        {source ? (
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
                _visited={{ color: 'text.body' }}
              >
                <Text lineHeight='short' fontWeight='semibold' cursor='pointer'>
                  {text}
                </Text>
              </Link>
            </NextLink>
          </Box>
        ) : (
          <Text lineHeight='short' fontWeight='semibold'>
            {text}
          </Text>
        )}
        <Text lineHeight='shorter' fontSize='sm' fontWeight='normal'>
          {formatNumber(count)} records
        </Text>
      </>
    );
  };
  return (
    <Flex
      id='chart-legend'
      w='100%'
      my={4}
      mx={[4, 4, 8]}
      minWidth={[200, 200, 300]}
      maxW={{ base: 600, lg: 'unset' }}
      flexDirection={{ base: 'column', lg: 'row' }}
    >
      {/* Legend */}
      <Box mr={[0, 0, 0, 6]}>
        <LegendOrdinal scale={colorScale(data)} direction='column'>
          {labels => (
            <>
              {labels.map((label, i) => {
                if (!label || label.text === 'Other') {
                  return;
                }
                const datum = data.filter(d => d.term === label.text)[0];

                return (
                  <Flex key={i} my={4}>
                    {/* swatch color */}
                    <LegendItem alignItems='start'>
                      <Box
                        width={5}
                        height={5}
                        minWidth={5}
                        minHeight={5}
                        bg={label.value}
                        m={2}
                        mr={4}
                      />
                    </LegendItem>

                    <Box w='100%'>
                      <Label
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
                            templateColumns={{ md: 'repeat(2, 215px)' }}
                            spacingY={2}
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
                  </Flex>
                );
              })}
            </>
          )}
        </LegendOrdinal>
      </Box>
      <Box ml={[0, 0, 0, 6]}>
        <LegendOrdinal scale={colorScale(data)} direction='column'>
          {labels => (
            <>
              {labels.map((label, i) => {
                if (!label || label.text !== 'Other') {
                  return;
                }
                const datum = data.filter(d => d.term === label.text)[0];

                return (
                  <Flex key={i} my={4}>
                    {/* swatch color */}
                    <LegendItem alignItems='start'>
                      <Box
                        width={5}
                        height={5}
                        minWidth={5}
                        minHeight={5}
                        bg={label.value}
                        m={2}
                        mr={4}
                      />
                    </LegendItem>

                    <Box w='100%'>
                      <Label
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
                            templateColumns={{ md: 'repeat(2, 215px)' }}
                            spacingY={2}
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
                      {i === data.length - 1 && (
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
                  </Flex>
                );
              })}
            </>
          )}
        </LegendOrdinal>
      </Box>
    </Flex>
  );
};
