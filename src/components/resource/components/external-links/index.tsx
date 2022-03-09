import React, {ReactElement} from 'react';
import {
  Button,
  ButtonProps,
  Icon,
  Image,
  Skeleton,
  Stack,
  Text,
} from 'nde-design-system';
import {FormattedResource} from 'src/utils/api/types';
import {FaDatabase, FaExternalLinkAlt} from 'react-icons/fa';
import sourceData from 'configs/resource-sources.json';
import {IconType} from 'react-icons';
import NextLink from 'next/link';

interface PanelButton extends ButtonProps {
  href: string;
  icon?: React.ReactNode;
}
const PanelButton: React.FC<PanelButton> = ({
  href,
  icon,
  children,
  ...rest
}) => {
  return (
    <NextLink href={href} passHref>
      <Button
        as={'a'}
        my={1}
        w={['100%']}
        h={['unset']}
        whiteSpace={'normal'}
        minW={250}
        color={'white'}
        // @ts-ignore
        target={'_blank'}
        {...rest}
      >
        <Text color='white'>{children}</Text>
        <Icon as={FaExternalLinkAlt} boxSize={3} ml={2} />
      </Button>
    </NextLink>
  );
};

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
  const {repositories} = sourceData;
  const getSourceImage = (repoName?: string | null) => {
    if (!repoName) {
      return null;
    }
    const sourceRepoIndex = repositories.findIndex(source => {
      return source.name.toLowerCase().includes(repoName.toLowerCase());
    });
    return sourceRepoIndex >= 0 ? repositories[sourceRepoIndex].imageUrl : null;
  };

  const imageURL = getSourceImage(includedInDataCatalog?.name);
  return (
    <Skeleton isLoaded={!isLoading} p={[0, 0, 4]}>
      {imageURL && (
        <Image w={'100px'} mb={2} src={imageURL} alt='Data source logo' />
      )}
      <Stack
        w={'100%'}
        direction={['column', 'row', 'column']}
        shouldWrapChildren={true}
        flexWrap='wrap'
      >
        {includedInDataCatalog?.url && (
          <NextLink href={includedInDataCatalog.url} passHref>
            <PanelButton
              flex={1}
              href={includedInDataCatalog.url}
              colorScheme={'secondary'}
              icon={<Icon m={1} boxSize='16px' as={FaDatabase} />}
            >
              View data in source repository
            </PanelButton>
          </NextLink>
        )}

        {showWorkspaceLink && (
          <PanelButton
            flex={1}
            href={'/workspace'}
            icon={
              <Image
                m={1}
                boxSize='16px'
                objectFit='contain'
                src={'/assets/workspace-logo.png'}
                alt={'Analysis workspace logo'}
              />
            }
          >
            Analyze in Workspace
          </PanelButton>
        )}
      </Stack>
    </Skeleton>
  );
};

export default ExternalLinks;
