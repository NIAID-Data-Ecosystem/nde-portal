import React from 'react';
import { Box, Button, Flex, Icon, Progress, Skeleton } from '@chakra-ui/react';
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa6';
import { CarouselControlsProps } from '../types';

export const CarouselControls = ({
  activeItem,
  maxActiveItem,
  constraint,
  totalDots,
  colorScheme,
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

  // Show skeleton loading state for controls
  if (isLoading) {
    return <Skeleton height='32px' width='120px' borderRadius='md' />;
  }

  if (!shouldShowControls) {
    return null;
  }

  return (
    <>
      <Button
        aria-label='previous carousel item'
        onClick={handleDecrementClick}
        onFocus={handleFocus}
        isDisabled={activeItem <= 0}
        mr={showProgressBar ? 0 : `${gap / 3}px`}
        color={`${colorScheme}.800`}
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
          <Progress
            value={progressPercentage}
            colorScheme={colorScheme}
            size='sm'
            borderRadius='full'
            bg={`${colorScheme}.100`}
          />
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
                borderColor={`${colorScheme}.500`}
                bg={shouldHighlight ? `${colorScheme}.500` : '#ffffff'}
                cursor='pointer'
                tabIndex={0}
                role='button'
                _hover={{
                  bg: shouldHighlight
                    ? `${colorScheme}.600`
                    : `${colorScheme}.200`,
                  borderColor: `${colorScheme}.600`,
                }}
                _focus={{
                  outline: '2px solid',
                  outlineColor: `${colorScheme}.500`,
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
        isDisabled={activeItem >= maxActiveItem}
        ml={showProgressBar ? 0 : `${gap / 3}px`}
        color={`${colorScheme}.800`}
        variant='ghost'
        minW={0}
        size='sm'
        flexShrink={0}
      >
        <Icon as={FaAngleRight} boxSize={4} />
      </Button>
    </>
  );
};
