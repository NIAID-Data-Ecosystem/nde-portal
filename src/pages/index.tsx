import React, { useCallback, useMemo, useState } from 'react';
import type { NextPage } from 'next';
import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  Icon,
  TabPanel,
  Text,
  Heading,
} from '@chakra-ui/react';
import { Link } from 'src/components/link';
import { PageContainer, PageContent } from 'src/components/page-container';
import HOMEPAGE_COPY from 'configs/homepage.json';
import HOME_QUERIES from 'configs/queries/home-queries.json';
import NextLink from 'next/link';
import { SearchBarWithDropdown } from 'src/components/search-bar';
import { AdvancedSearchOpen } from 'src/components/advanced-search/components/buttons';
import { FaRegEnvelope, FaGithub, FaAngleRight } from 'react-icons/fa6';
import { Repository, useRepoData } from 'src/hooks/api/useRepoData';
import {
  NewsCarousel,
  fetchNews,
} from 'src/views/home/components/NewsCarousel';
import { NewsOrEventsObject, fetchEvents } from './news';
import { TableWithSearch } from 'src/views/home/components/TableWithSearch/';
import { PageHeader } from 'src/components/page-header';
import { fetchAllFeaturedPages } from 'src/views/features/helpers';
import { SearchInput } from 'src/components/search-input';
import { RepositoryTabs } from 'src/views/home/components/RepositoryTabs';

const Home: NextPage<{
  data: {
    news: NewsOrEventsObject[];
    events: NewsOrEventsObject[];
    features: NewsOrEventsObject[];
  };
  error?: { message: string };
}> = props => {
  /****** Handle Search ******/
  const [searchTerm, setSearchTerm] = useState('');
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>): void =>
      setSearchTerm(e.target.value),
    [],
  );

  /****** Repository Data ******/
  const { isLoading, data: repositories, error } = useRepoData();

  // Defer filtering to the useMemo hook
  const filteredRepositories = useMemo(() => {
    return (
      repositories?.filter(
        repo =>
          repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          repo.abstract?.toLowerCase().includes(searchTerm.toLowerCase()),
      ) || []
    );
  }, [searchTerm, repositories]);

  // Split repositories by type using useMemo to avoid unnecessary computations
  const { iid_repositories, generalist_repositories } = useMemo(() => {
    const iid = filteredRepositories.filter(repo => repo.type === 'iid');
    const generalist = filteredRepositories.filter(
      repo => repo.type === 'generalist',
    );
    return { iid_repositories: iid, generalist_repositories: generalist };
  }, [filteredRepositories]);

  const repositoryTabs = useMemo(
    () => [
      {
        type: 'iid' as Repository['type'],
        label: 'IID Domain Repositories',
        count: iid_repositories.length,
        data: iid_repositories,
      },
      {
        type: 'generalist' as Repository['type'],
        label: 'Generalist Repositories',
        count: generalist_repositories.length,
        data: generalist_repositories,
      },
    ],
    [iid_repositories, generalist_repositories],
  );
  return (
    <PageContainer
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
        {!error && (
          <PageContent
            flexDirection='column'
            bg='#fff'
            mb={20}
            alignItems='center'
          >
            <Box maxW='1300px' width='100%'>
              <Heading as='h2' size='lg' mb={4} fontWeight='semibold'>
                Currently included repositories
              </Heading>
              <Box px={{ base: 0, sm: 4 }}>
                <Flex justifyContent='flex-end' mb={2}>
                  <SearchInput
                    size='sm'
                    placeholder='Search in repositories'
                    ariaLabel='Search in repositories'
                    value={searchTerm}
                    handleChange={handleSearchChange}
                    isResponsive={false}
                  />
                </Flex>
                <RepositoryTabs tabs={repositoryTabs}>
                  {repositoryTabs.map(tab => (
                    <TabPanel key={tab.type} id={tab.type} px={0}>
                      <TableWithSearch
                        ariaLabel='Currently included repositories'
                        caption='Currently included repositories'
                        data={tab.data}
                        isLoading={isLoading}
                        columns={[
                          {
                            title: 'name',
                            property: 'name',
                            isSortable: true,
                            props: { maxW: '300px' },
                          },
                          {
                            title: 'description',
                            property: 'abstract',
                          },
                        ]}
                      />
                    </TabPanel>
                  ))}
                </RepositoryTabs>

                <ButtonGroup
                  spacing={[0, 2]}
                  flexWrap={['wrap', 'nowrap']}
                  w='100%'
                  display='flex'
                  justifyContent='flex-end'
                  mt={4}
                  px={[0, 4]}
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
                              fontSize='sm'
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
