import React from 'react';
import {Flex, Icon, Link, Skeleton, Text} from 'nde-design-system';
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
            alignItems='start'
            flexWrap='wrap'
            minW='200px'
            maxW='350px'
            p={2}
            flex={1}
          >
            {/* <Text color='gray.800' fontWeight='semibold' w='100%'>
              Provided by
            </Text> */}
            <ExternalSourceButton
              w='100%'
              alt='Data source name'
              imageURL={imageURL || undefined}
              imageProps={{mb: 4}}
              name={`View in ${includedInDataCatalog.name}` || undefined}
              href={url || undefined}
            />
          </Flex>
        )}
        {mainEntityOfPage && (
          <Flex
            flexDirection='column'
            alignItems='start'
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
            alignItems='start'
            flexWrap='wrap'
            minW='200px'
            maxW='350px'
            p={2}
            flex={1}
          >
            <Text color='gray.800' fontWeight='semibold' w='100%'>
              Source Code
            </Text>

            <Flex alignItems='center'>
              {codeRepository.includes('git') && <Icon as={FaGithub} mr={2} />}
              <Link href={codeRepository} isExternal wordBreak='break-word'>
                {codeRepository.includes('git') ? 'Github' : codeRepository}
              </Link>
            </Flex>
          </Flex>
        )}
        {/* {showWorkspaceLink && (
          <Flex
            flexDirection='column'
            alignItems='start'
            flexWrap='wrap'
            minW='250px'
            maxW='350px'
            p={2}
            flex={1}
          >
            <Text color='gray.800' fontWeight='semibold' w='100%'>
              Dataset Available
            </Text>
            <ExternalSourceButton
              w='100%'
              alt='Data source name'
              imageProps={{p: 2, my: 2}}
              name='Explore in workspace'
              variant='solid'
              href="#"
              whiteSpace='nowrap'
            ></ExternalSourceButton>
          </Flex>
        )} */}
      </Flex>
    </Skeleton>
  );
};

export default ExternalLinks;
