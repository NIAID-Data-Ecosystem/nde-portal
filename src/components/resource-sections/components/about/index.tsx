import { OverviewSectionWrapper } from '../overview-section-wrapper';
import { FormattedResource } from 'src/utils/api/types';
import { FaMagnifyingGlass } from 'react-icons/fa6';
import { TagWithUrl } from 'src/components/tag-with-url';
import { ResourceCatalogCollection } from '../collection-information';
import { Box, SimpleGrid, VStack } from '@chakra-ui/react';

// Note: `about` and `exampleOfWork.about` are displayed under the umbrella term "Content Types" since they both generally describe the type of content associated with the resource. `genre` is displayed separately as "Research Domain" since it typically describes the broader domain or field of research that the resource is associated with, which is a different aspect than the specific content types described by `about` and `exampleOfWork.about`.

export const AboutResource = ({
  about,
  collectionSize,
  exampleOfWork,
  genre,
  isLoading,
}: {
  about?: FormattedResource['about'];
  collectionSize?: FormattedResource['collectionSize'];
  exampleOfWork?: FormattedResource['exampleOfWork'];
  genre?: FormattedResource['genre'];
  isLoading: boolean;
}) => {
  // If none of the relevant fields are present, don't render the section at all
  if (!about && !collectionSize && !exampleOfWork?.about && !genre) {
    return null;
  }

  // Combine exampleOfWork.about into about for display purposesand filter for unique values (in case there's overlap between about and exampleOfWork.about)
  const contentTypes = [
    ...(Array.isArray(about) ? about : about ? [about] : []),
    ...(exampleOfWork?.about
      ? Array.isArray(exampleOfWork.about)
        ? exampleOfWork.about
        : [exampleOfWork.about]
      : []),
  ]
    .filter(
      (item, index, self) =>
        index ===
        self.findIndex(
          t => t.displayName === item.displayName && t.name === item.name, // consider displayName and name for uniqueness
        ),
    )
    .map(item => {
      if (item.about) {
        return {
          name: item.about.displayName || item.about.name || 'N/A',
          url: item.about.url,
        };
      }
      return {
        name: item.displayName || item.name || 'N/A',
        url: item.url,
      };
    });

  return (
    <SimpleGrid
      minChildWidth={{ base: 'unset', sm: '280px', xl: '300px' }}
      spacingX={14}
      spacingY={10}
      mt={4}
      w='100%'
    >
      {/* Col 1: Genre & Content Types */}
      <VStack>
        {genre && (
          <OverviewSectionWrapper
            isLoading={isLoading}
            label='Research Domain'
            scrollContainerProps={{
              border: 'none',
              py: 0,
            }}
          >
            <TagWithUrl
              colorScheme='primary'
              href={{
                pathname: '/search',
                query: {
                  q: `genre:"${genre}"`,
                },
              }}
              m={0.5}
              leftIcon={FaMagnifyingGlass}
            >
              {genre}
            </TagWithUrl>
          </OverviewSectionWrapper>
        )}
        {/* `about` and `exampleOfWork.about` are displayed under the umbrella term "Content Types" */}
        {contentTypes.length > 0 && (
          <OverviewSectionWrapper
            isLoading={isLoading}
            label='Content Types'
            scrollContainerProps={{
              border: 'none',
              py: 0,
              maxHeight: 'unset',
            }}
          >
            {contentTypes.map((item, idx) => (
              <TagWithUrl
                key={item.name}
                colorScheme='primary'
                m={0.5}
                leftIcon={FaMagnifyingGlass}
                href={item.url || undefined}
              >
                {item.name}
              </TagWithUrl>
            ))}
          </OverviewSectionWrapper>
        )}
      </VStack>

      {/* Col 2: Size of collection */}
      {collectionSize && (
        <OverviewSectionWrapper
          isLoading={isLoading}
          label='Collection Size Details'
          maxWidth={{ base: 'unset', xl: '500px' }}
          scrollContainerProps={{
            maxHeight: 'unset',
            py: 0,
          }}
        >
          <ResourceCatalogCollection collectionSize={collectionSize} />
        </OverviewSectionWrapper>
      )}
      {/* Empty placeholder for third column at xl screens */}
      <Box display={{ base: 'none', xl: 'block' }} aria-hidden />
    </SimpleGrid>
  );
};
