import React from 'react';
import {
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
import {getRepositoryImage} from 'src/utils/helpers';

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
      <Flex direction={['column', 'row']} flexWrap='wrap'>
        <Flex m={1} flex={1} minW={'210px'}>
          {includedInDataCatalog?.url && (
            <NextLink href={includedInDataCatalog.url} passHref>
              <Button
                colorScheme='primary'
                variant='outline'
                href={includedInDataCatalog.url}
                h='unset'
                pl={3}
              >
                <Flex alignItems='center' direction={['column', 'row']}>
                  {imageURL && (
                    <Image
                      boxSize={'60px'}
                      objectFit='contain'
                      mr={4}
                      src={imageURL}
                      alt='Data source logo'
                    />
                  )}
                  <Text color='inherit' whiteSpace='normal'>
                    View data in source repository
                  </Text>
                  <Icon ml={1} as={FaExternalLinkAlt}></Icon>
                </Flex>
              </Button>
            </NextLink>
          )}
        </Flex>
        <Flex m={1} flex={1} minW={'210px'}>
          {showWorkspaceLink && (
            <Button
              colorScheme='primary'
              href='/workspace'
              isExternal
              whiteSpace='normal'
              h='unset'
              pl={3}
            >
              <Flex alignItems='center' direction={['column', 'row']}>
                {imageURL && (
                  <Image
                    boxSize={'60px'}
                    objectFit='contain'
                    w={'60px'}
                    p={4}
                    src={'/assets/workspace-logo.png'}
                    alt='Analysis workspace logo'
                  />
                )}
                <Text color='inherit' whiteSpace='normal'>
                  Explore dataset in workspace
                </Text>
              </Flex>
            </Button>
          )}
        </Flex>
      </Flex>
    </Skeleton>
  );
};

export default ExternalLinks;
