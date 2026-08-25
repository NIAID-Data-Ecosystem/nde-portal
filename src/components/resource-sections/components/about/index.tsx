import { Box, SimpleGrid, VStack } from '@chakra-ui/react';
import { FaMagnifyingGlass } from 'react-icons/fa6';
import { TagWithUrl } from 'src/components/tag-with-url';
import { FormattedResource } from 'src/utils/api/types';

import { ResourceCatalogCollection } from '../collection-information';
import { OverviewSectionWrapper } from '../overview-section-wrapper';

// Note: `about` and `exampleOfWork.about` are displayed under the umbrella term "Content Types" since they both generally describe the type of content associated with the resource. `genre` is displayed separately as "Research Domain" since it typically describes the broader domain or field of research that the resource is associated with, which is a different aspect than the specific content types described by `about` and `exampleOfWork.about`.

export const AboutResource = ({
  about,
  collectionSize,
  exampleOfWork,
  genre,
  loading,
}: {
  about?: FormattedResource['about'];
  collectionSize?: FormattedResource['collectionSize'];
  exampleOfWork?: FormattedResource['exampleOfWork'];
  genre?: FormattedResource['genre'];
  loading: boolean;
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
    // Normalize before deduplicating: some records nest the term one level
    // deeper (`about[].about`), and those wrappers carry no displayName/name of
    // their own — comparing them unnormalized makes every nested entry look
    // like a duplicate of the first.
    .map(item => {
      const term = item.about || item;
      return {
        name: term.displayName || term.name || 'N/A',
        url: term.url,
      };
    })
    .filter(
      (item, index, self) =>
        index ===
        self.findIndex(t => t.name === item.name && t.url === item.url), // consider name and url for uniqueness
    );

  return (
    <SimpleGrid
      minChildWidth={{ base: 'unset', sm: '280px', xl: '300px' }}
      rowGap={14}
      columnGap={10}
      mt={4}
      w='100%'
    >
      {/* Col 1: Genre & Content Types */}
      <VStack>
        {genre && (
          <OverviewSectionWrapper
            loading={loading}
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
            loading={loading}
            label='Content Types'
            scrollContainerProps={{
              border: 'none',
              py: 0,
              maxHeight: 'unset',
            }}
          >
            {contentTypes.map((item, idx) => (
              <TagWithUrl
                // Resolved names are not unique on their own: distinct terms
                // can share one, and unnamed terms all fall back to 'N/A'.
                key={`${item.name}-${idx}`}
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
          loading={loading}
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
