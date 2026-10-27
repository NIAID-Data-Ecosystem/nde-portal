import { Box, Flex, Text } from '@chakra-ui/react';
import React from 'react';
import { getMetadataTheme } from 'src/components/icon/helpers';
import { InfoLabel, InfoLabelProps } from 'src/components/info-label';

interface MetadataBlockProps {
  label: string;
  property: string;
  disabled?: boolean;
  children?: React.ReactNode;
  bg?: string;
  tooltipProps?: InfoLabelProps['tooltipProps'];
}

export const MetadataBlock = ({
  disabled,
  label,
  property,
  children,
  bg,
  tooltipProps,
}: MetadataBlockProps) => {
  return (
    <Box flexDirection='column' color={disabled ? 'gray.400' : 'text.body'}>
      <Flex alignItems='baseline'>
        <MetadataLabel
          tooltipProps={
            tooltipProps?.content
              ? { ...tooltipProps, content: tooltipProps.content, disabled }
              : undefined
          }
          color='inherit'
          iconProps={{ color: 'inherit' }}
        >
          {label}
        </MetadataLabel>
      </Flex>

      <Box
        mb={2}
        py={0.5}
        bg={disabled ? 'gray.300' : bg || `${getMetadataTheme(property)}.300`}
        borderRadius='semi'
      />

      <Box fontSize='sm' mx={1} lineHeight='moderate'>
        {disabled ? <>N/A</> : children}
      </Box>
    </Box>
  );
};

export const MetadataLabel = (props: InfoLabelProps) => {
  return (
    <InfoLabel
      textTransform='uppercase'
      fontSize='xs'
      fontWeight='medium'
      {...props}
    />
  );
};
