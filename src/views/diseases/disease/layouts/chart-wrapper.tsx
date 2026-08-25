import React from 'react';
import { Skeleton, SkeletonProps } from '@chakra-ui/react';
import { ErrorMessage } from 'src/components/error';
import { SectionTitle, SectionDescription } from '../layouts/section';

interface ChartWrapperProps {
  children?: React.ReactNode;
  title?: string;
  description?: string | React.ReactNode;
  skeletonProps?: SkeletonProps;
  loading: boolean;
  error: Error | null;
}
export const ChartWrapper = ({
  children,
  title,
  description,
  skeletonProps,
  loading,
  error,
}: ChartWrapperProps) => {
  return (
    <>
      {/* Title and description */}
      {title && <SectionTitle as='h4'>{title}</SectionTitle>}
      {description &&
        (typeof description === 'string' ? (
          <SectionDescription>{description}</SectionDescription>
        ) : (
          description
        ))}
      {/* Skeleton loader */}
      <Skeleton
        role='status'
        width='100%'
        height='100%'
        loading={!!loading}
        py={4}
        {...skeletonProps}
      >
        {error && <ErrorMessage message={error.message} my={4} />}
        {children}
      </Skeleton>
    </>
  );
};
