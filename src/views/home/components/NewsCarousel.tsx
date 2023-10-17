import axios from 'axios';
import { useQuery } from 'react-query';
import React, { useState } from 'react';
import { NewsOrEventsObject } from 'src/pages/news';
import { formatDate } from 'src/utils/api/helpers';
import { FaChevronRight } from 'react-icons/fa';
import {
  Box,
  Button,
  Flex,
  Heading,
  Icon,
  Image,
  Text,
  Card,
  CardTitle,
  CardBody,
  Link,
} from 'nde-design-system';
import { Carousel } from 'src/components/carousel';
import NextLink from 'next/link';

interface NewsCarouselProps {
  news: NewsOrEventsObject[];
}

export const NewsCarousel = ({ news: initialData }: NewsCarouselProps) => {
  const [news, setNews] = useState(initialData);

  useQuery<
    {
      news: NewsOrEventsObject[];
    },
    any,
    { news: NewsOrEventsObject[] }
  >(['news'], () => fetchNews({ paginate: { page: 1, pageSize: 5 } }), {
    onSuccess(data) {
      if (!data || !data.news) {
        return [];
      }
      setNews(data.news);
    },
  });

  return news.length > 0 ? (
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
        {news.slice(0, 5).map(news => {
          return (
            <Card key={news.id} overflow='hidden'>
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
                        ? `${process.env.NEXT_PUBLIC_STRAPI_ASSETS_URL}${news.attributes.image.data[0].attributes.url}`
                        : `/assets/home-bg.webp`
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
                <CardTitle p={0} fontSize='lg' lineHeight='short'>
                  {news.attributes.name}
                </CardTitle>
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
                          variant='unstyled'
                          fontSize='sm'
                          color='gray.600'
                          bg='transparent'
                          lineHeight='tall'
                        >
                          {' '}
                          Read more...
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
          passHref
          prefetch={false}
        >
          <Button size='sm' rightIcon={<Icon as={FaChevronRight} />}>
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
