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
import { PageContainer, PageContent } from 'src/components/page-container';
import { PageHeader } from 'src/components/page-header';
import { MDXRemoteSerializeResult } from 'next-mdx-remote';
import { Error } from 'src/components/error';
import axios from 'axios';
import Empty from 'src/components/empty';
import Navigation from 'src/components/resource-sections/components/navigation';
import { Section, SectionList } from 'src/views/news/components/Section';
import NDESOCIALS from 'configs/socials.json';
import { FaLinkedinIn, FaSquareFacebook, FaTwitter } from 'react-icons/fa6';
import { fetchNews } from 'src/views/home/components/NewsCarousel';
import { useQuery } from 'react-query';
import SectionCard from 'src/views/news/components/SectionCard';
import { fetchAllFeaturedPages } from 'src/views/features/helpers';

export interface NewsOrEventsObject {
  compiledMDX: MDXRemoteSerializeResult;
  id: number;
  mdx: { [key: string]: MDXRemoteSerializeResult };
  type?: string;
  attributes: {
    name: string | null;
    subtitle: string | null;
    description: string | null;
    shortDescription: string | null;
    image: {
      data:
        | null
        | { attributes: { url: string; alternativeText: string } }
        | { attributes: { url: string; alternativeText: string } }[];
    };
    eventDate?: string;
    slug: string;
    createdAt: string;
    publishedAt: string;
    updatedAt: string;
    categories: {
      data: {
        id: number;
        attributes: {
          name: string;
          createdAt: string;
          publishedAt: string;
          updatedAt: string;
        };
      }[];
    } | null;
  };
}

export interface NewsProps {
  data: {
    news: {
      data: NewsOrEventsObject[];
      error?: { message: string };
    };
    events: {
      data: NewsOrEventsObject[];
      error?: { message: string };
    };
    // webinars: {
    //   data: NewsOrEventsObject[];
    //   error?: { message: string };
    // };
    features: {
      data: NewsOrEventsObject[];
      error?: { message: string };
    };
  };
  error?: { message: string };
}

const News: NextPage<NewsProps> = props => {
  const { data } = props;

  // Fetch features from Strapi API.
  const {
    data: response,
    error,
    isLoading,
    isRefetching,
  } = useQuery<
    | {
        news: NewsOrEventsObject[];
        events: NewsOrEventsObject[];
        features: NewsOrEventsObject[];
      }
    | undefined,
    Error,
    {
      news: NewsOrEventsObject[];
      events: NewsOrEventsObject[];
      features: NewsOrEventsObject[];
    }
  >(
    ['news', 'events', 'features'],
    async () => {
      try {
        // Parallel fetching of news, events, and features using Promise.all
        const [newsResponse, featuresResponse, eventsResponse] =
          await Promise.all([
            fetchNews({ paginate: { page: 1, pageSize: 100 } }),
            fetchAllFeaturedPages({
              populate: {
                fields: [
                  'title',
                  'slug',
                  'subtitle',
                  'publishedAt',
                  'updatedAt',
                ],
                thumbnail: {
                  fields: ['url', 'alternativeText'],
                },
              },
              sort: { publishedAt: 'desc', updatedAt: 'desc' },
              paginate: { page: 1, pageSize: 100 },
            }),
            fetchEvents({ paginate: { page: 1, pageSize: 100 } }),
          ]);

        // Mapping data to the expected structure
        const news = newsResponse.news;
        const features = featuresResponse.data.map(item => ({
          ...item,
          type: 'feature',
          attributes: {
            name: item.attributes.title,
            image: item.attributes.thumbnail,
            slug: item.attributes.slug,
            description: `[Read full feature](/features/${item.attributes.slug})`,
            subtitle: item.attributes.subtitle,
          },
        })) as NewsOrEventsObject[];
        const events = eventsResponse.events;

        return {
          news,
          events,
          features,
        };
      } catch (error: any) {
        // Assuming error is of type any, we throw as type Error for useQuery to handle
        throw `Data fetching error: ${
          error.message || 'An unknown error occurred'
        }`;
      }
    },
    {
      initialData: {
        news: data?.news?.data || [],
        events: data?.events?.data || [],
        features: [],
      },
      refetchOnWindowFocus: false,
    },
  );

  const [sections, setSections] = useState([
    {
      title: 'News',
      hash: 'news',
      showMax: 5,
    },
    {
      title: 'Events',
      hash: 'events',
      showMax: 5,
    },
    {
      title: 'Features',
      hash: 'features',
      showMax: 5,
    },
    // {
    //   title: 'Webinar Recordings',
    //   hash: 'webinars',
    // },
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
      event.attributes.eventDate &&
      new Date(Date.parse(event.attributes.eventDate.replace(/-/g, ' '))) >=
        new Date(),
  );

  const pastEvents = response?.events?.filter(
    event =>
      event.attributes.eventDate &&
      new Date(Date.parse(event.attributes.eventDate.replace(/-/g, ' '))) <
        new Date(),
  );

  // add scroll padding to account for sticky nav
  useEffect(() => {
    const htmlEl = document.querySelector('html');
    if (htmlEl) {
      htmlEl.style.cssText += 'scroll-padding-top:60px;';
    }
  }, []);

  return (
    <PageContainer
      title='News'
      metaDescription='Latest news and updates for the NIAID Data Discovery Portal.'
      px={0}
      py={0}
    >
      <PageHeader
        title='News & Updates'
        titleProps={{
          size: 'h3',
        }}
        body={['Latest news and events from the NIAID Data Discovery Portal']}
        bodyProps={{
          color: '#fff',
          mt: 10,
        }}
        bgImg='/assets/news-01.jpg'
        sx={{
          '#header': {
            minW: '100%',
            bg: 'blackAlpha.600',
          },
        }}
      />
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
        <VisuallyHidden as='h1'>News and Events </VisuallyHidden>
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
              {/* NEWS */}
              <Section id='news' title='News'>
                <SectionList
                  id='news'
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
                            message='No news to display'
                            color='niaid.placeholder'
                            headingProps={{ size: 'sm' }}
                            iconProps={{
                              color: 'niaid.placeholder',
                              opacity: 0.7,
                            }}
                          />
                        )
                      ) : (
                        response?.news
                          ?.slice(
                            0,
                            sections.find(s => s.hash === 'news')?.showMax,
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
                            color='niaid.placeholder'
                            headingProps={{ size: 'sm' }}
                            iconProps={{
                              color: 'niaid.placeholder',
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

              {/* Features */}
              {response?.features.length && (
                <Section id='features' title='Features'>
                  <SectionList
                    id='features'
                    numItems={response?.features?.length || 0}
                    sections={sections}
                    setSections={setSections}
                  >
                    {isLoading || isRefetching ? (
                      <SkeletonText />
                    ) : (
                      <>
                        {error?.message ? (
                          <Error
                            minHeight='unset'
                            bg='#fff'
                            message={error.message}
                            headingProps={{ fontSize: 'md' }}
                          />
                        ) : (
                          response?.features
                            ?.slice(
                              0,
                              sections.find(s => s.hash === 'features')
                                ?.showMax,
                            )
                            .map((feature: NewsOrEventsObject) => {
                              const image = Array.isArray(
                                feature.attributes.image.data,
                              )
                                ? feature.attributes.image.data[0]?.attributes
                                : feature.attributes.image.data?.attributes;
                              return (
                                <SectionCard
                                  key={feature.id}
                                  {...feature}
                                  image={image}
                                />
                              );
                            })
                        )}
                      </>
                    )}
                  </SectionList>
                </Section>
              )}

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
                                    fill='niaid.placeholder'
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
  publicationState?: string;
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
    const isProd =
      process.env.NEXT_PUBLIC_BASE_URL === 'https://data.niaid.nih.gov';
    const events = await axios.get(
      `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/events`,
      {
        params: {
          publicationState: isProd ? 'live' : 'preview',
          populate: {
            fields: ['*'],
            image: {
              fields: ['url', 'alternativeText'],
            },
          },
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
    const isProd =
      process.env.NEXT_PUBLIC_BASE_URL === 'https://data.niaid.nih.gov';
    // in dev/staging mode, show drafts.
    const webinars = await axios.get(
      `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/webinars`,
      {
        params: {
          publicationState: isProd ? 'live' : 'preview',
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

export default News;
