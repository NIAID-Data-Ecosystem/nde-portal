import React, { useRef } from 'react';
import { Box, Flex } from '@chakra-ui/react';
import { useResizeObserver } from 'usehooks-ts';
import { CarouselProps } from './types';
import { useCarouselState } from './hooks/useCarouselState';
import { useCarouselNavigation } from './hooks/useCarouselNavigation';
import { CarouselControls } from './components/CarouselControls';
import { Track } from './components/Track';
import { Item } from './components/Item';

export const Carousel = ({
  children,
  colorScheme = 'primary',
  gap = 32,
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
    colorScheme,
    gap,
    childrenLength: children.length,
    showProgressBar,
    progressPercentage,
    ...navigation,
  };

  return (
    <Flex ref={containerRef} direction='column' align='center'>
      <Box className='padded-carousel' w='100%' overflow='hidden' p={2}>
        {itemWidth > 0 && (
          <Track {...trackProps}>
            {children.map((child, index) => (
              <Item {...itemProps} index={index} key={index}>
                {child}
              </Item>
            ))}
          </Track>
        )}
        <Flex
          ref={controlsRef}
          w={`${itemWidth}px`}
          mx='auto'
          alignItems='center'
          justify={showProgressBar ? 'space-between' : 'center'}
          minH='44px'
        >
          <CarouselControls {...controlsProps} />
        </Flex>
      </Box>
    </Flex>
  );
};
