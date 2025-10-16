import { Card, Flex, Image, Stack, Tag } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import NextLink from 'next/link';
import React from 'react';
import { fetchAllUpdates } from 'src/api/updates';
import { UpdatesQueryResponse } from 'src/api/updates/types';
import { ArrowButton } from 'src/components/button.tsx/arrow-button';
import { Carousel } from 'src/components/carousel';
import { Link } from 'src/components/link';

import { transformFeaturedContentForCarousel } from './helpers';
import { formatImage } from './helpers';

export const UpdatesCarousel = ({
  news: initialNews,
  events: initialEvents,
  features: initialFeatures,
}: UpdatesQueryResponse) => {
  const { data, error, isError } = useQuery({
    queryKey: ['news', 'events', 'features'],
    queryFn: () =>
      fetchAllUpdates({
        paginate: { page: 1, pageSize: 100 },
      }),
    initialData: {
      news: initialNews,
      events: initialEvents,
      features: initialFeatures,
    },
  });

  // Combine and sort data from most recent to least recent
  const carouselCards = React.useMemo(() => {
    if (!data) return [];

    const transformed_features = transformFeaturedContentForCarousel(
      data.features,
    );
    const sortedResults = [
      ...(data?.news || []),
      ...(data?.events || []),
      ...(transformed_features || []),
    ]
      .map(item => ({
        ...item,
        imageFormatted: formatImage(item?.image),
        cardHref:
          item.type === 'feature'
            ? `/features/${item.slug}`
            : `/updates/#${item.slug}`,
      }))
      .sort((a, b) => {
        // Use publishedAt if available, otherwise fallback to updatedAt
        let dateA = a.publishedAt || a.updatedAt;
        let dateB = b.publishedAt || b.updatedAt;

        return Number(new Date(dateB)) - Number(new Date(dateA));
      });

    return sortedResults;
  }, [data]);

  if (isError && !carouselCards) {
    console.log('Error fetching updates for carousel:', error);
    return <></>;
  }
  return carouselCards && carouselCards.length > 0 ? (
    <Flex flexDirection='column' justifyContent='center' width='100%'>
      <Carousel>
        {carouselCards.slice(0, 10).map(card => {
          const tag = card?.eventDate
            ? { label: 'Event', colorPalette: 'primary' }
            : card?.type === 'feature'
            ? { label: 'Feature', colorPalette: 'primary' }
            : null;

          return (
            <Card.Root key={card.id} overflow='hidden' flex={1} size='sm'>
              <Image
                src={card.imageFormatted.src}
                alt={card.imageFormatted.alt}
                objectFit='contain'
              />
              <Card.Body gap={2}>
                <Stack
                  lineHeight='normal'
                  flexDirection='column'
                  alignItems='flex-start'
                >
                  {tag && (
                    <Tag.Root
                      verticalAlign='middle'
                      colorPalette={tag.colorPalette}
                    >
                      <Tag.Label>{tag.label}</Tag.Label>
                    </Tag.Root>
                  )}
                  <Card.Title>
                    <Link asChild mr={2}>
                      <NextLink href={card.cardHref}>{card.name}</NextLink>
                    </Link>
                  </Card.Title>
                </Stack>

                <Card.Description>
                  {new Date(
                    card.publishedAt || card.updatedAt,
                  ).toLocaleDateString()}
                  &mdash;
                  {card.shortDescription}
                </Card.Description>
                {/* <Link asChild fontSize='sm' mx={1}>
                  <NextLink href={card.cardHref}>View full release</NextLink>
                </Link> */}
              </Card.Body>
            </Card.Root>
          );
        })}
      </Carousel>
      <ArrowButton href='/updates' size='sm' m='0 auto' hasArrow>
        All updates
      </ArrowButton>
    </Flex>
  ) : (
    <></>
  );
};
