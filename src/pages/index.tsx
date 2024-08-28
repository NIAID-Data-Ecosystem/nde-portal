import React from 'react';
import type { NextPage } from 'next';
import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  Icon,
  Image,
  Text,
  Heading,
  Divider,
  VStack,
  Stack,
} from '@chakra-ui/react';
import { PageContainer, PageContent } from 'src/components/page-container';
import HOMEPAGE_COPY from 'configs/homepage.json';
import HOME_QUERIES from 'configs/queries/home-queries.json';
import NextLink from 'next/link';
import { SearchBarWithDropdown } from 'src/components/search-bar';
import { FaRegEnvelope, FaGithub, FaMagnifyingGlass } from 'react-icons/fa6';
import { useRepoData } from 'src/hooks/api/useRepoData';
import {
  NewsCarousel,
  fetchNews,
} from 'src/views/home/components/NewsCarousel';
import { NewsOrEventsObject, fetchEvents } from './news';
import { TableWithSearch } from 'src/views/home/components/TableWithSearch/';
import { useResourceCatalogs } from 'src/hooks/api/useResourceCatalogs';
import { fetchAllFeaturedPages } from 'src/views/features/helpers';
import { HeroBanner } from 'src/views/home/components/HeroBanner';
import { TagWithUrl } from 'src/components/tag-with-url';

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
    error: repositoriesCatalogsError,
  } = useRepoData({ refetchOnWindowFocus: false, refetchOnMount: false });

  return (
    <PageContainer
      title='Home'
      metaDescription='Find and access allergic, infectious and immune-mediated disease data by searching across biomedical data repositories with the NIAID Data Discovery Portal'
      keywords='omics, data, infectious disease, epidemiology, clinical trial, immunology, bioinformatics, surveillance, search, repository'
      disableSearchBar
    >
      {/**** Hero banner + search bar *****/}
      <HeroBanner
        title={HOMEPAGE_COPY.sections.hero.heading}
        subtitle={HOMEPAGE_COPY.sections.hero.subtitle}
      >
        <Stack
          flexDirection='column'
          w='100%'
          alignItems='flex-start'
          spacing={{ base: 4, sm: 2 }}
          zIndex={2}
        >
          <Flex w='100%' flexDirection='column' maxWidth='1000px'>
            <SearchBarWithDropdown
              placeholder='Search for datasets'
              ariaLabel='Search for datasets'
              size='md'
            />
          </Flex>
          <Box>
            <Text fontWeight='semibold'>Try these searches:</Text>
            <Stack flexDirection='row' flexWrap={'wrap'}>
              {HOME_QUERIES.map(query => {
                return (
                  <TagWithUrl
                    key={query.title}
                    label={query.title}
                    href={{
                      pathname: `/search`,
                      query: { q: query.searchTerms.join(' OR ') },
                    }}
                    colorScheme='tertiary'
                    variant='solid'
                    bg='niaid.color'
                    leftIcon={FaMagnifyingGlass}
                    size={{ base: 'md', sm: 'sm' }}
                  />
                );
              })}
            </Stack>
          </Box>
          <Button
            as={NextLink}
            href={{ pathname: '/advanced-search' }}
            size={{ base: 'sm', sm: 'xs' }}
            height={{ base: 'unset', sm: '25.5px' }}
            leftIcon={<FaMagnifyingGlass />}
            mt={2}
            fontWeight='medium'
            lineHeight='shorter'
          >
            Advanced Search
          </Button>
        </Stack>
      </HeroBanner>
      <>
        {/**** Repositories Table section *****/}
        {!(repositoriesCatalogsError || resourceCatalogsError) && (
          <PageContent
            flexDirection='column'
            bg='#fff'
            mb={20}
            alignItems='center'
          >
            <Box maxW='1300px' width='100%'>
              <Flex
                id='getting-started-card'
                boxShadow='sm'
                borderRadius='semi'
                overflow='hidden'
                border='1px solid'
                borderColor='gray.100'
                m={{ base: 0, sm: 4 }}
                mb={{ base: 8, sm: 8 }}
                flexWrap='wrap'
              >
                <Box flex={1}>
                  <Image
                    src='/assets/homepage/getting-started.png'
                    alt='The image shows a healthcare professional, likely a doctor, wearing a white coat and stethoscope, interacting with a digital interface. The interface displays various health-related icons, such as a heart, a DNA helix, a medical cross, a microscope, a pill, an apple, and a syringe, representing different aspects of healthcare and medical research. The doctor is pointing at the heart icon, indicating a focus on heart health or medical diagnostics.'
                    objectFit='cover'
                    height='100%'
                    minWidth='400px'
                    minHeight={{ base: '200px', xl: '316px' }}
                  />
                </Box>
                <Flex
                  w='100%'
                  px={{ base: 4, sm: 8 }}
                  py={{ base: 4, sm: 6 }}
                  flex={1}
                  justifyContent={{ base: 'flex-start', sm: 'center' }}
                >
                  <VStack
                    w='100%'
                    alignItems='flex-start'
                    spacing={4}
                    justifyContent='center'
                    px={{ base: 0, xl: 8 }}
                  >
                    <Heading as='h2' fontSize='2xl' fontWeight='semibold'>
                      Getting Started
                    </Heading>
                    <Text fontWeight='medium'>
                      If you are new to the NIAID Data Ecosystem Discovery
                      Portal you can find tips for searching infectious and
                      immune disease datasets, learn about the different
                      repositories, discover how best to filter results, and
                      more...
                    </Text>
                    <Button
                      as={NextLink}
                      href='/knowledge-center/getting-started'
                      size={{ base: 'md', sm: 'sm' }}
                      width={{ base: '100%', sm: 'auto' }}
                    >
                      <Text isTruncated color='inherit'>
                        Read more about getting started
                      </Text>
                    </Button>
                  </VStack>
                </Flex>
              </Flex>
              <Box px={{ base: 0, sm: 4 }}>
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
              </Box>

              {/* NEWS */}
              {!props?.error?.message && props.data?.news && (
                <NewsCarousel
                  news={props.data.news}
                  events={props.data.events}
                  features={props.data.features}
                />
              )}
            </Box>
          </PageContent>
        )}
      </>
    </PageContainer>
  );
};

export async function getStaticProps() {
  try {
    const { news } = await fetchNews({ paginate: { page: 1, pageSize: 5 } });
    const features = await fetchAllFeaturedPages({
      populate: {
        fields: ['title', 'slug', 'subtitle', 'publishedAt', 'updatedAt'],
        thumbnail: {
          fields: ['url', 'alternativeText'],
        },
      },
      sort: { publishedAt: 'desc', updatedAt: 'desc' },
      paginate: { page: 1, pageSize: 5 },
    })
      .then(res => {
        return {
          data: res.data.map(item => ({
            ...item,
            type: 'feature',
            attributes: {
              name: item.attributes.title,
              image: item.attributes.thumbnail,
              slug: item.attributes.slug,
              shortDescription: item.attributes.subtitle,
            },
          })) as NewsOrEventsObject[],
          error: null,
        };
      })
      .catch(err => ({
        data: [],
        error: {
          message: `${err.response.status} : ${err.response.statusText}`,
          status: err.response.status,
        },
      }));
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
      props: { data: { news, events: events.data, features: features.data } },
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
