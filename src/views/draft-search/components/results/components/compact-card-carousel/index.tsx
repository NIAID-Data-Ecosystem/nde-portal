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
      minH='300px'
      maxH='500px'
      width='100%'
      maxW='100%'
      overflow='hidden'
      sx={{
        contain: 'layout style size',
        '& *': {
          maxWidth: '100% !important',
          boxSizing: 'border-box !important',
        },
      }}
    >
      <Carousel>
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
