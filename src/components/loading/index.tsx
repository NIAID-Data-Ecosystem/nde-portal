import React from 'react';
import {Flex, Spinner, SpinnerProps} from 'nde-design-system';

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
          emptyColor={props.emptyColor || 'gray.200'}
          label={props.label || 'loading'}
          size={props.size || 'lg'}
          speed={props.speed || '0.65s'}
          thickness={props.thickness || '4px'}
        />
      </Flex>
    );
  }
  return <>{children || null}</>;
};

export default LoadingSpinner;
