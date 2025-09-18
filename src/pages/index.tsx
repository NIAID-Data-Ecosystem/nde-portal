import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  Heading,
  Icon,
  Image,
  Stack,
  Text,
  VStack,
} from '@chakra-ui/react';
import HOMEPAGE_COPY from 'configs/homepage.json';
import HOME_QUERIES from 'configs/queries/home-queries.json';
import SCHEMA_DEFINITIONS from 'configs/schema-definitions.json';
import type { NextPage } from 'next';
import NextLink from 'next/link';
import React from 'react';
import { FaGithub, FaMagnifyingGlass, FaRegEnvelope } from 'react-icons/fa6';
import {
  getPageSeoConfig,
  PageContainer,
  PageContent,
} from 'src/components/page-container';
import { SearchBarWithDropdown } from 'src/components/search-bar';
import { useRepoData } from 'src/hooks/api/useRepoData';
import { useResourceCatalogs } from 'src/hooks/api/useResourceCatalogs';
import {
  fetchAllFeaturedPages,
  transformFeaturedContentForCarousel,
} from 'src/views/features/helpers';
import {
  LANDING_PAGE_CARDS_DATA,
  LandingPageCards,
} from 'src/views/home/components/cards';
import { HeroBanner } from 'src/views/home/components/HeroBanner';
import {
  fetchNews,
  // NewsCarousel,
} from 'src/views/home/components/NewsCarousel';

// import { TableWithSearch } from 'src/views/home/components/TableWithSearch/';
import { fetchEvents, NewsOrEventsObject } from './updates';

const Home: NextPage<{
  data: {
    news: NewsOrEventsObject[];
    events: NewsOrEventsObject[];
    features: NewsOrEventsObject[];
  };
  error?: { message: string };
}> = props => {
  /****** Resource Catalogs Data ******/
  const {
    isLoading: resourceCatalogsIsLoading,
    data: resourceCatalogs,
    error: resourceCatalogsError,
  } = useResourceCatalogs();

  /****** Repository Data ******/
  const {
    isLoading: repositoriesIsLoading,
    data: repositories,
    error: repositoriesError,
  } = useRepoData({ refetchOnWindowFocus: false, refetchOnMount: false });

  return (
    <PageContainer meta={getPageSeoConfig('/')} overflowX='hidden'>
      {/**** Hero banner + search bar *****/}
      <HeroBanner
        title={HOMEPAGE_COPY.sections.hero.heading}
        subtitle={HOMEPAGE_COPY.sections.hero.subtitle}
      >
        <Stack
          flexDirection='column'
          w='100%'
          alignItems='flex-start'
          gap={{ base: 4, sm: 2 }}
          zIndex={2}
        >
          <Flex w='100%' flexDirection='column' maxWidth='1000px'>
            <SearchBarWithDropdown
              placeholder='Search for resources'
              ariaLabel='Search for resources'
              size='md'
              showOptionsMenu
              showSearchHistory
              optionMenuProps={{
                colorPalette: 'primary',
                buttonProps: {
                  borderRadius: 'full',
                  colorPalette: 'primary',
                  my: 2,
                },
                label: 'Type',
                description: SCHEMA_DEFINITIONS['type'].abstract['Dataset'],
                showSelectAll: true,
                options: [
                  {
                    name: 'Computational Tool Repository',
                    value: 'ComputationalTool',
                    property: '@type',
                  },
                  {
                    name: 'Dataset Repository',
                    value: 'Dataset',
                    property: '@type',
                  },
                  {
                    name: 'Resource Catalog',
                    value: 'ResourceCatalog',
                    property: '@type',
                  },
                ],
              }}
            />
          </Flex>
          <Box>
            <Text fontWeight='semibold'>Try these searches:</Text>
            <Stack flexDirection='row' flexWrap={'wrap'}>
              {HOME_QUERIES.map(query => {
                return (
                  <Button
                    key={query.title}
                    asChild
                    size={{ base: 'xs', sm: '2xs' }}
                    colorPalette='niaid'
                  >
                    <NextLink
                      href={{
                        pathname: `/search`,
                        query: { q: query.searchTerms.join(' OR ') },
                      }}
                    >
                      <Icon as={FaMagnifyingGlass} />
                      {query.title}
                    </NextLink>
                  </Button>
                );
              })}
            </Stack>
          </Box>

          <Button asChild size={{ base: 'xs', sm: '2xs' }} mt={2}>
            <NextLink href={{ pathname: '/advanced-search' }}>
              <Icon as={FaMagnifyingGlass} />
              Advanced Search
            </NextLink>
          </Button>
        </Stack>
      </HeroBanner>
      <>
        {/**** Repositories Table section *****/}
        {!(repositoriesError || resourceCatalogsError) && (
          <PageContent
            flexDirection='column'
            bg='#fff'
            mb={20}
            alignItems='center'
          >
            <Box maxW='1300px' width='100%'>
              <Stack gap={8} px={{ base: 2, sm: 4 }} mb={{ base: 8, sm: 8 }}>
                {/* Getting Started Card */}
                {LANDING_PAGE_CARDS_DATA['getting-started']?.data.map(
                  (card, i) => (
                    <LandingPageCards.Card
                      key={`getting-started-${i}`}
                      card={card}
                    />
                  ),
                )}
                {/* Topic Cards */}
                <LandingPageCards.Wrapper
                  heading={LANDING_PAGE_CARDS_DATA['topics']?.heading}
                >
                  {LANDING_PAGE_CARDS_DATA['topics']?.data.map((card, i) => (
                    <LandingPageCards.Card
                      key={`landing-card-${i}`}
                      card={card}
                    />
                  ))}
                </LandingPageCards.Wrapper>
              </Stack>
              {/* <Box px={{ base: 2, sm: 4 }}>
                <Heading as='h2' fontSize='2xl' fontWeight='semibold' mb={4}>
                  Explore All Included Resources
                </Heading>
                <Text lineHeight='short'>
                  The following <strong>Resource Catalogs</strong> (collections
                  of scientific information or research outputs) and{' '}
                  <strong>Dataset Repositories</strong> (collections of data of
                  a particular experimental type) are currently included in the
                  NIAID Data Ecosystem
                </Text>
                <Flex justifyContent='flex-end' fontSize='sm' />
                <Divider my={4} />

                <TableWithSearch
                  ariaLabel='List of repositories and resource catalogs'
                  caption='List of repositories and resource catalogs'
                  data={[...(resourceCatalogs || []), ...(repositories || [])]}
                  isLoading={repositoriesIsLoading || resourceCatalogsIsLoading}
                  columns={[
                    {
                      title: 'name',
                      property: 'name',
                      isSortable: true,
                      props: { maxW: '280px', minW: '280px' },
                    },
                    {
                      title: 'description',
                      property: 'abstract',
                    },
                    {
                      title: 'Type',
                      property: 'type',
                      isSortable: true,
                      props: { maxW: '180px', minW: '180px' },
                    },
                    {
                      title: 'Research Domain',
                      property: 'domain',
                      isSortable: true,
                      props: { maxW: '225px', minW: '225px' },
                    },
                    {
                      title: 'access',
                      property: 'conditionsOfAccess',
                      isSortable: true,
                      props: { maxW: '150px', minW: '150px' },
                    },
                  ]}
                />

                <ButtonGroup
                  spacing={[0, 2]}
                  flexWrap={['wrap', 'nowrap']}
                  w='100%'
                  display='flex'
                  justifyContent='flex-end'
                  mt={4}
                >
                  {HOMEPAGE_COPY.sections.help.routes.map(
                    (
                      route: {
                        title: string;
                        path: string;
                        isExternal?: boolean;
                      },
                      index,
                    ) => {
                      const icon = route.title.includes('question')
                        ? FaRegEnvelope
                        : FaGithub;
                      return (
                        <Box key={route.title} w={['100%', 'unset']}>
                          <NextLink
                            href={route.path}
                            passHref
                            target={route.isExternal ? '_blank' : '_self'}
                          >
                            <Button
                              w='100%'
                              minWidth='150px'
                              size='sm'
                              variant={index % 2 ? 'solid' : 'outline'}
                              my={[1, 2, 0]}
                              maxWidth={['unset', '250px']}
                              leftIcon={<Icon as={icon} />}
                            >
                              {route.title}
                            </Button>
                          </NextLink>
                        </Box>
                      );
                    },
                  )}
                </ButtonGroup>
              </Box> */}

              {/* NEWS */}
              {/* {!props?.error?.message && props.data?.news && (
                <NewsCarousel
                  news={props.data.news}
                  events={props.data.events}
                  features={props.data.features}
                />
              )} */}
            </Box>
          </PageContent>
        )}
      </>
    </PageContainer>
  );
};

export async function getStaticProps() {
  try {
    const features = await fetchAllFeaturedPages({
      paginate: { page: 1, pageSize: 5 },
    });

    const { news } = await fetchNews({ paginate: { page: 1, pageSize: 5 } });

    const events = await fetchEvents({ paginate: { page: 1, pageSize: 100 } })
      .then(res => ({ data: res.events, error: null }))
      .catch(err => {
        return {
          data: [],
          error: {
            message: `${err.response.status} : ${err.response.statusText}`,
            status: err.response.status,
          },
        };
      });

    return {
      props: {
        data: {
          news,
          events: events.data,
          features: transformFeaturedContentForCarousel(features),
        },
      },
    };
  } catch (err: any) {
    return {
      props: {
        data: [],
        error: {
          type: 'error',
          message: '' + err,
        },
      },
    };
  }
}

export default Home;
