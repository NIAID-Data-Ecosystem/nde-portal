import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardBody,
  Flex,
  Heading,
  Icon,
  SimpleGrid,
  SkeletonText,
  Stack,
  StackDivider,
  Text,
  VisuallyHidden,
} from '@chakra-ui/react';
import { Link } from 'src/components/link';
import type { NextPage } from 'next';
import {
  getPageSeoConfig,
  PageContainer,
  PageContent,
} from 'src/components/page-container';
import { MDXRemoteSerializeResult } from 'next-mdx-remote';
import { Error } from 'src/components/error';
import axios from 'axios';
import Empty from 'src/components/empty';
import Navigation from 'src/components/resource-sections/components/navigation';
import { Section, SectionList } from 'src/views/news/components/Section';
import NDESOCIALS from 'configs/socials.json';
import { FaLinkedinIn, FaSquareFacebook, FaTwitter } from 'react-icons/fa6';
import { fetchNews } from 'src/views/home/components/NewsCarousel';
import { useQuery } from '@tanstack/react-query';
import SectionCard from 'src/views/news/components/SectionCard';
import {
  HeroBannerContainer,
  HeroBannerText,
} from 'src/views/home/components/HeroBanner';

export interface NewsOrEventsObject {
  id: number;
  subtitle: string | null;
  description: string | null;
  shortDescription: string | null;
  image:
    | null
    | { url: string; alternativeText: string }
    | { url: string; alternativeText: string }[];
  name: string | null;
  slug: string;
  createdAt: string;
  publishedAt: string;
  updatedAt: string;
  categories:
    | {
        id: number;
        name: string;
        createdAt: string;
        publishedAt: string;
        updatedAt: string;
      }[]
    | null;
  compiledMDX?: MDXRemoteSerializeResult;
  mdx?: { [key: string]: MDXRemoteSerializeResult };
  type?: string;
  eventDate?: string;
}

export interface UpdatesProps {
  data: {
    news: {
      data: NewsOrEventsObject[];
      error?: { message: string };
    };
    events: {
      data: NewsOrEventsObject[];
      error?: { message: string };
    };
  };
  error?: { message: string };
}

const Updates: NextPage<UpdatesProps> = props => {
  const { data } = props;

  const {
    data: response,
    error,
    isLoading,
    isRefetching,
  } = useQuery<
    | {
        news: NewsOrEventsObject[];
        events: NewsOrEventsObject[];
      }
    | undefined,
    Error,
    {
      news: NewsOrEventsObject[];
      events: NewsOrEventsObject[];
    }
  >({
    queryKey: ['news', 'events'],
    queryFn: async () => {
      try {
        // Parallel fetching of news and events using Promise.all
        const [newsResponse, eventsResponse] = await Promise.all([
          fetchNews({ paginate: { page: 1, pageSize: 100 } }),
          fetchEvents({ paginate: { page: 1, pageSize: 100 } }),
        ]);

        // Mapping data to the expected structure
        const news = newsResponse.news;
        const events = eventsResponse.events;

        return {
          news,
          events,
        };
      } catch (error: any) {
        // Assuming error is of type any, we throw as type Error for useQuery to handle
        throw `Data fetching error: ${
          error.message || 'An unknown error occurred'
        }`;
      }
    },
    initialData: {
      news: data?.news?.data || [],
      events: data?.events?.data || [],
    },
    refetchOnWindowFocus: false,
  });
  const [sections, setSections] = useState([
    {
      title: 'Updates',
      hash: 'updates',
      showMax: 5,
    },
    {
      title: 'Events',
      hash: 'events',
      showMax: 5,
    },
    {
      title: 'Additional Resources',
      hash: 'resources',
    },
    {
      title: 'Join the Community',
      hash: 'community',
    },
  ]);

  const upcomingEvents = response?.events?.filter(
    event =>
      event.eventDate &&
      new Date(Date.parse(event.eventDate.replace(/-/g, ' '))) >= new Date(),
  );

  const pastEvents = response?.events?.filter(
    event =>
      event.eventDate &&
      new Date(Date.parse(event.eventDate.replace(/-/g, ' '))) < new Date(),
  );

  // add scroll padding to account for sticky nav
  useEffect(() => {
    const htmlEl = document.querySelector('html');
    if (htmlEl) {
      htmlEl.style.cssText += 'scroll-padding-top:60px;';
    }
  }, []);

  return (
    <PageContainer meta={getPageSeoConfig('/updates')} px={0} py={0}>
      <HeroBannerContainer
        justifyContent={{ base: 'flex-start', md: 'center' }}
        bgImg='/assets/news-01.jpg'
        backgroundSize='cover'
        px='0px'
        minHeight='unset'
      >
        <Flex
          bg='blackAlpha.600'
          flexDirection='column'
          alignItems={{ base: 'flex-start', xl: 'center' }}
          textAlign={{ xl: 'center' }}
          px={{ base: 6, sm: 10, lg: 16, xl: '5vw' }}
          py={{ base: 6, sm: 10, xl: 16 }}
          w='100%'
        >
          <HeroBannerText
            title='Updates'
            body='Updates and events from the NIAID Data Discovery Portal'
            alignItems={{ base: 'flex-start', lg: 'center' }}
            color='#fff'
            maxWidth={{ md: '500px', xl: '680px' }}
            mt={0}
            mb={0}
            spacing={10}
            textAlign={{ base: 'left', lg: 'center' }}
            sx={{
              h1: {
                letterSpacing: '1px',
              },
            }}
          ></HeroBannerText>
        </Flex>
      </HeroBannerContainer>

      <PageContent
        bg='#fff'
        maxW={{ base: 'unset', lg: '1600px' }}
        margin='0 auto'
        px={4}
        py={4}
        justifyContent='center'
        mb={32}
        flex={1}
      >
        <VisuallyHidden as='h1'>Updates and Events </VisuallyHidden>
        {response ? (
          <>
            <Flex
              flexDirection='column'
              flex={1}
              pb={32}
              maxW={{ base: 'unset', lg: '70%' }}
              width='100%'
              alignItems='center'
              m='0 auto'
            >
              {/* UPDATES */}
              <Section id='updates' title='Updates'>
                <SectionList
                  id='updates'
                  numItems={response?.news?.length || 0}
                  sections={sections}
                  setSections={setSections}
                >
                  {isLoading || isRefetching ? (
                    <SkeletonText />
                  ) : (
                    <>
                      {!response?.news?.length ? (
                        error?.message ? (
                          <Error
                            minHeight='unset'
                            bg='#fff'
                            message={error.message}
                            headingProps={{ fontSize: 'md' }}
                          />
                        ) : (
                          <Empty
                            message='No updates to display'
                            color='page.placeholder'
                            headingProps={{ size: 'sm' }}
                            iconProps={{
                              color: 'page.placeholder',
                              opacity: 0.7,
                            }}
                          />
                        )
                      ) : (
                        response?.news
                          ?.slice(
                            0,
                            sections.find(s => s.hash === 'updates')?.showMax,
                          )
                          .map((news: NewsOrEventsObject) => {
                            return <SectionCard key={news.id} {...news} />;
                          })
                      )}
                    </>
                  )}
                </SectionList>
              </Section>

              {/* EVENTS */}
              <Section id='events' title='Events'>
                <SectionList
                  id='events'
                  numItems={response?.events?.length || 0}
                  sections={sections}
                  setSections={setSections}
                >
                  {isLoading || isRefetching ? (
                    <SkeletonText />
                  ) : (
                    <>
                      {!response?.events?.length ? (
                        error?.message ? (
                          <Error
                            minHeight='unset'
                            bg='#fff'
                            message={error.message}
                            headingProps={{ fontSize: 'md' }}
                          />
                        ) : (
                          <Empty
                            message='No events to display'
                            color='page.placeholder'
                            headingProps={{ size: 'sm' }}
                            iconProps={{
                              color: 'page.placeholder',
                              opacity: 0.7,
                            }}
                          />
                        )
                      ) : (
                        <>
                          {/* Upcoming events */}
                          {upcomingEvents && upcomingEvents?.length > 0 && (
                            <>
                              <Heading as='h3' size='sm' color='gray.600'>
                                Upcoming
                              </Heading>
                              {upcomingEvents
                                .slice(
                                  0,
                                  sections.find(s => s.hash === 'events')
                                    ?.showMax,
                                )
                                .map((event: NewsOrEventsObject) => {
                                  return (
                                    <SectionCard key={event.id} {...event} />
                                  );
                                })}
                            </>
                          )}
                          {/* Past events */}
                          {pastEvents && pastEvents?.length > 0 && (
                            <>
                              <Heading
                                as='h3'
                                size='sm'
                                color='primary.600'
                                fontWeight='semibold'
                              >
                                Past events
                              </Heading>
                              {pastEvents
                                .slice(
                                  0,
                                  sections.find(s => s.hash === 'events')
                                    ?.showMax,
                                )
                                .map((event: NewsOrEventsObject) => {
                                  return (
                                    <SectionCard key={event.id} {...event} />
                                  );
                                })}
                            </>
                          )}
                        </>
                      )}
                    </>
                  )}
                </SectionList>
              </Section>

              {/* Additional Resources */}
              <Section id='resources' title='Additional Resources'>
                <Stack
                  direction={{ base: 'column', sm: 'row' }}
                  divider={<StackDivider borderColor='primary.200' />}
                  spacing={4}
                  fontSize='md'
                >
                  <Link href='/knowledge-center'>Knowledge Center</Link>
                  <Link href='/knowledge-center/frequently-asked-questions'>
                    FAQ
                  </Link>
                  <Link href='mailto:NIAIDDataEcosystem@mail.nih.gov'>
                    Ask a question
                  </Link>
                  <Link href='/changelog'>Changelog</Link>
                </Stack>
              </Section>

              {/* Join the Community */}
              <Section id='community' title='Join the community'>
                <SimpleGrid
                  columns={{ base: 1, sm: 2 }}
                  spacing={4}
                  maxW='700px'
                  sx={{
                    '>div': {
                      transform: 'translate(0, 2px)',
                      boxShadow: 'sm',
                      border: '1px solid',
                      borderColor: 'gray.100',
                      borderTopColor: 'transparent',
                      transition: 'all 0.1s ease-in-out',
                      _hover: {
                        transform: 'translate(0, 0px)',
                        boxShadow: 'base',
                        transition: 'all 0.1s ease-in-out',
                      },
                      _after: {
                        content: "''",
                        bgGradient: 'linear(to-r, primary.200, accent.400)',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        w: '100%',
                        h: '4px',
                      },
                    },
                  }}
                >
                  {/* Email */}
                  <Card>
                    <CardBody p={0} px={4} py={1}>
                      <Text
                        lineHeight='short'
                        color='gray.800'
                        fontWeight='medium'
                      >
                        Share your discovery Portal story with us by{' '}
                        <Link href='mailto:NIAIDDataEcosystem@mail.nih.gov'>
                          emailing the team
                        </Link>
                      </Text>
                    </CardBody>
                  </Card>
                  {/* Socials */}
                  {NDESOCIALS && NDESOCIALS['socials'] && (
                    <Card>
                      <CardBody px={4} py={1}>
                        <Text
                          lineHeight='short'
                          color='gray.800'
                          fontWeight='medium'
                        >
                          Join us on
                        </Text>
                        <Stack direction='row' spacing={6} fontSize='sm'>
                          {Object.entries(NDESOCIALS['socials']).map(
                            ([platform, href]) => {
                              let icon =
                                platform === 'twitter'
                                  ? FaTwitter
                                  : platform === 'linkedin'
                                  ? FaLinkedinIn
                                  : platform === 'facebook'
                                  ? FaSquareFacebook
                                  : undefined;

                              return (
                                <Link key={platform} href={href}>
                                  <VisuallyHidden>
                                    {platform} link
                                  </VisuallyHidden>
                                  <Icon
                                    as={icon}
                                    boxSize={6}
                                    fill='page.placeholder'
                                    _hover={{ fill: `${platform}.500` }}
                                  />
                                </Link>
                              );
                            },
                          )}
                        </Stack>
                      </CardBody>
                    </Card>
                  )}
                </SimpleGrid>
              </Section>
            </Flex>

            {/* TABLE OF CONTENTS */}
            <Box
              flex={1}
              position='sticky'
              top='0px'
              w='100%'
              h='100vh'
              minW='250px'
              maxW='350px'
              display={{ base: 'none', lg: 'block' }}
              flexDirection='column'
              px={2}
            >
              <Box position='sticky' top='0px'>
                <Navigation
                  routes={sections}
                  itemProps={{
                    color: 'primary.500',
                    borderLeftColor: 'primary.400',
                  }}
                />
              </Box>
            </Box>
          </>
        ) : (
          <Empty message='Nothing to display.' alignSelf='center' h='50vh' />
        )}
      </PageContent>
    </PageContainer>
  );
};

interface QueryParams {
  status?: string;
  fields?: string[];
  populate?:
    | {
        [key: string]: {
          fields: string[];
        };
      }
    | string;
  sort?: string;
  paginate?: { page?: number; pageSize?: number };
}
export const fetchEvents = async (
  params: QueryParams,
): Promise<{
  events: NewsOrEventsObject[];
}> => {
  try {
    // in dev/staging mode, show drafts.
    const isProd = process.env.NEXT_PUBLIC_APP_ENV === 'production';
    const events = await axios.get(
      `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/events`,
      {
        params: {
          status: isProd ? 'published' : 'draft',
          populate: '*',
          sort: { publishedAt: 'desc', updatedAt: 'desc' },
          paginate: { page: 1, pageSize: 100 },
          ...params,
        },
      },
    );

    return { events: events.data.data };
  } catch (err: any) {
    throw err;
  }
};

export const fetchWebinars = async (
  params: QueryParams,
): Promise<{
  webinars: NewsOrEventsObject[];
}> => {
  try {
    const isProd = process.env.NEXT_PUBLIC_APP_ENV === 'production';
    // in dev/staging mode, show drafts.
    const webinars = await axios.get(
      `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/webinars`,
      {
        params: {
          status: isProd ? 'published' : 'draft',
          populate: {
            fields: ['*'],
          },
          sort: { publishedAt: 'desc', updatedAt: 'desc' },
          paginate: { page: 1, pageSize: 100 },
          ...params,
        },
      },
    );

    return { webinars: webinars.data.data };
  } catch (err: any) {
    throw err;
  }
};

export async function getStaticProps() {
  try {
    const news = await fetchNews({ paginate: { page: 1, pageSize: 100 } })
      .then(res => ({ data: res.news, error: null }))
      .catch(err => {
        return {
          data: [],
          error: {
            message: `${err.response.status} : ${err.response.statusText}`,
            status: err.response.status,
          },
        };
      });

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
    const webinars = await fetchWebinars({
      paginate: { page: 1, pageSize: 100 },
    })
      .then(res => ({ data: res.webinars, error: null }))
      .catch(err => {
        return {
          data: [],
          error: {
            message: `${err.response.status} : ${err.response.statusText}`,
            status: err.response.status,
          },
        };
      });

    return { props: { data: { news, events, webinars } } };
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

export default Updates;
