import { Box, Flex } from '@chakra-ui/react';
import React, { useRef } from 'react';
import { useResizeObserver } from 'usehooks-ts';

import { CarouselControls } from './components/CarouselControls';
import { Item } from './components/Item';
import { Track } from './components/Track';
import { useCarouselNavigation } from './hooks/useCarouselNavigation';
import { useCarouselState } from './hooks/useCarouselState';
import { CarouselProps } from './types';

export const Carousel = ({
  children,
  colorPalette = 'primary',
  gap = 32,
  isLoading = false,
}: CarouselProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const { width = 0 } = useResizeObserver({
    ref: containerRef,
    box: 'border-box',
  });

  const carouselState = useCarouselState({ children, width, gap });
  const {
    itemWidth,
    activeItem,
    setActiveItem,
    trackIsActive,
    setTrackIsActive,
    constraint,
    showProgressBar,
    positions,
    maxActiveItem,
    totalDots,
    progressPercentage,
  } = carouselState;

  const navigation = useCarouselNavigation({
    setActiveItem,
    setTrackIsActive,
    constraint,
    maxActiveItem,
  });

  // Props for child components
  const itemProps = {
    setActiveItem,
    setTrackIsActive,
    trackIsActive,
    constraint,
    itemWidth,
    positions,
    gap,
  };

  const trackProps = {
    setTrackIsActive,
    trackIsActive,
    setActiveItem,
    activeItem,
    constraint,
    positions,
    children,
    maxActiveItem,
  };

  const controlsProps = {
    activeItem,
    maxActiveItem,
    constraint,
    totalDots,
    colorPalette,
    gap,
    childrenLength: children.length,
    showProgressBar,
    progressPercentage,
    isLoading,
    ...navigation,
  };

  return (
    <Flex ref={containerRef} direction='column' align='center'>
      <Box className='padded-carousel' w='100%' overflow='hidden' p={2}>
        <Track {...trackProps}>
          {children.map((child, index) => (
            <Item {...itemProps} index={index} key={index}>
              {child}
            </Item>
          ))}
        </Track>
        <Flex
          ref={controlsRef}
          mx='auto'
          minWidth={`${itemWidth}px`}
          alignItems='center'
          justifyContent={showProgressBar ? 'space-between' : 'center'}
          minH='44px'
          mt={4}
        >
          <CarouselControls {...controlsProps} />
        </Flex>
      </Box>
    </Flex>
  );
};
