import React from 'react';
import { Skeleton, SkeletonProps, Text } from '@chakra-ui/react';
import { SectionTitle } from '../layouts/section';
import { ErrorMessage } from 'src/components/error';

interface ChartWrapperProps {
  children?: React.ReactNode;
  title?: string;
  description?: string | React.ReactNode;
  skeletonProps?: SkeletonProps;
  isLoading: boolean;
  error: Error | null;
}
export const ChartWrapper = ({
  children,
  title,
  description,
  skeletonProps,
  isLoading,
  error,
}: ChartWrapperProps) => {
  return (
    <>
      {/* Title and description */}
      {title && <SectionTitle as='h4'>{title}</SectionTitle>}
      {description && <Text lineHeight='short'>{description}</Text>}

      {/* Skeleton loader */}
      <Skeleton
        width='100%'
        height='100%'
        isLoaded={!isLoading}
        {...skeletonProps}
      >
        {error && <ErrorMessage message={error.message} my={4} />}
        {children}
      </Skeleton>
    </>
  );
};
