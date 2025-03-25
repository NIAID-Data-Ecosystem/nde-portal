import {
  Box,
  Flex,
  Heading,
  HStack,
  SkeletonText,
  Text,
  VStack,
} from '@chakra-ui/react';

export const SectionTitle = ({
  title,
  isLoading,
}: {
  title: string;
  isLoading?: boolean;
}) => {
  return (
    <SkeletonText isLoaded={!isLoading} noOfLines={1} skeletonHeight={10}>
      <Heading as='h2' size='lg'>
        {title}
      </Heading>
    </SkeletonText>
  );
};
