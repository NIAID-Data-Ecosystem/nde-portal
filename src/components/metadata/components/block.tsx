import { Box, Button, Flex, Icon, Text } from '@chakra-ui/react';
import React from 'react';
import { FaInfo } from 'react-icons/fa6';
import { getMetadataTheme } from 'src/components/icon/helpers';
import type { TooltipProps } from 'src/components/tooltip';
import Tooltip from 'src/components/tooltip';

interface MetadataBlockProps {
  label: string;
  property: string;
  disabled?: boolean;
  children?: React.ReactNode;
  bg?: string;
  tooltipLabel?: TooltipProps['content'];
}

// Themed block for metadata

export const MetadataBlock = ({
  disabled,
  label,
  property,
  children,
  bg,
  tooltipLabel,
}: MetadataBlockProps) => {
  return (
    <Box flexDirection='column' color={disabled ? 'gray.700' : 'text.body'}>
      <Flex alignItems='baseline'>
        <MetadataLabel label={label}></MetadataLabel>
        {tooltipLabel && (
          <MetadataTooltip tooltipLabel={tooltipLabel} disabled={disabled} />
        )}
      </Flex>

      <Box
        mb={2}
        py={0.5}
        bg={disabled ? 'gray.500' : bg || `${getMetadataTheme(property)}.300`}
        borderRadius='semi'
      />

      <Box fontSize='xs' mx={1} lineHeight='moderate'>
        {disabled ? <></> : children}
      </Box>
    </Box>
  );
};

export const MetadataLabel = ({
  label,
  ...props
}: Pick<MetadataBlockProps, 'label'>) => {
  return (
    <Text
      fontSize='xs'
      fontWeight='medium'
      textTransform='uppercase'
      color='inherit'
      whiteSpace={['unset', 'nowrap']}
      {...props}
    >
      {label}
    </Text>
  );
};

// Tooltip for metadata usually for property definition
export const MetadataTooltip = ({
  disabled,
  tooltipLabel,
}: Pick<MetadataBlockProps, 'disabled' | 'tooltipLabel'>) => {
  return (
    <Tooltip content={tooltipLabel}>
      <Flex
        minW={4}
        minH={4}
        p={1}
        _hover={{
          '& div': {
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
          colorPalette='gray'
          p={0}
          borderColor={disabled ? 'gray.500' : 'gray.600'}
          color={disabled ? 'gray.500' : 'gray.600'}
        >
          <Icon boxSize='0.75rem' p={0.5}>
            <FaInfo />
          </Icon>
        </Button>
      </Flex>
    </Tooltip>
  );
};
