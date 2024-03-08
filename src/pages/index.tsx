import React, { useMemo } from 'react';
import type { NextPage } from 'next';
import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  Icon,
  Text,
  Heading,
  Divider,
} from '@chakra-ui/react';
import { Link } from 'src/components/link';
import {
  PageHeader,
  PageContainer,
  PageContent,
} from 'src/components/page-container';
import HOMEPAGE_COPY from 'configs/homepage.json';
import HOME_QUERIES from 'configs/queries/home-queries.json';
import NextLink from 'next/link';
import { SearchBarWithDropdown } from 'src/components/search-bar';
import { AdvancedSearchOpen } from 'src/components/advanced-search/components/buttons';
import { FaRegEnvelope, FaGithub, FaAngleRight } from 'react-icons/fa6';
import { useRepoData } from 'src/hooks/api/useRepoData';
import {
  NewsCarousel,
  fetchNews,
} from 'src/views/home/components/NewsCarousel';
import { NewsOrEventsObject, fetchEvents } from './news';
import { TableWithSearch } from 'src/views/home/components/TableWithSearch/';
import { useResourceCatalogs } from 'src/hooks/api/useResourceCatalogs';

const Home: NextPage<{
  data: {
    news: NewsOrEventsObject[];
    events: NewsOrEventsObject[];
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
  } = useRepoData();

  const data = useMemo(() => {
    return [...(resourceCatalogs || []), ...(repositories || [])].map(item => {
      return {
        ...item,
        conditionsOfAccess:
          item['dataType'] === 'ResourceCatalog'
            ? item['conditionsOfAccess']
            : undefined,
        icon: item['dataType'] === 'Repository' ? item['icon'] : undefined,
      };
    });
  }, [repositories, resourceCatalogs]);

  return (
    <PageContainer
      hasNavigation
      title='Home'
      metaDescription='Find and access allergic, infectious and immune-mediated disease data by searching across biomedical data repositories with the NIAID Data Discovery Portal'
      keywords='omics, data, infectious disease, epidemiology, clinical trial, immunology, bioinformatics, surveillance, search, repository'
      disableSearchBar
    >
      {/**** Hero banner + search bar *****/}
      <PageHeader
        title={HOMEPAGE_COPY.sections.hero.heading}
        subtitle={HOMEPAGE_COPY.sections.hero.subtitle}
        body={[HOMEPAGE_COPY.sections.hero.body]}
      >
        <Flex w='100%' justifyContent='flex-end' mt={[15, 20, 24]} mb={2}>
          <Box mb={2}>
            <NextLink
              href={{ pathname: '/advanced-search' }}
              passHref
              prefetch={false}
            >
              <AdvancedSearchOpen
                onClick={() => {}}
                variant='outline'
                bg='whiteAlpha.500'
                color='white'
                _hover={{ bg: 'whiteAlpha.800', color: 'primary.600' }}
              />
            </NextLink>
          </Box>
        </Flex>
        <SearchBarWithDropdown
          placeholder='Search for datasets'
          ariaLabel='Search for datasets'
          size='md'
        />

        <Flex mt={2} flexWrap={['wrap']}>
          <Text color='whiteAlpha.800' mr={2}>
            Try:
          </Text>
          {HOME_QUERIES.map((query, i) => {
            return (
              <Link
                key={query.title}
                as='div'
                px={2}
                color='whiteAlpha.800'
                _hover={{
                  color: 'white',
                  svg: {
                    transform: 'translateX(0)',
                    transition: '0.2s ease-in-out',
                  },
                }}
                _visited={{ color: 'white' }}
                // display less options in mobile
                display={[i > 2 ? 'none' : 'block', 'block']}
              >
                <NextLink
                  href={{
                    pathname: `/search`,
                    query: { q: query.searchTerms.join(' OR ') },
                  }}
                  prefetch={false}
                >
                  <Text color='inherit'>{query.title}</Text>
                  <Icon
                    as={FaAngleRight}
                    ml={2}
                    boxSize={3}
                    transform='translateX(-5px)'
                    transition='0.2s ease-in-out'
                  />
                </NextLink>
              </Link>
            );
          })}
        </Flex>
      </PageHeader>
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
              <Box px={{ base: 0, sm: 4 }}>
                <Heading as='h2' fontSize='lg' fontWeight='semibold' mb={4}>
                  Currently included repositories
                </Heading>
                <Text lineHeight='short'>
                  Consequatur perspiciatis, enim aliquid eligendi laboriosam
                  maiores. Distinctio possimus ullam molestias, temporibus eum
                  ea cupiditate rerum, dicta esse illum officia.
                </Text>
                <Flex justifyContent='flex-end' fontSize='sm' />
                <Divider my={4} />

                <TableWithSearch
                  ariaLabel='List of repositories and resource catalogs'
                  caption='List of repositories and resource catalogs'
                  data={data}
                  isLoading={repositoriesIsLoading || resourceCatalogsIsLoading}
                  columns={[
                    {
                      title: 'name',
                      property: 'name',
                      isSortable: true,
                      props: { maxW: '300px', minW: '300px' },
                    },

                    {
                      title: 'description',
                      property: 'abstract',
                    },
                    {
                      title: 'Type',
                      property: 'dataType',
                      fields: ['dataType', 'type'],
                      isSortable: true,
                      props: { maxW: '200px', minW: '200px' },
                    },
                    {
                      title: 'Access',
                      property: 'conditionsOfAccess',
                      props: { maxW: '150px', minW: '150px' },
                      isSortable: true,
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
                              minWidth='200px'
                              fontSize='sm'
                              variant={index % 2 ? 'solid' : 'outline'}
                              m={[0, 0, 0]}
                              my={[1, 2, 0]}
                              size='md'
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

    return { props: { data: { news, events: events.data } } };
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
