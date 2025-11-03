import { Box, Button, Flex, Icon, Progress, Skeleton } from '@chakra-ui/react';
import React from 'react';
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa6';

import { CarouselControlsProps } from '../types';

export const CarouselControls = ({
  activeItem,
  maxActiveItem,
  constraint,
  totalDots,
  colorPalette,
  gap,
  handleDecrementClick,
  handleIncrementClick,
  handleDotClick,
  handleFocus,
  childrenLength,
  showProgressBar,
  progressPercentage,
  isLoading = false,
}: CarouselControlsProps) => {
  const shouldShowControls = childrenLength > constraint;

  if (!shouldShowControls) {
    return null;
  }

  return (
    <Skeleton
      loading={isLoading}
      width='100%'
      height='32px'
      display='flex'
      alignItems='center'
      justifyContent='center'
    >
      <Button
        aria-label='previous carousel item'
        onClick={handleDecrementClick}
        onFocus={handleFocus}
        disabled={activeItem <= 0}
        mr={showProgressBar ? 0 : `${gap / 3}px`}
        colorPalette={colorPalette}
        variant='ghost'
        minW={0}
        size='sm'
        flexShrink={0}
      >
        <Icon as={FaAngleLeft} boxSize={4} />
      </Button>

      {showProgressBar ? (
        <Box
          flex={1}
          mx={3}
          role='progressbar'
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progressPercentage)}
          aria-label={`Carousel progress: ${Math.round(
            progressPercentage,
          )}% complete`}
        >
          <Progress.Root
            colorPalette={colorPalette}
            value={progressPercentage}
            size='sm'
            borderRadius='full'
            variant='subtle'
            bg={`${colorPalette}.100`}
          >
            <Progress.Track>
              <Progress.Range />
            </Progress.Track>
          </Progress.Root>
        </Box>
      ) : (
        <Flex>
          {Array.from({ length: totalDots }, (_, i) => {
            const currentGroup = Math.floor(activeItem / constraint);
            const isLastGroup = activeItem >= childrenLength - constraint;
            const shouldHighlight = isLastGroup
              ? i === totalDots - 1
              : i === currentGroup;

            return (
              <Box
                aria-label={`carousel indicator ${i + 1} of ${totalDots}${
                  shouldHighlight ? ' (current)' : ''
                }`}
                key={i}
                w={3}
                h={3}
                mx={1}
                borderRadius='50%'
                borderWidth='1px'
                borderColor={`${colorPalette}.500`}
                bg={shouldHighlight ? `${colorPalette}.500` : '#ffffff'}
                cursor='pointer'
                tabIndex={0}
                role='button'
                _hover={{
                  bg: shouldHighlight
                    ? `${colorPalette}.600`
                    : `${colorPalette}.200`,
                  borderColor: `${colorPalette}.600`,
                }}
                _focus={{
                  outline: '2px solid',
                  outlineColor: `${colorPalette}.500`,
                  outlineOffset: '2px',
                }}
                onClick={() => handleDotClick(i)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleDotClick(i);
                  }
                }}
              />
            );
          })}
        </Flex>
      )}

      <Button
        aria-label='next carousel item'
        onClick={handleIncrementClick}
        onFocus={handleFocus}
        disabled={activeItem >= maxActiveItem}
        ml={showProgressBar ? 0 : `${gap / 3}px`}
        variant='ghost'
        minW={0}
        size='sm'
        flexShrink={0}
        colorPalette={colorPalette}
      >
        <Icon as={FaAngleRight} boxSize={4} />
      </Button>
    </Skeleton>
  );
};
