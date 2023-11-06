import React from 'react';
import { Box, Flex, Text } from 'nde-design-system';
import { MetadataIcon } from 'src/components/icon';
import { getMetadataTheme } from 'src/components/icon/helpers';

interface MetadataBlockProps {
  id: string;
  label: string;
  property: string;
  isDisabled: boolean;
  children?: React.ReactNode;
  bg?: string;
}

// Themed block for metadata
export const MetadataBlock = ({
  isDisabled,
  id,
  label,
  property,
  children,
  bg,
}: MetadataBlockProps) => {
  return (
    <Box
      flexDirection='column'
      color={`${isDisabled ? 'niaid.placeholder' : 'text.body'}`}
    >
      <Flex alignItems='center' px={1} mb={0.5}>
        <MetadataIcon
          id={id}
          title={property}
          glyph={property}
          fill={
            isDisabled ? 'gray.500' : bg || `${getMetadataTheme(property)}.500`
          }
          isDisabled={isDisabled}
          boxSize={4}
          mr={1}
        />
        <Text
          mx={1}
          fontSize='13px'
          fontWeight='medium'
          letterSpacing='wide'
          textTransform='uppercase'
          color='inherit'
        >
          {label}
        </Text>
      </Flex>
      <Box
        mb={2}
        py={0.5}
        bg={isDisabled ? 'gray.500' : bg || `${getMetadataTheme(property)}.300`}
        borderRadius='semi'
      />

      <Box px={0.5}>{isDisabled ? <></> : children}</Box>
    </Box>
  );
};
