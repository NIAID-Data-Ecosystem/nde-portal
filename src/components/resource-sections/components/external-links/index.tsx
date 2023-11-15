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
import { ExternalSourceButton } from 'src/components/external-buttons';
import { FaGithub } from 'react-icons/fa';
import Tooltip from 'src/components/tooltip';
import MetadataConfig from 'configs/resource-metadata.json';
import { FaInfo } from 'react-icons/fa';
import { DisplayHTMLContent } from 'src/components/html-content';

interface ExternalLinks {
  isLoading: boolean;
  showWorkspaceLink?: boolean;
  includedInDataCatalog?: FormattedResource['includedInDataCatalog'];
  mainEntityOfPage?: FormattedResource['mainEntityOfPage'];
  hasPart?: FormattedResource['hasPart'];
  codeRepository?: FormattedResource['codeRepository'];
  url?: FormattedResource['url'];
  usageInfo?: FormattedResource['usageInfo'];
  children?: React.ReactNode;
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
  usageInfo,
}) => {
  if (
    !isLoading &&
    !includedInDataCatalog &&
    !mainEntityOfPage &&
    !codeRepository &&
    !showWorkspaceLink
  ) {
    return <></>;
  }

  const sources =
    !isLoading && includedInDataCatalog
      ? Array.isArray(includedInDataCatalog)
        ? includedInDataCatalog
        : [includedInDataCatalog]
      : [];

  return (
    <Skeleton
      isLoaded={!isLoading}
      borderTopWidth={['2px', '2px', 0]}
      borderColor='page.alt'
    >
      <Flex flexDirection='column' bg='secondary.50'>
        {sources && (
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
            <Flex flexWrap='wrap'>
              {sources.map(source => {
                return (
                  <ExternalSourceButton
                    key={source.name}
                    w='100%'
                    alt='Data source name'
                    src={getRepositoryImage(source.name) || undefined}
                    colorScheme='secondary'
                    href={url || undefined}
                    sourceHref={source?.url}
                    name='Access Data'
                  />
                );
              })}
            </Flex>
            {usageInfo?.url && (
              <Flex mt={4}>
                <Tooltip
                  aria-label={`Tooltip for usage information`}
                  label={`${
                    usageInfo?.description ||
                    MetadataConfig?.find(d => d.property === 'usageInfo')
                      ?.description['dataset'] ||
                    ''
                  }`}
                  hasArrow
                  placement='bottom'
                  closeDelay={300}
                >
                  <button aria-label='usage information description'>
                    <Icon
                      as={FaInfo}
                      mx={2}
                      color='gray.800'
                      border='0.625px solid'
                      borderRadius='100%'
                      p={0.5}
                      boxSize='0.85rem'
                    />
                  </button>
                </Tooltip>
                <Link href={usageInfo.url} fontSize='sm' isExternal>
                  Usage Information
                </Link>
              </Flex>
            )}
          </Flex>
        )}
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
                      hasPart.map((part, i) => {
                        return part.url ? (
                          <Link
                            mt={2}
                            href={part.url}
                            key={part.url}
                            isExternal
                            wordBreak='break-word'
                            fontSize='xs'
                          >
                            {part.name || part.url}
                          </Link>
                        ) : part.name ? (
                          <Box sx={{ h4: { fontWeight: 'semibold' } }}>
                            <DisplayHTMLContent
                              key={part.name}
                              wordBreak='break-word'
                              fontSize='xs'
                              content={part.name}
                            />
                          </Box>
                        ) : (
                          <React.Fragment key={i} />
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
