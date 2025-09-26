import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  Icon,
  Stack,
  Text,
} from '@chakra-ui/react';
import SCHEMA_DEFINITIONS from 'configs/schema-definitions.json';
import type { NextPage } from 'next';
import NextLink from 'next/link';
import React from 'react';
import { FaMagnifyingGlass } from 'react-icons/fa6';
import { fetchAllUpdates } from 'src/api/updates';
import { UpdatesQueryResponse } from 'src/api/updates/types';
import {
  getPageSeoConfig,
  PageContainer,
  PageContent,
} from 'src/components/page-container';
import { SearchBarWithDropdown } from 'src/components/search-bar';
import { Section as LandingPageSection } from 'src/components/section';
import { useRepoData } from 'src/hooks/api/useRepoData';
import { useResourceCatalogs } from 'src/hooks/api/useResourceCatalogs';
import { LandingPageCard } from 'src/views/home/components/card';
import { UpdatesCarousel } from 'src/views/home/components/carousel';
import { HeroBanner } from 'src/views/home/components/hero-banner';
import { TableWithSearch } from 'src/views/home/components/table-with-search/';
import { LANDING_PAGE_DATA } from 'src/views/home/data';

const Home: NextPage<{
  data: UpdatesQueryResponse;
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
        title={LANDING_PAGE_DATA.SECTIONS.hero.heading}
        subtitle={LANDING_PAGE_DATA.SECTIONS.hero.subheading}
      >
        <Stack
          flexDirection='column'
          w='100%'
          alignItems='flex-start'
          gap={{ base: 4, sm: 2 }}
          zIndex={2}
        >
          <Flex w='100%' flexDirection='column' maxWidth='1000px'>
            {/* Search bar */}
            <SearchBarWithDropdown
              placeholder='Search for resources'
              ariaLabel='Search for resources'
              size='xl'
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
          {/* Sample queries */}
          <Box>
            <Text fontWeight='semibold'>Try these searches:</Text>
            <Stack flexDirection='row' flexWrap={'wrap'}>
              {LANDING_PAGE_DATA.SAMPLE_QUERIES.map(query => {
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
        {!(repositoriesError || resourceCatalogsError) && (
          <PageContent
            flexDirection='column'
            bg='#fff'
            mb={20}
            alignItems='center'
          >
            <Stack
              gap={8}
              px={{ base: 2, sm: 4 }}
              mb={{ base: 8, sm: 8 }}
              maxW='1300px'
              width='100%'
            >
              {/* Getting Started LandingPageCard */}
              {LANDING_PAGE_DATA.SECTIONS['getting-started']?.data?.map(
                (card, i) => (
                  <LandingPageCard key={`getting-started-${i}`} {...card} />
                ),
              )}
              {/* Topic Cards */}
              <LandingPageSection.Wrapper
                {...LANDING_PAGE_DATA.SECTIONS['topics']}
              >
                {LANDING_PAGE_DATA.SECTIONS['topics']?.data?.map((card, i) => (
                  <LandingPageCard key={`landing-card-${i}`} {...card} />
                ))}
              </LandingPageSection.Wrapper>
              <LandingPageSection.Wrapper
                {...LANDING_PAGE_DATA.SECTIONS['explore-resources']}
              >
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
                      props: { maxW: '280px', minW: '280px' },
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
                      props: { maxW: '180px', minW: '180px' },
                    },
                    {
                      title: 'access',
                      property: 'conditionsOfAccess',
                      isSortable: true,
                      props: { maxW: '150px', minW: '150px' },
                    },
                  ]}
                />
                <LandingPageSection.ButtonGroup>
                  {LANDING_PAGE_DATA.SECTIONS['explore-resources']?.cta?.map(
                    (cta, idx) => (
                      <LandingPageSection.Button
                        key={cta.title}
                        variant={idx % 2 ? 'solid' : 'outline'}
                      >
                        {cta.title}
                      </LandingPageSection.Button>
                    ),
                  )}
                </LandingPageSection.ButtonGroup>
              </LandingPageSection.Wrapper>

              {/* Updates */}
              <LandingPageSection.Wrapper heading='Updates' hasSeparator>
                {!props?.error?.message && props.data?.news && (
                  <UpdatesCarousel
                    news={props.data.news}
                    events={props.data.events}
                    features={props.data.features}
                  />
                )}
              </LandingPageSection.Wrapper>
            </Stack>
          </PageContent>
        )}
      </>
    </PageContainer>
  );
};

export async function getStaticProps() {
  try {
    const updates = await fetchAllUpdates({
      paginate: { page: 1, pageSize: 100 },
    });

    return {
      props: {
        data: {
          news: updates.news,
          events: updates.events,
          features: updates.features,
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
