import {
  Box,
  Image,
  SkeletonText,
  Stack,
  Text,
  VStack,
} from '@chakra-ui/react';
import { DiseasePageProps } from 'src/views/diseases/types';
import { SectionTitle } from './section';
import { useMDXComponents } from 'mdx-components';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

interface IntroSectionProps {
  title?: DiseasePageProps['attributes']['title'];
  subtitle?: DiseasePageProps['attributes']['subtitle'];
  description?: DiseasePageProps['attributes']['description'];
  links?: DiseasePageProps['attributes']['contactLinks'];
  image?: DiseasePageProps['attributes']['image'];
  isLoading?: boolean;
}
export const IntroSection: React.FC<IntroSectionProps> = ({
  title,
  subtitle,
  description,
  image,
  isLoading,
  links,
}) => {
  const MDXComponents = useMDXComponents({});

  // [Note]: Unsure if contact link will remain here. Check when program collections are added back.
  // // Group contact links by category
  // const contactLinksGroupedByCategory = useMemo(() => {
  //   return (links?.data || []).reduce((acc, contact) => {
  //     const category =
  //       contact.attributes.categories?.data[0]?.attributes.name || '';
  //     if (!acc[category]) {
  //       acc[category] = [];
  //     }
  //     acc[category].push(contact);
  //     return acc;
  //   }, {} as Record<string, NonNullable<DiseasePageProps['attributes']['contactLinks']>['data']>);
  // }, [links?.data]);

  return (
    <Stack
      flexDirection={{ base: 'column', sm: 'row' }}
      spacing={{ base: 6, lg: 16 }}
      flexWrap='wrap'
    >
      <VStack
        spacing={4}
        alignItems='flex-start'
        flex={3}
        minWidth={{ base: '100%', sm: '450px' }}
      >
        {/* Title */}
        <SectionTitle as='h1' isLoading={isLoading}>
          {title}
        </SectionTitle>

        {/* Divider */}
        <Box
          w={20}
          h={1}
          bgGradient='linear(to-r, secondary.500, primary.400)'
        />

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
          <SkeletonText
            isLoaded={!isLoading}
            noOfLines={5}
            skeletonHeight={4}
            maxWidth={{ base: 'unset', xl: 800 }}
          >
            {description && (
              <ReactMarkdown
                rehypePlugins={[rehypeRaw, remarkGfm]}
                components={MDXComponents}
              >
                {description}
              </ReactMarkdown>
            )}
          </SkeletonText>
        )}
      </VStack>

      {/* Image */}
      {image?.data?.attributes?.url && (
        <Box
          as='figure'
          minWidth={250}
          maxWidth={{ base: 'unset', sm: '60%', md: '40%' }}
          flex={1}
        >
          <Image
            borderRadius='base'
            width='100%'
            height='auto'
            src={image.data.attributes.url}
            alt={image.data.attributes.alternativeText}
            objectFit='contain'
          />
          {/* Image caption: can include a credit link so using markdown renderer */}
          {image.data.attributes?.caption && (
            <ReactMarkdown
              rehypePlugins={[rehypeRaw, remarkGfm]}
              components={{
                ...MDXComponents,
                p: props => (
                  <Text
                    as='figcaption'
                    fontSize='xs'
                    opacity={0.8}
                    lineHeight='short'
                    fontStyle='italic'
                    mt={1}
                    {...props}
                  />
                ),
              }}
            >
              {image.data.attributes.caption}
            </ReactMarkdown>
          )}
        </Box>
      )}
    </Stack>
  );
};
