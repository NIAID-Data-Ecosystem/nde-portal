import React from 'react';
import {
  Box,
  Flex,
  Heading,
  Icon,
  Link,
  ListItem,
  Skeleton,
  Text,
  UnorderedList,
} from 'nde-design-system';
import { FormattedResource } from 'src/utils/api/types';
import { getRepositoryImage } from 'src/utils/helpers';
import { ExternalSourceButton } from 'src/components/external-buttons/index.';
import { FaGithub } from 'react-icons/fa';

interface ExternalLinks {
  isLoading: boolean;
  showWorkspaceLink?: boolean;
  includedInDataCatalog?: FormattedResource['includedInDataCatalog'];
  mainEntityOfPage?: FormattedResource['mainEntityOfPage'];
  hasPart?: FormattedResource['hasPart'];
  codeRepository?: FormattedResource['codeRepository'];
  url?: FormattedResource['url'];
}

const ExternalLinks: React.FC<ExternalLinks> = ({
  children,
  isLoading,
  includedInDataCatalog,
  mainEntityOfPage,
  codeRepository,
  hasPart,
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
      borderTopWidth={['2px', '2px', 0]}
      borderColor='page.alt'
    >
      <Flex direction='column' bg='secondary.50'>
        <Box p={[0, 4]}>
          {includedInDataCatalog?.name && (
            <Flex
              flexDirection='column'
              alignItems='flex-start'
              flexWrap='wrap'
              minW='200px'
              maxW={{ base: 'unset', lg: '350px' }}
              p={[0, 2]}
              flex={1}
              w='100%'
            >
              <ExternalSourceButton
                w='100%'
                alt='Data source name'
                src={imageURL || undefined}
                colorScheme='secondary'
                href={url || undefined}
                sourceHref={includedInDataCatalog?.url}
                name='Access Data'
              />
            </Flex>
          )}
        </Box>
        {(children || mainEntityOfPage || hasPart || codeRepository) && (
          <Flex p={[4]} bg='#fff' alignItems='center' flexWrap='wrap'>
            {children}
            {mainEntityOfPage || hasPart || codeRepository ? (
              <Box flex={1}>
                {(mainEntityOfPage || hasPart) && (
                  <Flex
                    flexDirection='column'
                    alignItems='flex-start'
                    flexWrap='wrap'
                    minW='200px'
                    maxW='350px'
                    p={2}
                    flex={1}
                  >
                    <Heading
                      as='h2'
                      w='100%'
                      size='sm'
                      fontWeight='semibold'
                      borderBottom='0.5px solid'
                      borderColor='niaid.placeholder'
                    >
                      Reference Documents
                    </Heading>

                    {/* mainEntityOfPage refers to a website for the resource. */}
                    {mainEntityOfPage && (
                      <Link
                        mt={2}
                        href={mainEntityOfPage}
                        isExternal
                        wordBreak='break-word'
                        fontSize='xs'
                      >
                        {mainEntityOfPage}
                      </Link>
                    )}

                    {/* hasPart refers to documentation that is related to the dataset, such as data dictionaries. */}
                    {hasPart &&
                      hasPart.map(part => {
                        return part.url ? (
                          <Link
                            mt={2}
                            href={part.url}
                            isExternal
                            wordBreak='break-word'
                            fontSize='xs'
                          >
                            {part.name || part.url}
                          </Link>
                        ) : (
                          <Text wordBreak='break-word' fontSize='xs'>
                            {part.name}
                          </Text>
                        );
                      })}
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
                    <Text
                      color='gray.800'
                      fontWeight='semibold'
                      w='100%'
                      fontSize='xs'
                    >
                      Source Code
                    </Text>

                    <UnorderedList alignItems='center' ml={0}>
                      {(Array.isArray(codeRepository)
                        ? codeRepository
                        : [codeRepository]
                      ).map((repo, i) => {
                        return (
                          <ListItem key={i} my={2}>
                            {repo.includes('git') && (
                              <Icon as={FaGithub} mr={2} />
                            )}
                            <Link
                              href={repo}
                              isExternal
                              wordBreak='break-word'
                              fontSize='xs'
                            >
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
              </Box>
            ) : (
              <></>
            )}
          </Flex>
        )}
      </Flex>
    </Skeleton>
  );
};

export default ExternalLinks;
