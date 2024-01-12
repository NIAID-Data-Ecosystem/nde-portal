import React from 'react';
import { Box, Button, Flex, Icon, Text, TooltipProps } from '@chakra-ui/react';
import { MetadataIcon } from 'src/components/icon';
import { getMetadataTheme } from 'src/components/icon/helpers';
import Tooltip from 'src/components/tooltip';
import { FaInfo } from 'react-icons/fa6';

interface MetadataBlockProps {
  id: string;
  label: string;
  property: string;
  isDisabled?: boolean;
  children?: React.ReactNode;
  bg?: string;
  colorScheme?: string;
  tooltipLabel?: TooltipProps['label'];
}

// Themed block for metadata

export const MetadataBlock = ({
  isDisabled,
  id,
  label,
  property,
  children,
  bg,
  colorScheme,
  tooltipLabel,
}: MetadataBlockProps) => {
  return (
    <Box flexDirection='column' color={isDisabled ? 'gray.700' : 'text.body'}>
      <Flex alignItems='center'>
        <Flex alignItems='center' px={1} mb={0.5} flex={1}>
          <MetadataIcon
            id={id}
            title={property}
            glyph={property}
            fill={
              isDisabled
                ? 'gray.500'
                : bg || `${getMetadataTheme(property) || colorScheme}.500`
            }
            isDisabled={isDisabled}
            boxSize={4}
            mr={1}
          />
          <MetadataLabel label={label}></MetadataLabel>
        </Flex>

        {tooltipLabel && (
          <MetadataTooltip
            tooltipLabel={tooltipLabel}
            isDisabled={isDisabled}
          />
        )}
      </Flex>

      <Box
        mb={2}
        py={0.5}
        bg={isDisabled ? 'gray.500' : bg || `${getMetadataTheme(property)}.300`}
        borderRadius='semi'
      />

      <Box fontSize='xs' mx={1} lineHeight='short'>
        {isDisabled ? <></> : children}
      </Box>
    </Box>
  );
};

export const MetadataLabel = ({ label }: Pick<MetadataBlockProps, 'label'>) => {
  return (
    <Text
      mx={1}
      fontSize='13px'
      fontWeight='medium'
      letterSpacing='wide'
      textTransform='uppercase'
      color='inherit'
      whiteSpace={['unset', 'nowrap']}
      lineHeight='inherit'
    >
      {label}
    </Text>
  );
};

// Tooltip for metadata usually for property definition
export const MetadataTooltip = ({
  isDisabled,
  tooltipLabel,
}: Pick<MetadataBlockProps, 'isDisabled' | 'tooltipLabel'>) => {
  return (
    <Tooltip label={tooltipLabel}>
      <Flex
        minW={4}
        minH={4}
        p={1}
        _hover={{
          div: {
            bg: 'gray.800',
            borderColor: 'gray.800',
            color: 'white',
          },
        }}
      >
        <Button
          as='div'
          cursor='pointer'
          borderRadius='full'
          variant='outline'
          colorScheme='gray'
          p={0}
          borderColor={isDisabled ? 'gray.500' : 'gray.600'}
          color={isDisabled ? 'gray.500' : 'gray.600'}
        >
          <Icon as={FaInfo} boxSize='0.75rem' p={0.5} />
        </Button>
      </Flex>
    </Tooltip>
  );
};
