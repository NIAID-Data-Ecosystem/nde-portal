import React from 'react';
import {
  Box,
  Button,
  ButtonProps,
  Flex,
  Icon,
  Image,
  Skeleton,
  Stack,
  Text,
} from 'nde-design-system';
import {FormattedResource} from 'src/utils/api/types';
import {FaExternalLinkAlt} from 'react-icons/fa';
import NextLink from 'next/link';
import {getRepositoryImage, getRepositoryName} from 'src/utils/helpers';
import {ExternalSourceButton} from 'src/components/external-buttons/index.';

interface ExternalLinks {
  isLoading: boolean;
  showWorkspaceLink?: boolean;
  includedInDataCatalog?: FormattedResource['includedInDataCatalog'];
}

const ExternalLinks: React.FC<ExternalLinks> = ({
  isLoading,
  includedInDataCatalog,
  showWorkspaceLink = true,
}) => {
  const imageURL =
    includedInDataCatalog?.name &&
    getRepositoryImage(includedInDataCatalog.name);

  return (
    <Skeleton isLoaded={!isLoading} p={[4]}>
      <Flex flexWrap='wrap'>
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
            <Text color='gray.800' fontWeight='semibold' w='100%'>
              Provided by
            </Text>
            <ExternalSourceButton
              w='100%'
              alt='Data source name'
              imageURL={imageURL || undefined}
              imageProps={{my: 2}}
              name={getRepositoryName(includedInDataCatalog.name) || undefined}
              href={includedInDataCatalog?.url || undefined}
            ></ExternalSourceButton>
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
              imageURL='/assets/workspace-gray.png'
              imageProps={{p: 2, my: 2}}
              name='Explore in workspace'
              variant='solid'
              href={includedInDataCatalog?.url || undefined}
              whiteSpace='nowrap'
            ></ExternalSourceButton>
          </Flex>
        )} */}
      </Flex>
    </Skeleton>
  );
};

export default ExternalLinks;
