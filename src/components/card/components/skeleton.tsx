import { Skeleton, SkeletonProps } from '@chakra-ui/react';

// Not sure if we need this yet or can use regular skeleton
export const CardSkeleton = ({
  children,
  loading,
  ...props
}: SkeletonProps) => {
  return (
    <Skeleton
      // as='section'
      // loading={loading}
      // minHeight={loading ? '200px' : 'unset'}
      // w='100%'
      // boxShadow='low'
      // borderRadius='semi'
      // borderColor='gray.200'
      // py={4}
      // px={[4, 6, 8]}
      // fontSize='sm'
      {...props}
    >
      {children}
    </Skeleton>
  );
};
