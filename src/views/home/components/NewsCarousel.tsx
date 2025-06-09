import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { NewsOrEventsObject, fetchEvents } from 'src/pages/updates';
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
  const {
    data: carouselCards,
    error,
    isError,
  } = useQuery<
    {
      news: NewsOrEventsObject[];
      events: NewsOrEventsObject[];
    },
    Error,
    NewsOrEventsObject[]
  >({
    queryKey: ['news', 'events'],
    queryFn: async () => {
      try {
        // Parallel fetching of news and events using Promise.all
        const [newsResponse, eventsResponse] = await Promise.all([
          fetchNews({ paginate: { page: 1, pageSize: 5 } }),
          fetchEvents({ paginate: { page: 1, pageSize: 5 } }),
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
        throw new Error(
          `Data fetching error: ${
            error.message || 'An unknown error occurred'
          }`,
        );
      }
    },
    initialData: {
      news: initialNews,
      events: initialEvents,
    },
    select: data => {
      if (!data) return [];
      // Combine and sort data from most recent to least recent
      const sortedResults = [
        ...(data?.news || []),
        ...(data?.events || []),
      ].sort((a, b) => {
        // Use publishedAt if available, otherwise fallback to updatedAt
        let dateA = a.publishedAt || a.updatedAt;
        let dateB = b.publishedAt || b.updatedAt;

        return Number(new Date(dateB)) - Number(new Date(dateA));
      });

      return sortedResults;
    },
  });

  if (isError && !carouselCards) {
    return <></>;
  }
  return carouselCards && carouselCards.length > 0 ? (
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
        Updates
      </Heading>

      <Carousel>
        {carouselCards.slice(0, 10).map((carouselCard, idx) => {
          const image = carouselCard?.image
            ? Array.isArray(carouselCard.image)
              ? `${process.env.NEXT_PUBLIC_STRAPI_API_URL}${carouselCard.image[0].url}`
              : `${process.env.NEXT_PUBLIC_STRAPI_API_URL}${carouselCard.image.url}`
            : '/assets/news-thumbnail.png';

          const image_alt_text = carouselCard?.image
            ? Array.isArray(carouselCard.image)
              ? `${carouselCard.image[0].alternativeText}`
              : `${carouselCard.image.alternativeText}`
            : 'News Thumbnail Image';
          return (
            <Card key={carouselCard.id + idx} overflow='hidden' flex={1}>
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
                  {image && (
                    <Image
                      objectFit='contain'
                      w='100%'
                      maxHeight='100%'
                      src={image}
                      alt={image_alt_text}
                    />
                  )}
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
                  {carouselCard.name}
                  {carouselCard.eventDate && (
                    <Badge
                      colorScheme='primary'
                      variant='solid'
                      bg='status.info'
                      size='xs'
                      fontSize='12px'
                      mx={1}
                    >
                      Event
                    </Badge>
                  )}
                  {carouselCard.type === 'feature' && (
                    <Badge
                      colorScheme='accent'
                      variant='solid'
                      size='xs'
                      fontSize='12px'
                      mx={1}
                    >
                      Feature
                    </Badge>
                  )}
                </Heading>
                <CardBody p={0}>
                  {
                    <Text as='span' mt={2} fontSize='sm' lineHeight='short'>
                      {formatDate(
                        carouselCard.publishedAt || carouselCard.updatedAt,
                      )}{' '}
                      &mdash;
                      {carouselCard.shortDescription}
                      <NextLink
                        href={`updates/#${carouselCard.slug.replace(
                          'news-report',
                          'update',
                        )}`}
                        passHref
                      >
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
            pathname: `/updates`,
          }}
          prefetch={false}
          passHref
        >
          <Button as='span' size='sm' rightIcon={<Icon as={FaAngleRight} />}>
            All updates
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
    const isProd = process.env.NEXT_PUBLIC_APP_ENV === 'production';
    // in dev/staging mode, show drafts.
    const news = await axios.get(
      `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/news-reports`,
      {
        params: {
          publicationState: isProd ? 'live' : 'preview',
          populate: '*',
          sort: { publishedAt: 'desc', updatedAt: 'desc' },
          paginate: { page: 1, pageSize: 100 },
          ...params,
        },
      },
    );
    return { news: news.data.data };
  } catch (err: any) {
    throw err.response;
  }
};
