import { useMemo } from 'react';
import NextLink from 'next/link';
import { FaMagnifyingGlass } from 'react-icons/fa6';
import {
  Box,
  Button,
  Flex,
  Icon,
  SkeletonText,
  Stack,
  StackDivider,
  Text,
  VStack,
} from '@chakra-ui/react';
import { Link } from 'src/components/link';
import { TopicPageProps } from 'src/views/topics/types';
import { SectionTitle } from './section';
import { Params } from 'src/utils/api';
import { getSearchResultsRoute } from '../helpers';

interface IntroSectionProps {
  title?: TopicPageProps['attributes']['title'];
  subtitle?: TopicPageProps['attributes']['subtitle'];
  description?: TopicPageProps['attributes']['description'];
  links?: TopicPageProps['attributes']['contactLinks'];
  isLoading?: boolean;
  params?: Params;
}
export const IntroSection: React.FC<IntroSectionProps> = ({
  title,
  subtitle,
  description,
  links,
  isLoading,
  params,
}) => {
  // Group contact links by category
  const contactLinksGroupedByCategory = useMemo(() => {
    return (links?.data || []).reduce((acc, contact) => {
      const category =
        contact.attributes.categories?.data[0]?.attributes.name || '';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(contact);
      return acc;
    }, {} as Record<string, NonNullable<TopicPageProps['attributes']['contactLinks']>['data']>);
  }, [links?.data]);
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
      <Stack
        alignItems='flex-start'
        spacing={6}
        flexDirection={{
          base: 'column',
          md: 'row',
        }}
      >
        {(description || isLoading) && (
          <SkeletonText isLoaded={!isLoading} noOfLines={5} skeletonHeight={4}>
            <Text>{description}</Text>
          </SkeletonText>
        )}

        {/* Contact Links */}
        {links && (
          <Flex
            bg={{ base: 'page.alt' }}
            p={[2, 4]}
            w='100%'
            borderRadius='base'
            maxWidth={{ base: 'unset', md: 400 }}
          >
            <VStack
              alignItems='flex-start'
              divider={<StackDivider borderColor='page.placeholder' />}
              spacing={4}
              flex={1}
            >
              {Object.entries(contactLinksGroupedByCategory).map(
                ([category, links]) => (
                  <Stack key={category} spacing={1} lineHeight='short'>
                    {category && (
                      <Text
                        size='sm'
                        color='text.heading'
                        textTransform='uppercase'
                      >
                        {category}
                      </Text>
                    )}
                    {links.map(({ id, attributes }) => {
                      return (
                        <Link
                          key={id}
                          href={attributes.url}
                          isExternal={attributes.isExternal}
                        >
                          {attributes.label}
                        </Link>
                      );
                    })}
                  </Stack>
                ),
              )}
              {params && (
                <NextLink
                  href={getSearchResultsRoute({
                    query: params,
                  })}
                  legacyBehavior
                  passHref
                >
                  <Button
                    as={Link}
                    leftIcon={<Icon as={FaMagnifyingGlass} boxSize={3} />}
                    size='sm'
                    alignItems='center'
                  >
                    View collection in the Discovery Portal
                  </Button>
                </NextLink>
              )}
            </VStack>
          </Flex>
        )}
      </Stack>
    </VStack>
  );
};
