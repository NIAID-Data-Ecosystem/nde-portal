import { useState } from 'react';
import type { NextPage } from 'next';
import { Box, Button, Flex, Text, useBreakpointValue } from 'nde-design-system';
import {
  PageHeader,
  PageContainer,
  PageContent,
  SearchQueryLink,
} from 'src/components/page-container';
import homepageCopy from 'configs/homepage.json';
import { fetchSearchResults } from 'src/utils/api';
import { useQuery } from 'react-query';
import { FetchSearchResultsResponse } from 'src/utils/api/types';
import LoadingSpinner from 'src/components/loading';
import {
  StyledSection,
  StyledSectionHeading,
  StyledBody,
  StyledSectionButtonGroup,
  PieChart,
  Legend,
} from 'src/components/pie-chart';
import NextLink from 'next/link';
import { SearchBarWithDropdown } from 'src/components/search-bar';
import { AdvancedSearchOpen } from 'src/components/advanced-search/components/buttons';

const sample_queries = [
  {
    title: 'Asthma',
    searchTerms: ['"Asthma"'],
  },
  {
    title: 'COVID-19',
    searchTerms: [
      '"SARS-CoV-2"',
      '"Covid-19"',
      '"Wuhan coronavirus"',
      '"Wuhan pneumonia"',
      '"2019-nCoV"',
      '"HCoV-19"',
    ],
  },
  {
    title: 'HIV/AIDS',
    searchTerms: ['"HIV"', '"AIDS"'],
  },
  { title: 'Influenza', searchTerms: ['"Influenza"', '"Flu"'] },
  {
    title: 'Malaria',
    searchTerms: [
      '"Malaria"',
      '"Plasmodium falciparum"',
      '"Plasmodium malariae"',
      '"Plasmodium ovale curtisi"',
      '"Plasmodium ovale wallikeri"',
      '"Plasmodium vivax"',
      '"Plasmodium knowlesi"',
    ],
  },
  {
    title: 'Tuberculosis',
    searchTerms: [
      '"Tuberculosis"',
      '"Mycobacterium bovis"',
      '"Mycobacterium africanum"',
      '"Mycobacterium canetti"',
      '"Mycobacterium microti"',
      '"Phthisis"',
    ],
  },
];

const Home: NextPage = () => {
  const size = useBreakpointValue({ base: 300, lg: 350 });

  // Fetch stats about number of resources
  const params = {
    q: '__all__',
    size: 0,
    facets: ['includedInDataCatalog.name'].join(','),
    facet_size: 20,
  };

  interface Stat {
    term: string;
    count: number;
    stats?: Stat[];
  }

  interface Stats {
    repositories: Stat | null;
  }

  const [stats, setStats] = useState<Stats>({
    repositories: null,
  });

  const { isLoading, error } = useQuery<
    FetchSearchResultsResponse | undefined,
    Error
  >({
    queryKey: ['stats', params],
    queryFn: () => fetchSearchResults(params),
    onSuccess: data => {
      let stat = { ...stats };
      if (data) {
        const { facets } = data;

        const sources = [...facets['includedInDataCatalog.name'].terms];

        // Get number of repositories
        const repositories = {
          term: 'Repositories',
          count: sources.length,
          stats: sources,
        };
        stat = {
          repositories,
        };
      }

      setStats(stat);
    },
  });

  return (
    <>
      <PageContainer
        hasNavigation
        title='Home'
        metaDescription='Find and access allergic, infectious and immune-mediated disease data by searching across biomedical data repositories with the NIAID Data Discovery Portal'
        keywords='omics, data, infectious disease, epidemiology, clinical trial, immunology, bioinformatics, surveillance, search, repository'
        disableSearchBar
      >
        <PageHeader
          title={homepageCopy.sections[0].heading}
          subtitle={homepageCopy.sections[0].subtitle}
          body={[homepageCopy.sections[0].body]}
        >
          <>
            <Flex w='100%' justifyContent='flex-end' mb={2}>
              <NextLink href={{ pathname: 'advanced-search' }} passHref>
                <Box>
                  <AdvancedSearchOpen
                    onClick={() => {}}
                    variant='outline'
                    bg='whiteAlpha.500'
                    color='white'
                    _hover={{ bg: 'whiteAlpha.800', color: 'primary.600' }}
                  />
                </Box>
              </NextLink>
            </Flex>
            <SearchBarWithDropdown
              placeholder='Search for datasets'
              ariaLabel='Search for datasets'
              size='md'
            />

            {/* [NOTE]: Test with autocomplete in the future */}
            {/* <SearchWithPredictiveText
              ariaLabel='Search for datasets'
              placeholder='Search for datasets'
              size='md'
              handleSubmit={(stringValue, __, data) => {
                if (data && data.id) {
                  router.push({
                    pathname: `/resources`,
                    query: { id: `${data.id}` },
                  });
                } else {
                  router.push({
                    pathname: `/search`,
                    query: { q: `${stringValue.trim()}` },
                  });
                }
              }}
            /> */}

            <Flex mt={2} flexWrap={['wrap']}>
              <Text color='whiteAlpha.800' mr={2}>
                Try:
              </Text>
              {sample_queries.map((query, i) => {
                return (
                  <NextLink
                    key={query.title}
                    href={{
                      pathname: `/search`,
                      query: { q: query.searchTerms.join(' OR ') },
                    }}
                    passHref
                  >
                    <Box>
                      <SearchQueryLink
                        title={query.title}
                        display={[i > 2 ? 'none' : 'block', 'block']}
                      />
                    </Box>
                  </NextLink>
                );
              })}
            </Flex>
          </>
        </PageHeader>

        {/* Data repository viz section */}
        {error ? (
          <></>
        ) : (
          <PageContent
            bg='page.alt'
            minH='unset'
            flexDirection='column'
            alignItems='center'
          >
            <StyledSection
              id='explore-date'
              flexDirection={{ base: 'column', lg: 'column' }}
            >
              <Flex
                width='100%'
                flexDirection={{ base: 'column', lg: 'row-reverse' }}
                justifyContent={{ lg: 'center' }}
                flex={1}
                alignItems='center'
                maxW={{ base: 'unset', lg: '1400px' }}
              >
                <LoadingSpinner isLoading={isLoading}>
                  {/* Pie chart with number repositories and associated resources*/}
                  {stats?.repositories?.stats && (
                    <PieChart
                      width={size || 200}
                      height={size || 200}
                      data={stats.repositories.stats.sort(
                        (a, b) => b.count - a.count,
                      )}
                    />
                  )}
                </LoadingSpinner>
                {/* Legend display for smaller screen size */}
                <Flex
                  display={{ base: 'flex', lg: 'none' }}
                  w='100%'
                  justifyContent='center'
                >
                  {stats?.repositories?.stats && (
                    <Legend
                      data={stats.repositories.stats.sort(
                        (a, b) => b.count - a.count,
                      )}
                    />
                  )}
                </Flex>
                <StyledBody
                  maxWidth={['unset', 'unset', '700px', '600px']}
                  textAlign={['start', 'start', 'center', 'start']}
                  m={2}
                >
                  <StyledSectionHeading mt={6}>
                    {homepageCopy.sections[1].heading}
                  </StyledSectionHeading>
                  <StyledSectionButtonGroup
                    justifyContent={[
                      'flex-start',
                      'flex-start',
                      'center',
                      'flex-start',
                    ]}
                    flexWrap={['wrap', 'nowrap']}
                    maxWidth={['unset', 'unset', '400px', '400px']}
                  >
                    {homepageCopy.sections[1]?.routes &&
                      homepageCopy.sections[1].routes.map(
                        (
                          route: {
                            title: string;
                            path: string;
                            isExternal?: boolean;
                          },
                          index,
                        ) => {
                          return (
                            <NextLink
                              key={route.title}
                              href={route.path}
                              passHref
                            >
                              <Button
                                w='100%'
                                variant={index % 2 ? 'solid' : 'outline'}
                                size='sm'
                                m={[0, 2, 0]}
                                my={[1, 2, 0]}
                                py={[6]}
                                maxWidth={['200px', '200px', '400px', '400px']}
                              >
                                {route.title}
                              </Button>
                            </NextLink>
                          );
                        },
                      )}
                  </StyledSectionButtonGroup>
                </StyledBody>
              </Flex>
            </StyledSection>
            {/* Legend display for larger screen size */}
            <Flex
              display={{ base: 'none', lg: 'flex' }}
              w='100%'
              justifyContent={{ base: 'center', md: 'space-between' }}
            >
              {stats?.repositories?.stats && (
                <Legend
                  data={stats.repositories.stats.sort(
                    (a, b) => b.count - a.count,
                  )}
                ></Legend>
              )}
            </Flex>
          </PageContent>
        )}
      </PageContainer>
    </>
  );
};

export default Home;
