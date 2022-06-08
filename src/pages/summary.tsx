import React, { useEffect, useState } from 'react';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import {
  PageContainer,
  PageContent,
  PageHeader,
  SearchQueryLink,
} from 'src/components/page-container';
import { assetPrefix } from 'next.config';
import {
  Box,
  Center,
  Divider,
  Flex,
  SearchInput,
  Text,
} from 'nde-design-system';
import {
  SummaryTable,
  Filters,
  displayQueryString,
  useFilterString,
  useQueryString,
  PieChart,
  Network,
} from 'src/components/summary-page';
import { useHasMounted } from 'src/hooks/useHasMounted';
import { queryFilterObject2String } from 'src/components/filter';

/*
 [COMPONENT INFO]:
 Summary Page displays data using visualizations so that the user can gather some insights.

 All vis share the same query string and filtering mechanism so that they update together. The table also updates accordingly.
*/

const SummaryPage: NextPage = () => {
  // Grant queries of interest.
  const suggestedQueries = [
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
    'funding.funder.name': { name: 'Funding' },
    'infectiousAgent.name': { name: 'Pathogen' },
    'measurementTechnique.name': {
      name: 'Measurement Technique',
    },
  };

  /*
  This hook updates the url when a query string is changed. Note that when a query string is changed, we also update pagination and filters to their default state.
  */
  const [queryString, setQueryString] = useQueryString('__all__');

  /*
  This hook updates the url to reflect the currently selected filters and keeps track of filters state.
  */
  const [filters, updateFilters] = useFilterString(filtersConfig);

  // [queryString] formatted for display purposes.
  const formatted_query = displayQueryString(queryString) || '';

  // Handle state for search input using url query string as default.
  const [searchTerm, setSearchTerm] = useState(formatted_query || '');
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void =>
    setSearchTerm(e.target.value);

  // Update search term to reflect url term.
  useEffect(() => {
    setSearchTerm(formatted_query);
  }, [formatted_query]);

  // Check if component has mounted and router has needed info.
  const hasMounted = useHasMounted();
  const router = useRouter();
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
                {suggestedQueries.map((query, i) => {
                  return (
                    <SearchQueryLink
                      key={query.title}
                      title={query.title}
                      onClick={() => {
                        const str = queryFilterObject2String({
                          'funding.identifier': query['funding.identifier'],
                        });
                        if (str) {
                          setQueryString(str);
                        }
                      }}
                    />
                  );
                })}
              </Flex>
            </>
          </PageHeader>
        </section>

        {/* Visualizations */}
        <section id='data-visualizations'>
          <Box w='100%' p={6} bg='tertiary.900'>
            <Flex flexWrap={'wrap'}>
              <Flex
                p={6}
                minW='400px'
                minH='400px'
                justifyContent='center'
                alignItems='center'
                flex={1}
                bg='tertiary.800'
              >
                <PieChart queryString={queryString} filters={filters} />
              </Flex>
              <Flex
                color='white'
                flex={1}
                p={6}
                minW='400px'
                justifyContent='center'
                alignItems='center'
              >
                [TO DO] : datasets by date histogram.
              </Flex>
            </Flex>
            <Center my={6}>
              <Divider w='90%' />
            </Center>
            {/* Clustered Network graph */}
            <Box w={'100%'} h={980}>
              <Network queryString={queryString} filters={filters} />
              {/* <BarChart /> */}
            </Box>
          </Box>
          {/* Zoomable Packing Circle */}
          {/* <Box w={'100%'} h={1600} mb={10}>
              {data?.results && <CirclePacking data={data.results} />}
            </Box> */}

          {/* Clustered Network no labels */}
          {/* <Box w={'100%'} h={980}>
              {data?.results && <NetworkNoLabels data={data.results} />}
            </Box> */}

          {/* Original Network graph */}
          {/* <Box w={'100%'} h={980} border='2px solid' borderColor='gray.200'>
              {data?.results && <NetworkGraph data={data.results} />}
            </Box> */}
          {/* </Box> */}
        </section>
        <section id='search-filters'>
          <PageContent minH='unset' bg='white'>
            <Filters
              queryString={queryString}
              filters={filters}
              facets={Object.keys(filtersConfig).join(',')}
              handleSelectedFilters={updateFilters}
            />
          </PageContent>
        </section>

        {/* SummaryTable */}
        <section id='datasets-table'>
          <SummaryTable queryString={queryString} filters={filters} />
        </section>
      </PageContainer>
    </>
  );
};

export default SummaryPage;