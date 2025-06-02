import React from 'react';
import { FormattedResource } from 'src/utils/api/types';
import { CompactCard } from '../compact-card';
import { Box } from '@chakra-ui/react';
import { Carousel } from 'src/components/carousel';

interface CompactCardCarouselProps {
  data?: FormattedResource[] | null;
  referrerPath?: string;
}

export const CompactCardCarousel = ({
  data,
  referrerPath,
}: CompactCardCarouselProps) => {
  return data && data.length > 0 ? (
    <Box
      mt={{ base: 2, sm: 8 }}
      p={0}
      pb={{ base: 8, md: 12, xl: 16 }}
      minH={{ base: '280px', md: '320px', xl: '350px' }}
      width='100%'
      maxW='100%'
      sx={{
        contain: 'layout style size',
        '& *': {
          maxWidth: '100% !important',
          boxSizing: 'border-box !important',
        },
        height: 'auto',
        '& .padded-carousel': {
          height: 'auto',
          paddingLeft: '4px',
          paddingRight: '4px',
        },
      }}
    >
      <Carousel gap={8}>
        {data.slice(0, 10).map((carouselCard, idx) => {
          return (
            <CompactCard
              key={carouselCard.id + idx}
              data={carouselCard}
              referrerPath={referrerPath}
            />
          );
        })}
      </Carousel>
    </Box>
  ) : (
    <></>
  );
};
