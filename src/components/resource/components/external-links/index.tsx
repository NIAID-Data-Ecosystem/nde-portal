import React from 'react';
import {
  Box,
  Button,
  ButtonProps,
  Flex,
  Icon,
  Image,
  Skeleton,
  Text,
} from 'nde-design-system';
import {FormattedResource} from 'src/utils/api/types';
import {FaDatabase} from 'react-icons/fa';

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
    <Button
      as={'a'}
      // @ts-ignore
      href={href}
      // flex={1}
      w={['unset', 'unset', '100%']}
      h={'unset'}
      px={3}
      py={2}
      mx={2}
      whiteSpace={'normal'}
      textAlign={'center'}
      display={'flex'}
      // @ts-ignore
      leftIcon={icon}
      _hover={{
        svg: {fill: 'whiteAlpha.800'},
        color: 'whiteAlpha.800',
      }}
      {...rest}
    >
      <Box borderLeft={'1px solid'} borderColor={'whiteAlpha.500'} px={2}>
        {children}
      </Box>
    </Button>
  );
};

interface ExternalLinks {
  isLoading: boolean;
  url?: FormattedResource['url'];
  curatedBy?: FormattedResource['curatedBy'];
}

const ExternalLinks: React.FC<ExternalLinks> = ({
  isLoading,
  url,
  curatedBy,
}) => {
  return (
    <Skeleton isLoaded={!isLoading}>
      <Flex
        flexDirection={['row', 'row', 'column-reverse']}
        flexWrap={'wrap'}
        py={2}
      >
        <Box>
          {curatedBy?.image && (
            <Flex w={'100%'} p={2}>
              <Image w={'100px'} src={curatedBy.image} alt='Data source logo' />
            </Flex>
          )}
          {url && (
            <PanelButton
              href={'/workspace'}
              colorScheme={'secondary'}
              icon={<Icon m={1} boxSize='20px' as={FaDatabase} />}
            >
              View data in source repository
            </PanelButton>
          )}
        </Box>
        <PanelButton
          href={'/workspace'}
          icon={
            <Image
              m={1}
              boxSize='20px'
              objectFit='contain'
              src={'/assets/workspace-logo.png'}
              alt={'Analysis workspace logo'}
            />
          }
        >
          Analyze in Workspace
        </PanelButton>
      </Flex>
    </Skeleton>
  );
};

export default ExternalLinks;
