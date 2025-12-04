import { Box, Flex, Icon, Text, TextProps } from '@chakra-ui/react';
import React from 'react';
import { IconBaseProps } from 'react-icons';
import { FaInfo } from 'react-icons/fa6';
import { getMetadataTheme } from 'src/components/metadata/helpers';
import { Tooltip, TooltipProps } from 'src/components/tooltip';

interface MetadataBlockProps {
  label: string;
  property: string;
  isDisabled?: boolean;
  children?: React.ReactNode;
  bg?: string;
  tooltipLabel?: TooltipProps['content'];
}

// Themed block for metadata

export const MetadataBlock = ({
  isDisabled,
  label,
  property,
  children,
  bg,
  tooltipLabel,
}: MetadataBlockProps) => {
  return (
    <Box flexDirection='column' color={isDisabled ? 'gray.700' : 'text.body'}>
      <Flex alignItems='baseline'>
        <MetadataLabel label={label}></MetadataLabel>
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

export const MetadataLabel = ({
  label,
  ...props
}: Pick<MetadataBlockProps, 'label'> & TextProps) => {
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
      {...props}
    >
      {label}
    </Text>
  );
};

// Tooltip for metadata usually for property definition
export const MetadataTooltip = ({
  isDisabled,
  tooltipLabel,
  fontSize = 'xs',
}: Pick<MetadataBlockProps, 'isDisabled' | 'tooltipLabel'> & {
  fontSize?: IconBaseProps['fontSize'];
}) => {
  return (
    <Tooltip content={tooltipLabel}>
      <Flex
        p={1}
        _hover={{
          '& div': {
            bg: 'gray.800',
            borderColor: 'gray.800',
            color: 'white',
          },
        }}
      >
        <Icon
          as={FaInfo}
          border='1px solid'
          borderRadius='full'
          borderColor={isDisabled ? 'gray.500' : 'gray.600'}
          color={isDisabled ? 'gray.500' : 'gray.600'}
          cursor='pointer'
          p={0.5}
          fontSize={fontSize}
        />
      </Flex>
    </Tooltip>
  );
};
