import axios from 'axios';
import { useQuery } from 'react-query';
import React, { useState } from 'react';
import { NewsOrEventsObject, fetchEvents } from 'src/pages/news';
import { formatDate } from 'src/utils/api/helpers';
import { FaAngleRight } from 'react-icons/fa6';
import {
  Box,
  Button,
  Flex,
  Heading,
  Icon,
  Image,
  Text,
  Card,
  CardBody,
  Badge,
} from '@chakra-ui/react';
import { Carousel } from 'src/components/carousel';
import NextLink from 'next/link';
import { Link } from 'src/components/link';

interface NewsCarouselProps {
  news: NewsOrEventsObject[];
  events: NewsOrEventsObject[];
}

export const NewsCarousel = ({
  news: initialNews,
  events: initialEvents,
}: NewsCarouselProps) => {
  const [newsAndEvents, setNewsAndEvents] = useState([
    ...initialNews,
    ...initialEvents,
  ]);
  useQuery<
    {
      news: NewsOrEventsObject[];
      events: NewsOrEventsObject[];
    },
    any,
    { news: NewsOrEventsObject[]; events: NewsOrEventsObject[] }
  >(
    ['news', 'events'],
    async () => {
      const newsData = await fetchNews({ paginate: { page: 1, pageSize: 5 } });
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

      return { news: newsData.news, events: events.data };
    },
    {
      onSuccess(data) {
        if (!data || !(data.news || data.events)) {
          return [];
        }
        const newsAndEvents = [...data.news, ...data.events].sort((a, b) => {
          // Use publishedAt if available, otherwise fallback to updatedAt
          let dateA = a.attributes.publishedAt || a.attributes.updatedAt;
          let dateB = b.attributes.publishedAt || b.attributes.updatedAt;

          return Number(new Date(dateB)) - Number(new Date(dateA));
        });

        setNewsAndEvents(newsAndEvents);
      },
    },
  );
  return newsAndEvents.length > 0 ? (
    <Box
      mt={{ base: 8, sm: 20 }}
      p={{ base: 0, sm: 6 }}
      minH='500px'
      width='100%'
      borderRadius='lg'
    >
      <Heading
        as='h3'
        fontSize='lg'
        color='primary.600'
        fontWeight='normal'
        pb={4}
        mb={4}
        borderBottom='1px solid'
        borderBottomColor='primary.200'
      >
        Recent News Releases
      </Heading>

      <Carousel>
        {newsAndEvents.slice(0, 5).map((news, idx) => {
          return (
            <Card key={news.id + idx} overflow='hidden' flex={1}>
              <Flex
                w='100%'
                p={0}
                pt={`${(9 / 16) * 100}%`}
                position='relative'
                justifyContent='center'
                overflow='hidden'
              >
                <Flex
                  position='absolute'
                  top={0}
                  left={0}
                  w='100%'
                  height='100%'
                  alignItems='flex-start'
                  justifyContent='center'
                >
                  <Image
                    objectFit='contain'
                    w='100%'
                    maxHeight='100%'
                    src={
                      news.attributes?.image?.data
                        ? `${process.env.NEXT_PUBLIC_STRAPI_API_URL}${news.attributes.image.data[0].attributes.url}`
                        : `/assets/news-thumbnail.png`
                    }
                    alt={
                      news.attributes?.image?.data
                        ? news.attributes.image.data[0].attributes
                            .alternativeText
                        : 'Generic image'
                    }
                  />
                </Flex>
              </Flex>

              <Box p={4}>
                <Heading
                  p={0}
                  fontSize='lg'
                  fontWeight='semibold'
                  lineHeight='short'
                  size='h5'
                >
                  {news.attributes.name}
                  {news.attributes.eventDate && (
                    <Badge
                      colorScheme='primary'
                      variant='solid'
                      bg='status.info'
                      size='xs'
                      fontSize='12px'
                    >
                      Event
                    </Badge>
                  )}
                </Heading>
                <CardBody p={0}>
                  {
                    <Text as='span' mt={2} fontSize='sm' lineHeight='short'>
                      {formatDate(
                        news.attributes.publishedAt ||
                          news.attributes.updatedAt,
                      )}{' '}
                      &mdash;
                      {news.attributes.shortDescription}
                      <NextLink href={`news/#${news.attributes.slug}`} passHref>
                        <Link
                          as='span'
                          fontSize='sm'
                          bg='transparent'
                          lineHeight='tall'
                          mx={1}
                        >
                          (<Text>view full release</Text>)
                        </Link>
                      </NextLink>
                    </Text>
                  }
                </CardBody>
              </Box>
            </Card>
          );
        })}
      </Carousel>
      <Flex flex={1} justifyContent='center' mt={4}>
        <NextLink
          href={{
            pathname: `/news`,
          }}
          prefetch={false}
          passHref
        >
          <Button as='span' size='sm' rightIcon={<Icon as={FaAngleRight} />}>
            All news releases
          </Button>
        </NextLink>
      </Flex>
    </Box>
  ) : (
    <></>
  );
};

interface NewsQueryParams {
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
export const fetchNews = async (
  params?: NewsQueryParams,
): Promise<{
  news: NewsOrEventsObject[];
}> => {
  try {
    const isProd =
      process.env.NEXT_PUBLIC_BASE_URL === 'https://data.niaid.nih.gov';
    // in dev/staging mode, show drafts.
    const news = await axios.get(
      `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/news-reports`,
      {
        params: {
          publicationState: isProd ? 'live' : 'preview',
          populate: {
            fields: [
              'name',
              'slug',
              'publishedAt',
              'updatedAt',
              'shortDescription',
            ],
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
    return { news: news.data.data };
  } catch (err) {
    throw err;
  }
};
