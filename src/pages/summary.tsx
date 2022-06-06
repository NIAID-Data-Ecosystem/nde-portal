import React, { useState } from 'react';
import type { NextPage } from 'next';
import {
  PageContainer,
  PageContent,
  PageHeader,
  SearchQueryLink,
} from 'src/components/page-container';
import { useQueries } from 'react-query';
import { fetchSearchResults } from 'src/utils/api';
import {
  Box,
  Flex,
  Heading,
  SearchInput,
  Skeleton,
  Text,
  theme,
} from 'nde-design-system';
import { Error, ErrorCTA } from 'src/components/error';
import { queryFilterObject2String } from 'src/components/search-results-page/components/filters/helpers';
import { assetPrefix } from 'next.config';
import { useRouter } from 'next/router';
import { SummaryTable } from 'src/components/summary-page';

const sample_queries = [
  {
    title: 'SysBio',
    'funding.identifier': [
      'U01AI124255',
      'AI124255',
      'U01AI124275',
      'AI124275',
      'U01AI124290',
      'AI124290',
      'U01AI124302',
      'AI124302',
      'U01AI124316',
      'AI124316',
      'U19AI135972',
      'AI135972',
      'U19AI135976',
      'AI135976',
      'U19AI135990',
      'AI135990',
      'U19AI135995',
      'AI135995',
      'U19AI135964',
      'AI135964',
    ],
  },
  {
    // [TO DO]: AI identifier? Ask Laura
    title: 'CREID',
    'funding.identifier': [
      'U01AI151810',
      'U01AI151812',
      'U01AI151788',
      'U01AI151698',
      'U01AI151807',
      'U01AI151797',
      'U01AI151801',
      'U01AI151758',
      'U01AI151799',
      'U01AI151814',
    ],
  },
];

const SummaryPage: NextPage = () => {
  const router = useRouter();
  // Search term entered in search bar
  const [searchTerm, setSearchTerm] = useState('');
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void =>
    setSearchTerm(e.target.value);

  // const [queryString, setQueryString] = useRouterQuery

  // const results = useQueries(
  //   sample_queries.map(query => {
  //     let querystring =
  //       query['funding.identifier'] &&
  //       queryFilterObject2String({
  //         'funding.identifier': query['funding.identifier'],
  //       });

  //     return {
  //       queryKey: ['funding', querystring],
  //       queryFn: () => querystring && fetchSearchResults({ q: querystring }),
  //     };
  //   }),
  // );

  return (
    <>
      <PageContainer
        hasNavigation
        title='Visual Summary'
        metaDescription='Visual summary of queries.'
        disableSearchBar
      >
        {/* Header + search bar */}
        <section id='search-header'>
          <PageHeader
            title={'Visual Summary'}
            subtitle={'Search for datasets and gather insights.'}
            bgImg={`${assetPrefix}/assets/summary-bg-01.png`}
          >
            <>
              <SearchInput
                w='100%'
                isResponsive={false}
                colorScheme='secondary'
                ariaLabel='Search for grants, datasets or tools.'
                placeholder='Visualize your search'
                value={searchTerm}
                handleChange={handleChange}
                handleSubmit={e => {
                  e.preventDefault();

                  router.push({
                    pathname: `/summary`,
                    query: { q: searchTerm.trim(), from: 1 },
                  });
                }}
              />
              <Flex mt={2} flexWrap={['wrap']}>
                <Text color='whiteAlpha.800' mr={2}>
                  Try:
                </Text>
                {sample_queries.map((query, i) => {
                  return (
                    <SearchQueryLink
                      key={query.title}
                      title={query.title}
                      href={{
                        pathname: `/summary`,
                        query: { q: query['funding.identifier'].join(' OR ') },
                      }}
                    />
                  );
                })}
              </Flex>
            </>
          </PageHeader>
        </section>

        {/* Visualizations */}
        {/* <Box w='100%' p={6}>
              <Flex>
                {isLoading ? (
                  <LoadingSpinner isLoading={isLoading}></LoadingSpinner>
                ) : (
                  data?.results && (
                    <PieChart
                      data={data?.results}
                      filterByType={type => {
                        setFilters(prev => {
                          if (type && filters['@type'].includes(type)) {
                            return {
                              ...prev,
                              '@type': filters['@type'].filter(t => t !== type),
                            };
                          }
                          return {
                            ...prev,
                            '@type': type ? [type] : [],
                          };
                        });
                      }}
                    />
                  )
                )}
                <Flex
                  color='white'
                  flex={1}
                  justifyContent='center'
                  alignItems='center'
                >
                  [TO DO] : datasets by date histogram - Dropdowns for:
                  measurement technique, grant
                </Flex>
              </Flex>
            </Box>
            <Center my={6}>
              <Divider w='90%' />
            </Center>
            {/* Zoomable Packing Circle */}
        {/* <Box w={'100%'} h={1600} mb={10}>
              {data?.results && <CirclePacking data={data.results} />}
            </Box> */}

        {/* Clustered Network graph */}
        {/* <Box w={'100%'} h={980}>
              {data?.results && <Network data={data.results} />}
            </Box> */}
        {/* Clustered Network no labels */}
        {/* <Box w={'100%'} h={980}>
              {data?.results && <NetworkNoLabels data={data.results} />}
            </Box> */}

        {/* Original Network graph */}
        {/* <Box w={'100%'} h={980} border='2px solid' borderColor='gray.200'>
              {data?.results && <NetworkGraph data={data.results} />}
            </Box>
          </Box> */}

        {/* SummaryTable */}
        <SummaryTable sample_query={sample_queries[0]} />
      </PageContainer>
    </>
  );
};

export default SummaryPage;
