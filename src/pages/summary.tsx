import React, { useEffect, useState } from 'react';
import type { NextPage } from 'next';
import {
  PageContainer,
  PageContent,
  PageHeader,
  SearchQueryLink,
} from 'src/components/page-container';
import { assetPrefix } from 'next.config';
import {
  displayQueryString,
  useFilterString,
  useQueryString,
} from 'src/components/summary-page/useRouterQuery';
import { Flex, SearchInput, Text } from 'nde-design-system';
import { SummaryTable } from 'src/components/summary-page';
import { useHasMounted } from 'src/hooks/useHasMounted';
import { useRouter } from 'next/router';
import { queryFilterObject2String } from 'src/components/search-results-page/components/filters/helpers';
import { useQuery } from 'react-query';
import { FetchSearchResultsResponse } from 'src/utils/api/types';
import { fetchSearchResults } from 'src/utils/api';

// const results = useRouterQuery({
//   queryString: '__all__',
//   selectedPage: 1,
//   selectedPerPage: 10,
//   facets: Object.keys(filtersConfig),
//   facetSize: FACET_SIZE,
//   sortOrder: '_score',
// });

const SummaryPage: NextPage = () => {
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
      title: 'CREID',
      'funding.identifier': [
        'U01AI151810',
        'AI151810',
        'U01AI151812',
        'AI151812',
        'U01AI151788',
        'AI151788',
        'U01AI151698',
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

  // List of needed filters/naming convention.
  const filtersConfig: {
    [key: string]: {
      name: string;
    };
  } = {
    'includedInDataCatalog.name': { name: 'Source' },
    // 'funding.identifier': {
    //   name: 'Funding ID',
    // },
    'measurementTechnique.name': {
      name: 'Measurement Technique',
    },
    variableMeasured: { name: 'Variable Measured' },
  };

  // Check if component has mounted
  const hasMounted = useHasMounted();
  const router = useRouter();

  // Returns a [queryString] formatted for querying the api and a handler function to update the route.
  const [queryString, setQueryString] = useQueryString('__all__');

  // Default facet size
  const FACET_SIZE = 1000;
  const [filters] = useFilterString(filtersConfig);
  // [formatted_query] for display purposes.
  const formatted_query = displayQueryString(queryString) || '';

  // Search term + handler for string entered in search bar
  const [searchTerm, setSearchTerm] = useState(formatted_query || '');
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void =>
    setSearchTerm(e.target.value);

  useEffect(() => {
    // Update search term with router term
    setSearchTerm(formatted_query);
  }, [formatted_query]);

  // Get facets for loading filters.
  const { isLoading, error, data } = useQuery<
    FetchSearchResultsResponse | undefined,
    Error
  >(
    [
      'search-results',
      {
        q: queryString,
        filters: filters,
      },
    ],
    () => {
      if (typeof queryString !== 'string' && !queryString) {
        return;
      }
      const filter_string = queryFilterObject2String(filters);

      return fetchSearchResults({
        q: filter_string
          ? `${
              queryString === '__all__' ? '' : `${queryString} AND `
            }${filter_string}`
          : `${queryString}`,
        facet_size: FACET_SIZE,
        facets: Object.keys(filtersConfig).join(','),
      });
    },
    // Don't refresh everytime window is touched.
    { refetchOnWindowFocus: false },
  );

  if (!hasMounted || !router.isReady) {
    return null;
  }
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
                  setQueryString(searchTerm.trim());
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
                      onClick={() => {
                        const str = queryFilterObject2String({
                          'funding.identifier': query['funding.identifier'],
                        });
                        str && setQueryString(str);
                      }}
                    />
                  );
                })}
              </Flex>
            </>
          </PageHeader>
        </section>

        <section id='search-overview'>
          <PageContent minH='unset'>
            You searched for {formatted_query}.
          </PageContent>
          <Flex></Flex>
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
        {/* <SummaryTable queryString={queryString} filters={filters} /> */}
      </PageContainer>
    </>
  );
};

export default SummaryPage;
