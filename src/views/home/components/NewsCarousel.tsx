import axios from 'axios';
import { useQuery } from 'react-query';
import React from 'react';
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
import { fetchAllFeaturedPages } from 'src/views/features/helpers';

interface NewsCarouselProps {
  news: NewsOrEventsObject[];
  events: NewsOrEventsObject[];
  features: NewsOrEventsObject[];
}

export const NewsCarousel = ({
  news: initialNews,
  events: initialEvents,
  features: initialFeatures,
}: NewsCarouselProps) => {
  const {
    data: carouselCards,
    error,
    isError,
  } = useQuery<
    {
      news: NewsOrEventsObject[];
      events: NewsOrEventsObject[];
      features: NewsOrEventsObject[];
    },
    Error,
    NewsOrEventsObject[]
  >(
    ['news', 'events', 'features'],
    async () => {
      try {
        // Parallel fetching of news, events, and features using Promise.all
        const [newsResponse, featuresResponse, eventsResponse] =
          await Promise.all([
            fetchNews({ paginate: { page: 1, pageSize: 5 } }),
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
              paginate: { page: 1, pageSize: 5 },
            }),
            fetchEvents({ paginate: { page: 1, pageSize: 5 } }),
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
            shortDescription: item.attributes.subtitle,
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
        throw new Error(
          `Data fetching error: ${
            error.message || 'An unknown error occurred'
          }`,
        );
      }
    },
    {
      initialData: {
        news: initialNews,
        events: initialEvents,
        features: initialFeatures,
      },
      select: data => {
        if (!data) return [];
        // Combine and sort data from most recent to least recent
        const sortedResults = [
          ...(data?.features || []),
          ...(data?.news || []),
          ...(data?.events || []),
        ].sort((a, b) => {
          // Use publishedAt if available, otherwise fallback to updatedAt
          let dateA = a.attributes.publishedAt || a.attributes.updatedAt;
          let dateB = b.attributes.publishedAt || b.attributes.updatedAt;

          return Number(new Date(dateB)) - Number(new Date(dateA));
        });

        return sortedResults;
      },
    },
  );

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
        Recent News Releases
      </Heading>

      <Carousel>
        {carouselCards.slice(0, 5).map((carouselCard, idx) => {
          const image = carouselCard.attributes?.image?.data
            ? Array.isArray(carouselCard.attributes.image.data)
              ? `${process.env.NEXT_PUBLIC_STRAPI_API_URL}${carouselCard.attributes.image.data[0].attributes.url}`
              : `${process.env.NEXT_PUBLIC_STRAPI_API_URL}${carouselCard.attributes.image.data.attributes.url}`
            : '/assets/news-thumbnail.png';

          const image_alt_text = carouselCard.attributes?.image?.data
            ? Array.isArray(carouselCard.attributes.image.data)
              ? `${carouselCard.attributes.image.data[0].attributes.alternativeText}`
              : `${carouselCard.attributes.image.data.attributes.alternativeText}`
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
                  {carouselCard.attributes.name}
                  {carouselCard.attributes.eventDate && (
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
                        carouselCard.attributes.publishedAt ||
                          carouselCard.attributes.updatedAt,
                      )}{' '}
                      &mdash;
                      {carouselCard.attributes.shortDescription}
                      {carouselCard.type === 'feature' ? (
                        <NextLink
                          href={`features/${carouselCard.attributes.slug}`}
                          passHref
                        >
                          <Link
                            as='span'
                            fontSize='sm'
                            bg='transparent'
                            lineHeight='tall'
                            mx={1}
                          >
                            (<Text>view featured page</Text>)
                          </Link>
                        </NextLink>
                      ) : (
                        <NextLink
                          href={`news/#${carouselCard.attributes.slug}`}
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
                      )}
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
  } catch (err: any) {
    throw err.response;
  }
};
