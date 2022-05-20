import React from 'react';
import {
  Flex,
  Icon,
  Link,
  ListItem,
  Skeleton,
  Text,
  UnorderedList,
} from 'nde-design-system';
import {FormattedResource} from 'src/utils/api/types';
import {getRepositoryImage} from 'src/utils/helpers';
import {ExternalSourceButton} from 'src/components/external-buttons/index.';
import {FaGithub} from 'react-icons/fa';

interface ExternalLinks {
  isLoading: boolean;
  showWorkspaceLink?: boolean;
  includedInDataCatalog?: FormattedResource['includedInDataCatalog'];
  mainEntityOfPage?: FormattedResource['mainEntityOfPage'];
  codeRepository?: FormattedResource['codeRepository'];
  url?: FormattedResource['url'];
}

const ExternalLinks: React.FC<ExternalLinks> = ({
  isLoading,
  includedInDataCatalog,
  mainEntityOfPage,
  codeRepository,
  showWorkspaceLink = true,
  url,
}) => {
  const imageURL =
    includedInDataCatalog?.name &&
    getRepositoryImage(includedInDataCatalog.name);

  if (
    !isLoading &&
    !includedInDataCatalog?.name &&
    !mainEntityOfPage &&
    !codeRepository &&
    !showWorkspaceLink
  ) {
    return null;
  }

  return (
    <Skeleton
      isLoaded={!isLoading}
      p={[4]}
      borderTopWidth={['2px', '2px', 0]}
      borderColor='page.alt'
    >
      <Flex direction='column'>
        {includedInDataCatalog?.name && (
          <Flex
            flexDirection='column'
            alignItems='flex-start'
            flexWrap='wrap'
            minW='200px'
            maxW='350px'
            p={2}
            flex={1}
          >
            <ExternalSourceButton
              w='100%'
              alt='Data source name'
              src={imageURL || undefined}
              imageProps={{mb: 4}}
              href={url || undefined}
              sourceHref={includedInDataCatalog?.url}
              name={
                url
                  ? `View in ${includedInDataCatalog.name}`
                  : `Provided by ${includedInDataCatalog.name}` || undefined
              }
            />
          </Flex>
        )}
        {mainEntityOfPage && (
          <Flex
            flexDirection='column'
            alignItems='flex-start'
            flexWrap='wrap'
            minW='200px'
            maxW='350px'
            p={2}
            flex={1}
          >
            <Text color='gray.800' fontWeight='semibold' w='100%'>
              Reference
            </Text>
            <Link href={mainEntityOfPage} isExternal wordBreak='break-word'>
              {mainEntityOfPage}
            </Link>
          </Flex>
        )}

        {codeRepository && (
          <Flex
            flexDirection='column'
            alignItems='flex-start'
            flexWrap='wrap'
            minW='200px'
            maxW='350px'
            p={2}
            flex={1}
          >
            <Text color='gray.800' fontWeight='semibold' w='100%'>
              Source Code
            </Text>

            <UnorderedList alignItems='center' ml={0}>
              {(Array.isArray(codeRepository)
                ? codeRepository
                : [codeRepository]
              ).map((repo, i) => {
                return (
                  <ListItem key={i} my={2}>
                    {repo.includes('git') && <Icon as={FaGithub} mr={2} />}
                    <Link href={repo} isExternal wordBreak='break-word'>
                      {repo.includes('git')
                        ? 'View source code on Github'
                        : repo}
                    </Link>
                  </ListItem>
                );
              })}
            </UnorderedList>
          </Flex>
        )}
      </Flex>
    </Skeleton>
  );
};

export default ExternalLinks;
