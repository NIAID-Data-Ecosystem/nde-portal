import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardBody,
  Flex,
  Heading,
  Icon,
  Link,
  SimpleGrid,
  Stack,
  StackDivider,
  Text,
} from 'nde-design-system';
import type { NextPage } from 'next';
import {
  PageContainer,
  PageContent,
  PageHeader,
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
import { useQuery } from 'react-query';
import SectionCard from 'src/views/news/components/SectionCard';

export interface NewsOrEventsObject {
  compiledMDX: MDXRemoteSerializeResult;
  id: number;
  mdx: { [key: string]: MDXRemoteSerializeResult };
  attributes: {
    name: string | null;
    subtitle: string | null;
    description: string | null;
    shortDescription: string | null;
    image: {
      data: null | { attributes: { url: string; alternativeText: string } }[];
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
    webinars: {
      data: NewsOrEventsObject[];
      error?: { message: string };
    };
  };
  error?: { message: string };
}

const News: NextPage<NewsProps> = props => {
  const { data } = props;
  const [news, setNews] = useState<NewsProps['data']['news']>(data.news);
  // const [webinars, setWebinars] = useState<NewsProps['data']['webinars']>(
  //   data.webinars,
  // );
  const [events, setEvents] = useState<NewsProps['data']['events']>(
    data.events,
  );

  useQuery<
    {
      news: NewsOrEventsObject[];
    },
    any,
    { news: NewsOrEventsObject[] }
  >(['news'], () => fetchNews({ pageSize: 100 }), {
    onSuccess(data) {
      if (!data || !data.news) {
        return [];
      }
      setNews({ data: data.news });
    },
    onError(err) {
      setNews({
        data: [],
        error: { message: err.message },
      });
    },
    refetchOnWindowFocus: false,
    // refetchOnMount: false,
  });

  useQuery<
    {
      events: NewsOrEventsObject[];
    },
    any,
    { events: NewsOrEventsObject[] }
  >(['events'], () => fetchEvents({ pageSize: 100 }), {
    onSuccess(data) {
      if (!data || !data.events) {
        return [];
      }
      setEvents({ data: data.events });
    },
    onError(err) {
      setEvents({
        data: [],
        error: { message: err.message },
      });
    },
    refetchOnWindowFocus: false,
    // refetchOnMount: false,
  });

  // useQuery<
  //   {
  //     webinars: NewsOrEventsObject[];
  //   },
  //   any,
  //   { webinars: NewsOrEventsObject[] }
  // >(['webinars'], () => fetchWebinars({ pageSize: 100 }), {
  //   onSuccess(data) {
  //     if (!data || !data.webinars) {
  //       return [];
  //     }
  //     setWebinars({ data: data.webinars });
  //   },
  //   onError(err) {
  //     setWebinars({
  //       data: [],
  //       error: { message: err.message },
  //     });
  //   },
  //   refetchOnWindowFocus: false,
  //   refetchOnMount: false,
  // });

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

  const upcomingEvents = events.data.filter(
    event =>
      event.attributes.eventDate &&
      new Date(Date.parse(event.attributes.eventDate.replace(/-/g, ' '))) >=
        new Date(),
  );

  const pastEvents = events.data.filter(
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
      hasNavigation
      title='News'
      metaDescription='Latest news releases for the NIAID Data Discovery Portal.'
      px={0}
      py={0}
      disableSearchBar
    >
      <PageHeader
        title='News Releases'
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
        {data ? (
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
                  numItems={news.data.length}
                  sections={sections}
                  setSections={setSections}
                >
                  {!news.data.length ? (
                    news.error?.message ? (
                      <Error
                        minHeight='unset'
                        bg='#fff'
                        message={news.error.message}
                        headingProps={{ fontSize: 'md' }}
                      />
                    ) : (
                      <Empty
                        message='No news to display'
                        color='niaid.placeholder'
                        headingProps={{ size: 'sm' }}
                        iconProps={{ color: 'niaid.placeholder', opacity: 0.7 }}
                      />
                    )
                  ) : (
                    news.data
                      .slice(0, sections.find(s => s.hash === 'news')?.showMax)
                      .map((news: NewsOrEventsObject) => {
                        return <SectionCard key={news.id} {...news} />;
                      })
                  )}
                </SectionList>
              </Section>

              {/* EVENTS */}
              <Section id='events' title='Events'>
                <SectionList
                  id='events'
                  numItems={events.data.length}
                  sections={sections}
                  setSections={setSections}
                >
                  {!events.data.length ? (
                    events.error?.message ? (
                      <Error
                        minHeight='unset'
                        bg='#fff'
                        message={events.error.message}
                        headingProps={{ fontSize: 'md' }}
                      />
                    ) : (
                      <Empty
                        message='No events to display'
                        color='niaid.placeholder'
                        headingProps={{ size: 'sm' }}
                        iconProps={{ color: 'niaid.placeholder', opacity: 0.7 }}
                      />
                    )
                  ) : (
                    <>
                      {/* Upcoming events */}
                      {upcomingEvents.length > 0 && (
                        <>
                          <Heading as='h3' size='sm' color='gray.600'>
                            Upcoming
                          </Heading>
                          {upcomingEvents
                            .slice(
                              0,
                              sections.find(s => s.hash === 'events')?.showMax,
                            )
                            .map((event: NewsOrEventsObject) => {
                              return <SectionCard key={event.id} {...event} />;
                            })}
                        </>
                      )}
                      {/* Past events */}
                      {pastEvents.length > 0 && (
                        <>
                          <Heading as='h3' size='sm' color='gray.600'>
                            Past events
                          </Heading>
                          {pastEvents
                            .slice(
                              0,
                              sections.find(s => s.hash === 'events')?.showMax,
                            )
                            .map((event: NewsOrEventsObject) => {
                              return <SectionCard key={event.id} {...event} />;
                            })}
                        </>
                      )}
                    </>
                  )}
                </SectionList>
              </Section>

              {/* Webinars */}
              {/* [TO DO]: add webinarsto strapi cms */}
              {/* {webinars.data.length > 0 && (
                <Section id='webinars' title='Webinar Recordings'>
                  <SectionList
                    id='webinars'
                    numItems={webinars.data.length}
                    sections={sections}
                    setSections={setSections}
                  >
                    {!webinars.data.length ? (
                      <Empty
                        message='No webinar recordings to display'
                        color='niaid.placeholder'
                        headingProps={{ size: 'sm' }}
                        iconProps={{ color: 'niaid.placeholder', opacity: 0.7 }}
                      />
                    ) : (
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        {webinars.data.map((webinar: NewsOrEventsObject) => {
                          return (
                            <Card key={webinar.id}>
                              <Box w='100%' height='250px' bg='gray.100'></Box>
                              <CardBody flexDirection='row' p={2}>
                                {webinar.attributes.publishedAt && (
                                  <Text
                                    m={1}
                                    mr={2}
                                    fontWeight='medium'
                                    fontSize='sm'
                                    whiteSpace='nowrap'
                                    color='gray.600'
                                  >
                                    {formatDate(webinar.attributes.publishedAt)}
                                  </Text>
                                )}
                                <Box m={2}>
                                  <Heading as='h3' size='md'>
                                    Title
                                  </Heading>
                                  <Text>Description</Text>
                                </Box>
                              </CardBody>
                            </Card>
                          );
                        })}
                      </SimpleGrid>
                    )}
                  </SectionList>
                </Section>
              )} */}

              {/* Additional Resources */}
              <Section id='resources' title='Additional Resources'>
                <Stack
                  direction={{ base: 'column', sm: 'row' }}
                  divider={<StackDivider borderColor='primary.200' />}
                  spacing={4}
                  fontSize='md'
                >
                  <Link href='/docs'>Documentation</Link>
                  <Link href='/faq'>FAQ</Link>
                  <Link href='mailto:NIAIDDataEcosystem@mail.nih.gov'>
                    Ask a question
                  </Link>
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
                        bgGradient: 'linear(to-r, primary.200, accent.bg)',
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
                        color='gray.600'
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
                          color='gray.600'
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
              <Box position='sticky' top='0px' p={4}>
                <Navigation
                  routes={sections}
                  itemProps={{
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

const fetchEvents = async ({
  populate = '*',
  sort = 'publishedAt:DESC',
  page = 1,
  pageSize = 100,
}): Promise<{
  events: NewsOrEventsObject[];
}> => {
  try {
    const isProd = process.env.NODE_ENV;
    // in dev/staging mode, show drafts.
    const events = await axios.get(
      `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/events?${
        isProd ? 'publicationState=preview&' : ''
      }populate=${populate}&sort=${sort}&pagination[page]=${page}&pagination[pageSize]=${pageSize}`,
    );

    return { events: events.data.data };
  } catch (err: any) {
    throw err;
  }
};

export const fetchWebinars = async ({
  populate = '*',
  sort = 'publishedAt:DESC',
  page = 1,
  pageSize = 100,
}): Promise<{
  webinars: NewsOrEventsObject[];
}> => {
  try {
    const isProd = process.env.NODE_ENV;
    // in dev/staging mode, show drafts.
    const webinars = await axios.get(
      `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/webinars?${
        isProd ? 'publicationState=preview&' : ''
      }populate=${populate}&sort=${sort}&pagination[page]=${page}&pagination[pageSize]=${pageSize}`,
    );

    return { webinars: webinars.data.data };
  } catch (err: any) {
    throw err;
  }
};

export async function getStaticProps() {
  try {
    const news = await fetchNews({ pageSize: 100 })
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

    const events = await fetchEvents({ pageSize: 100 })
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
    const webinars = await fetchWebinars({ pageSize: 100 })
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
