import { Box, SkeletonText, Text, VStack } from '@chakra-ui/react';
import { TopicPageProps } from 'src/views/topics/types';
import { SectionTitle } from './section';

interface IntroSectionProps {
  title?: TopicPageProps['attributes']['title'];
  subtitle?: TopicPageProps['attributes']['subtitle'];
  description?: TopicPageProps['attributes']['description'];
  isLoading?: boolean;
}
export const IntroSection: React.FC<IntroSectionProps> = ({
  title,
  subtitle,
  description,
  isLoading,
}) => {
  return (
    <VStack
      spacing={4}
      alignItems='flex-start'
      flex={3}
      minWidth={{ base: '100%', md: '500px' }}
    >
      {/* Title */}
      <SectionTitle as='h1' isLoading={isLoading}>
        {title}
      </SectionTitle>

      {/* Divider */}
      <Box w={20} h={1} bgGradient='linear(to-r, secondary.500, primary.400)' />

      {/* Subtitle */}
      {(subtitle || isLoading) && (
        <SkeletonText isLoaded={!isLoading} noOfLines={2} skeletonHeight={5}>
          <Text color='gray.700' lineHeight='short'>
            {subtitle}
          </Text>
        </SkeletonText>
      )}

      {/* Description */}
      {(description || isLoading) && (
        <SkeletonText isLoaded={!isLoading} noOfLines={5} skeletonHeight={4}>
          <Text>{description}</Text>
        </SkeletonText>
      )}
    </VStack>
  );
};
