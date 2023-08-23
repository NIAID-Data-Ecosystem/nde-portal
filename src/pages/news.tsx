import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardTitle,
  Flex,
  Heading,
  Icon,
  Link,
  SimpleGrid,
  Stack,
  StackDivider,
  Tag,
  Text,
} from 'nde-design-system';
import type { NextPage } from 'next';
import { PageContainer } from 'src/components/page-container';
import { serialize } from 'next-mdx-remote/serialize';
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote';
import { Error } from 'src/components/error';
import { useMDXComponents } from 'mdx-components';
import axios from 'axios';
import Empty from 'src/components/empty';
import Navigation from 'src/components/resource-sections/components/navigation';
import { formatDate } from 'src/utils/api/helpers';
import { FaYoutube } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

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
  data: { news: NewsOrEventsObject[]; events: NewsOrEventsObject[] };
  error?: { message: string };
}

const News: NextPage<NewsProps> = props => {
  const { data, error } = props;

  const MDXComponents = useMDXComponents({});

  const [sections, setSections] = useState([
    {
      title: 'News',
      hash: 'news',
      showMax: 3,
    },
    {
      title: 'Events',
      hash: 'events',
      showMax: 5,
    },
    {
      title: 'Webinar Recordings',
      hash: 'webinars',
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

  const Section = ({
    id,
    title,
    children,
  }: {
    id: string;
    title: string;
    children: React.ReactNode;
  }) => {
    return (
      <Box id={id} w='100%'>
        <Heading
          as='h2'
          size='lg'
          bg='page.alt'
          px={2}
          py={4}
          mt={6}
          mb={4}
          borderBottom='1px solid'
          borderBottomColor='blackAlpha.200'
          position='sticky'
          top='0px'
          zIndex='banner'
        >
          {title}
        </Heading>
        <Box px={2}>{children}</Box>
      </Box>
    );
  };

  const SectionList = ({
    id,
    numItems,
    increaseBy = 5,
    children,
  }: {
    id: string;
    numItems: number;
    increaseBy?: number;
    children: React.ReactNode;
  }) => {
    const currentSection = sections.findIndex(s => s.hash === id);
    const { showMax } = sections[currentSection];
    return (
      <Stack flex={1}>
        {children}
        {showMax && showMax < numItems && (
          <Flex justifyContent='center' my={4}>
            <Button
              size='sm'
              colorScheme='gray'
              variant='outline'
              onClick={() => {
                setSections(prev => {
                  const currentSection = prev.find(s => s.hash === id);
                  if (
                    currentSection?.showMax &&
                    currentSection.showMax < numItems
                  ) {
                    currentSection.showMax += increaseBy;
                  }
                  return [...prev];
                });
              }}
            >
              Show More
            </Button>
          </Flex>
        )}
      </Stack>
    );
  };

  const NewsOrEventCard = ({ mdx, attributes }: NewsOrEventsObject) => {
    const categoryColors = [
      'gray',
      'gray',
      'gray',
      'blue',
      'orange',
      'purple',
      'green',
      'red',
      'teal',
      'pink',
      'yellow',
      'cyan',
    ];
    return (
      <Card style={{ boxShadow: 'none' }}>
        <Flex p={2} flexWrap={['wrap', 'nowrap']}>
          {attributes.publishedAt && (
            <Text
              p={[2, 4]}
              fontWeight='medium'
              fontSize='sm'
              whiteSpace='nowrap'
              color='gray.600'
            >
              {formatDate(attributes.publishedAt)}
            </Text>
          )}
          <Box p={2}>
            <CardTitle as='h3'>{attributes.name}</CardTitle>
            {attributes.subtitle && (
              <Heading
                as='h4'
                fontWeight='semibold'
                size='sm'
                color='gray.700'
                my={0}
              >
                {attributes.subtitle}
              </Heading>
            )}
            <CardBody p={0}>
              {/* useful for client-side fetch mdx handling */}
              {/* <ReactMarkdown
                rehypePlugins={[rehypeRaw, remarkGfm]}
                linkTarget='_blank'
                components={MDXComponents}
              >
                {`${attributes.description}`}
              </ReactMarkdown> */}
              <MDXRemote {...mdx.description} components={MDXComponents} />
            </CardBody>
            {attributes.categories && attributes.categories.data.length && (
              <CardFooter p={0} mt={2}>
                {attributes.categories.data.map((category, i) => {
                  const { name } = category.attributes;
                  return (
                    <Tag
                      key={category.id}
                      m={1}
                      colorScheme={categoryColors[category.id]}
                      variant='subtle'
                      size='sm'
                    >
                      {name}
                    </Tag>
                  );
                })}
              </CardFooter>
            )}
          </Box>
        </Flex>
      </Card>
    );
  };

  return (
    <PageContainer
      hasNavigation
      title='Documentation'
      metaDescription='Documentation for the portal.'
      px={0}
      py={0}
      disableSearchBar
    >
      {/* <PageContent justifyContent='center'> */}
      {error ? (
        <Error>
          <Flex flexDirection='column' alignItems='center'>
            <Text>{error.message}</Text>
          </Flex>
        </Error>
      ) : data ? (
        <Flex justifyContent='center' bg='page.alt' p={2}>
          <Flex m='0 auto' maxW='1320px'>
            <Flex flexDirection='column' mb={32} flex={3} alignItems='center'>
              {/* NEWS */}
              <Section id='news' title='News'>
                <SectionList id='news' numItems={data.news.length}>
                  {!data.news.length ? (
                    <Empty
                      message='No news to display'
                      color='niaid.placeholder'
                      headingProps={{ size: 'sm' }}
                      iconProps={{ color: 'niaid.placeholder', opacity: 0.7 }}
                    />
                  ) : (
                    data.news
                      .slice(0, sections.find(s => s.hash === 'news')?.showMax)
                      .map((news: NewsOrEventsObject) => {
                        return <NewsOrEventCard key={news.id} {...news} />;
                      })
                  )}
                </SectionList>
              </Section>

              {/* EVENTS */}
              <Section id='events' title='Events'>
                <SectionList id='events' numItems={data.events.length}>
                  {!data.events.length ? (
                    <Empty
                      message='No events to display'
                      color='niaid.placeholder'
                      headingProps={{ size: 'sm' }}
                      iconProps={{ color: 'niaid.placeholder', opacity: 0.7 }}
                    />
                  ) : (
                    data.events
                      .slice(
                        0,
                        sections.find(s => s.hash === 'events')?.showMax,
                      )
                      .map((event: NewsOrEventsObject) => {
                        return <NewsOrEventCard key={event.id} {...event} />;
                      })
                  )}
                </SectionList>
              </Section>

              {/* Webinars */}
              <Section id='webinars' title='Webinar Recordings'>
                <SectionList id='webinars' numItems={data.news.length}>
                  {!data.news.length ? (
                    <Empty
                      message='No webinar recordings to display'
                      color='niaid.placeholder'
                      headingProps={{ size: 'sm' }}
                      iconProps={{ color: 'niaid.placeholder', opacity: 0.7 }}
                    />
                  ) : (
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      {data.news.map((webinar: NewsOrEventsObject) => {
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

              {/* Additional Resources */}
              <Section id='resources' title='Additional Resources'>
                <Stack
                  direction={{ base: 'column', sm: 'row' }}
                  divider={<StackDivider borderColor='primary.200' />}
                  spacing={4}
                  fontSize='sm'
                >
                  <Link href='https://niaid-data.readme.io/'>
                    Documentation
                  </Link>
                  <Link href='/faq'>FAQ</Link>
                  <Link href='#'>SlideShare</Link>
                  <Link href='#'>Ask a question</Link>
                </Stack>
              </Section>

              {/* Join the Community */}
              <Section id='community' title='Join the community'>
                <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={4}>
                  {/* Email */}
                  <Card
                    transform='translate(0, 2px)'
                    boxShadow='sm'
                    transition='all 0.1s ease-in-out'
                    _hover={{
                      transform: 'translate(0, -2px)',
                      boxShadow: 'base',
                      transition: 'all 0.1s ease-in-out',
                    }}
                  >
                    <CardBody>
                      <Text lineHeight='short' color='gray.800'>
                        Share your discovery Portal story with us by{' '}
                        <Link href='mailto:NIAIDDataEcosystem@mail.nih.gov'>
                          emailing the team
                        </Link>
                      </Text>
                    </CardBody>
                  </Card>
                  {/* Follow */}
                  <Card
                    transform='translate(0, 2px)'
                    boxShadow='sm'
                    transition='all 0.1s ease-in-out'
                    _hover={{
                      transform: 'translate(0, -2px)',
                      boxShadow: 'base',
                      transition: 'all 0.1s ease-in-out',
                    }}
                  >
                    <CardBody>
                      <Text
                        lineHeight='short'
                        color='text.heading'
                        fontWeight='semibold'
                      >
                        Follow us on
                      </Text>
                      <Stack
                        direction={{ base: 'column', md: 'row' }}
                        divider={<StackDivider borderColor='primary.200' />}
                        spacing={4}
                        fontSize='sm'
                      >
                        <a href='#'>
                          <Icon as={FaYoutube} color='red' boxSize={6} />
                        </a>
                      </Stack>
                    </CardBody>
                  </Card>
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
                <Navigation routes={sections} />
              </Box>
            </Box>
          </Flex>
        </Flex>
      ) : (
        <Empty message='Nothing to display.' alignSelf='center' h='50vh' />
      )}
    </PageContainer>
  );
};

export async function getStaticProps() {
  const fetchData = async () => {
    try {
      const news = await axios.get(
        `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/news-reports?populate=*&sort=publishedAt:DESC`,
      );

      const events = await axios.get(
        `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/events?populate=*&sort=publishedAt:DESC`,
      );

      return { news: news.data.data, events: events.data.data };
    } catch (err) {
      throw err;
    }
  };
  try {
    const contents = await fetchData();
    const [news, events] = await Promise.all(
      Object.entries(contents).map(async ([_, docs]) => {
        return Promise.all(
          docs.map(async (doc: any) => {
            try {
              if (doc?.attributes?.description) {
                const body = doc.attributes.description
                  .replace(/{/g, '(')
                  .replace(/}/g, ')');
                const compiledMDXDescription = await serialize(body);
                return { ...doc, mdx: { description: compiledMDXDescription } };
              }
              return doc;
            } catch (err) {
              throw err;
            }
          }),
        );
      }),
    );
    return { props: { data: { news, events } } };
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
