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
      mt={0}
      p={0}
      pb={{
        base: 12,
        sm: 10,
        md: 14,
        lg: 16,
        xl: 16,
      }}
      minH={{
        base: '355px',
        sm: '300px',
        md: '330px',
        lg: '340px',
        xl: '335px',
      }}
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
