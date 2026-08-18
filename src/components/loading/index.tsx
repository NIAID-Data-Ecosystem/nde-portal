import React from 'react';
import { Flex, Spinner, SpinnerProps, VisuallyHidden } from '@chakra-ui/react';

/**
 * Loading Spinner returns spinner when loading and returns the content otherwise.
 */

interface LoadingSpinnerProps extends SpinnerProps {
  isLoading: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  isLoading,
  children,
  ...props
}) => {
  if (isLoading) {
    return (
      <Flex w={'100%'} p={4} justifyContent='center' {...props}>
        <Spinner
          color={props.color || 'primary.500'}
          size={props.size || 'lg'}
          /*
           * v2's `speed`, `thickness`, `emptyColor` and `label` props are gone in
           * v3: the first two are plain style props, the track colour is a CSS
           * variable on the spinner recipe, and the label is now just text.
           */
          animationDuration='0.65s'
          borderWidth='4px'
          css={{ '--spinner-track-color': 'colors.gray.200' }}
        />
        <VisuallyHidden>loading</VisuallyHidden>
      </Flex>
    );
  }
  return <>{children || null}</>;
};

export default LoadingSpinner;
