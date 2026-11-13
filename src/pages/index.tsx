import {
  Box,
  Button,
  ButtonGroup,
  Card,
  Flex,
  Heading,
  Icon,
  Separator,
  SimpleGrid,
  Stack,
  Text,
  VStack,
} from '@chakra-ui/react';
import HOMEPAGE_COPY from 'configs/homepage.json';
import HOME_QUERIES from 'configs/queries/home-queries.json';
import type { NextPage } from 'next';
import NextLink from 'next/link';
import React, { useMemo } from 'react';
import { FaGithub, FaMagnifyingGlass, FaRegEnvelope } from 'react-icons/fa6';
import { InternalLinkButton } from 'src/components/internal-link-button';
import {
  getPageSeoConfig,
  PageContainer,
  PageContent,
  Search,
} from 'src/components/page-container';
import { useSourcesList } from 'src/hooks/api/useSourcesList';
import { SHOW_AI_ASSISTED_SEARCH } from 'src/utils/feature-flags';
import {
  formatConditionsOfAccess,
  transformConditionsOfAccessLabel,
} from 'src/utils/formatting/formatConditionsOfAccess';
import {
  fetchAllFeaturedPages,
  transformFeaturedContentForCarousel,
} from 'src/views/features/helpers';
import { HeroBanner } from 'src/views/home/components/HeroBanner';
import { ImageCard } from 'src/views/home/components/ImageCard';
import {
  fetchNews,
  NewsCarousel,
} from 'src/views/home/components/NewsCarousel';
import { TableWithSearch } from 'src/views/home/components/TableWithSearch/';
import { formatDomainName } from 'src/views/home/components/TableWithSearch/helpers';
import { TOPIC_CARDS } from 'src/views/home/config/topic-cards';
import { useReadLocalStorage } from 'usehooks-ts';

import { fetchEvents, NewsOrEventsObject } from './updates';

const Home: NextPage<{
  data: {
    news: NewsOrEventsObject[];
    events: NewsOrEventsObject[];
    features: NewsOrEventsObject[];
  };
  error?: { message: string };
}> = props => {
  const enableAISearch = useReadLocalStorage('enableAISearch');
  /****** Repository + Resource Catalog Data ******/
  // `useSourcesList` merges standalone resource catalogs into the metadata
  // sources list until the two data sources are consolidated on one endpoint.
  const {
    isLoading: repositoriesIsLoading,
    data: repositories,
    error: repositoriesError,
  } = useSourcesList({ refetchOnWindowFocus: false, refetchOnMount: false });

  const tableData = useMemo(
    () =>
      (repositories || []).map(item => {
        const domain = item?.genre
          ? formatDomainName(item.genre).sort((a, b) => a.localeCompare(b))
          : '';

        return {
          _id: item._id || '',
          abstract: item.abstract || '',
          name: item.name,
          conditionsOfAccess: transformConditionsOfAccessLabel(
            formatConditionsOfAccess(item.conditionsOfAccess),
          ),
          domain,
          type: item.type,
          url: item.searchURL,
        };
      }),
    [repositories],
  );

  return (
    <PageContainer meta={getPageSeoConfig('/')} overflowX='hidden'>
      {/**** Hero banner + search bar *****/}
      <HeroBanner
        title={HOMEPAGE_COPY.sections.hero.heading}
        subtitle={HOMEPAGE_COPY.sections.hero.subtitle}
      >
        <Card.Root
          w='100%'
          overflow='visible'
          bg='rgba(255, 255, 255, 0.70)'
          maxWidth='1100px'
        >
          <Card.Body overflow='visible'>
            <Stack
              flexDirection='column'
              w='100%'
              alignItems='flex-start'
              gap={{ base: 4, sm: 3 }}
              zIndex={2}
            >
              <Flex w='100%' flexDirection='column' maxWidth='1000px'>
                <Flex
                  justifyContent='space-between'
                  alignItems='center'
                  flex={1}
                  mb={1}
                  flexWrap='wrap-reverse'
                  gap={{ base: 2, md: 0 }}
                >
                  {SHOW_AI_ASSISTED_SEARCH && <Search.AIToggle />}
                  <Search.AdvancedSearchLink />
                </Flex>
                <Search.Input size='sm' />
              </Flex>
              <Box>
                <Text fontWeight='semibold' mb={1}>
                  Try these searches:
                </Text>
                <Stack flexDirection='row' flexWrap={'wrap'}>
                  {HOME_QUERIES.map(query => {
                    return (
                      <Button
                        key={query.title}
                        size='xs'
                        colorPalette='niaid'
                        asChild
                      >
                        <NextLink
                          href={{
                            pathname: `/search`,
                            query: {
                              q: query.searchTerms.join(' OR '),
                              ...(SHOW_AI_ASSISTED_SEARCH && enableAISearch
                                ? {
                                    use_ai_search: 'true',
                                  }
                                : {}),
                            },
                          }}
                        >
                          <FaMagnifyingGlass />
                          {query.title}
                        </NextLink>
                      </Button>
                    );
                  })}
                </Stack>
              </Box>
            </Stack>
          </Card.Body>
        </Card.Root>
      </HeroBanner>
      <>
        {/**** Repositories Table section *****/}
        {!repositoriesError && (
          <PageContent
            flexDirection='column'
            bg='#fff'
            mb={20}
            alignItems='center'
          >
            <VStack
              maxW='1300px'
              width='100%'
              px={{ base: 2, sm: 4 }}
              lineHeight='tall'
              gap={8}
            >
              <ImageCard
                id='getting-started-card'
                title='Getting Started'
                titleAs='h2'
                size='md'
                description='If you are new to the NIAID Data Ecosystem Discovery Portal you can find tips for searching infectious and immune disease datasets, learn about the different repositories, discover how best to filter results, and more...'
                imageProps={{
                  src: '/assets/homepage/getting-started.png',
                  alt: 'The image shows a healthcare professional, likely a doctor, wearing a white coat and stethoscope, interacting with a digital interface. The interface displays various health-related icons, such as a heart, a DNA helix, a medical cross, a microscope, a pill, an apple, and a syringe, representing different aspects of healthcare and medical research. The doctor is pointing at the heart icon, indicating a focus on heart health or medical diagnostics.',
                }}
                footer={
                  <InternalLinkButton href='/knowledge-center/getting-started-with-niaid-data-ecosystem-discovery-portal'>
                    Read more about getting started
                  </InternalLinkButton>
                }
              />

              <Box width='100%'>
                <Heading as='h2' fontSize='xl' fontWeight='semibold' mb={4}>
                  Find Resources By Topic
                </Heading>
                <SimpleGrid
                  columns={{ base: 1, md: 2 }}
                  gap={{ base: 6, xl: 4 }}
                >
                  {TOPIC_CARDS.map(card => (
                    <ImageCard
                      key={card.title}
                      size='sm'
                      css={{
                        '--card-padding': 'var(--chakra-spacing-4)',
                      }}
                      imageContainerProps={{
                        minW: { base: '100%', sm: '250px' },
                        width: { base: '100%', md: '33.33%' },
                        aspectRatio: { base: '5/3', md: '4/3' },
                        maxH: { base: '230px', lg: '250px' },
                      }}
                      {...card}
                    />
                  ))}
                </SimpleGrid>
              </Box>

              <Box width='100%'>
                <Heading as='h2' fontSize='xl' fontWeight='semibold' mb={4}>
                  Explore All Included Resources
                </Heading>
                <Text lineHeight='moderate'>
                  The following <strong>Resource Catalogs</strong> (collections
                  of scientific information or research outputs) and{' '}
                  <strong>Dataset Repositories</strong> (collections of data of
                  a particular experimental type) are currently included in the
                  NIAID Data Ecosystem
                </Text>
                <Flex justifyContent='flex-end' fontSize='sm' />
                <Separator my={4} />

                <TableWithSearch
                  ariaLabel='List of repositories and resource catalogs'
                  caption='List of repositories and resource catalogs'
                  data={tableData}
                  loading={repositoriesIsLoading}
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
                  emptyState={
                    <Flex direction='column' align='center' py={10}>
                      <Text fontWeight='bold'>No items match</Text>
                      <Text color='gray.600'>
                        Try clearing some filters or broadening your search.
                      </Text>
                    </Flex>
                  }
                />

                <ButtonGroup
                  gap={[0, 2]}
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
                          <Button
                            w='100%'
                            minWidth='150px'
                            size='sm'
                            variant={index % 2 ? 'solid' : 'outline'}
                            my={[1, 2, 0]}
                            maxWidth={['unset', '250px']}
                            asChild
                          >
                            <NextLink
                              href={route.path}
                              target={route.isExternal ? '_blank' : '_self'}
                            >
                              <Icon as={icon} />
                              {route.title}
                            </NextLink>
                          </Button>
                        </Box>
                      );
                    },
                  )}
                </ButtonGroup>
              </Box>

              {/* NEWS */}
              {!props?.error?.message && props.data?.news && (
                <NewsCarousel
                  news={props.data.news}
                  events={props.data.events}
                  features={props.data.features}
                />
              )}
            </VStack>
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
