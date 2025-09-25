import {
  Box,
  Card,
  Flex,
  Heading,
  IconButton,
  SimpleGrid,
  SkeletonText,
  Stack,
  StackSeparator,
  Text,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import NDESOCIALS from 'configs/socials.json';
import type { NextPage } from 'next';
import { useEffect, useState } from 'react';
import { FaLinkedinIn, FaSquareFacebook, FaTwitter } from 'react-icons/fa6';
import { EventsQueryResponse } from 'src/api/events/types';
import { NewsQueryResponse } from 'src/api/news/types';
import { fetchAllUpdates } from 'src/api/updates';
import { UpdatesQueryResponse } from 'src/api/updates/types';
import Empty from 'src/components/empty';
import { Error } from 'src/components/error';
import { Link } from 'src/components/link';
import {
  getPageSeoConfig,
  PageContainer,
  PageContent,
} from 'src/components/page-container';
import Navigation from 'src/components/resource-sections/components/navigation';
import {
  HeroBannerContainer,
  HeroBannerText,
} from 'src/views/home/components/hero-banner';
import { Section, SectionList } from 'src/views/news/components/Section';
import SectionCard from 'src/views/news/components/SectionCard';

export interface UpdatesProps {
  data: UpdatesQueryResponse;
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
    { news: NewsQueryResponse[]; events: EventsQueryResponse[] },
    Error
  >({
    queryKey: ['news', 'events'],
    queryFn: async () => {
      const updates = await fetchAllUpdates({
        paginate: { page: 1, pageSize: 100 },
      });
      return {
        news: updates.news,
        events: updates.events,
      };
    },
    initialData: {
      news: data?.news || [],
      events: data?.events || [],
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
        bgImg="url('/assets/news-01.jpg')"
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
            gap={10}
            textAlign={{ base: 'left', lg: 'center' }}
            css={{
              '& h1': {
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
                              color: 'page.placeholdedr',
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
                          .map((news: UpdatesQueryResponse['news'][number]) => {
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
                              <Heading
                                as='h3'
                                textStyle='sm'
                                fontWeight='semibold'
                              >
                                Upcoming
                              </Heading>
                              {upcomingEvents
                                .slice(
                                  0,
                                  sections.find(s => s.hash === 'events')
                                    ?.showMax,
                                )
                                .map(
                                  (
                                    event: UpdatesQueryResponse['events'][number],
                                  ) => {
                                    return (
                                      <SectionCard key={event.id} {...event} />
                                    );
                                  },
                                )}
                            </>
                          )}
                          {/* Past events */}
                          {pastEvents && pastEvents?.length > 0 && (
                            <>
                              <Heading
                                as='h3'
                                textStyle='sm'
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
                                .map(
                                  (
                                    event: UpdatesQueryResponse['events'][number],
                                  ) => {
                                    return (
                                      <SectionCard key={event.id} {...event} />
                                    );
                                  },
                                )}
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
                  gap={4}
                  fontSize='md'
                  separator={<StackSeparator borderColor='primary.200' />}
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
                  gap={4}
                  maxW='700px'
                  css={{
                    '& .card-root': {
                      overflow: 'hidden',
                      _hover: {
                        transform: 'translate(0, 0px)',
                        boxShadow: 'base',
                        transition: 'all 0.1s ease-in-out',
                      },
                      _after: {
                        content: "''",
                        bgGradient: 'to-r',
                        gradientFrom: 'primary.200',
                        gradientTo: 'accent.400',
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
                  <Card.Root className='card-root' variant='outline'>
                    <Card.Body>
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
                    </Card.Body>
                  </Card.Root>
                  {/* Socials */}
                  {NDESOCIALS && NDESOCIALS['socials'] && (
                    <Card.Root className='card-root' variant='outline'>
                      <Card.Body>
                        <Text
                          lineHeight='short'
                          color='gray.800'
                          fontWeight='medium'
                        >
                          Join us on:
                        </Text>
                        <Stack direction='row' gap={6} fontSize='sm' mt={2}>
                          {Object.entries(NDESOCIALS['socials']).map(
                            ([platform, href]) => {
                              let icon =
                                platform === 'twitter' ? (
                                  <FaTwitter />
                                ) : platform === 'linkedin' ? (
                                  <FaLinkedinIn />
                                ) : platform === 'facebook' ? (
                                  <FaSquareFacebook />
                                ) : undefined;

                              return (
                                <IconButton
                                  asChild
                                  key={platform}
                                  aria-label={`${platform} link`}
                                  colorPalette='primary'
                                  variant='subtle'
                                  size='md'
                                >
                                  <a href={href} target='_blank'>
                                    {icon}
                                  </a>
                                </IconButton>
                              );
                            },
                          )}
                        </Stack>
                      </Card.Body>
                    </Card.Root>
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

export async function getStaticProps() {
  try {
    const updates = await fetchAllUpdates({
      paginate: { page: 1, pageSize: 100 },
    });
    return { props: { data: { ...updates } } };
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
