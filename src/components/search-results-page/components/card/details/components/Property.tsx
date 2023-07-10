import React from 'react';
import { Box, Flex, Text, VisuallyHidden, BoxProps } from 'nde-design-system';
import { MetadataToolTip, MetadataIcon } from 'src/components/icon';
import { getMetadataColor } from 'src/components/icon/helpers';

interface MetadataPropertyProps extends BoxProps {
  id: string;
  label: string;
  glyph?: string;
  type?: string;
}

export const MetadataProperty: React.FC<MetadataPropertyProps> = ({
  label,
  glyph,
  id,
  children,
  type,
  ...props
}) => {
  return (
    <Box
      p={0}
      border='0.625px solid'
      borderRadius='semi'
      overflow='hidden'
      borderColor={!children ? 'gray.100' : getMetadataColor(glyph)}
      {...props}
    >
      <Flex alignItems='center' pb={0} position='relative'>
        <MetadataToolTip propertyName={glyph} recordType={type}>
          <MetadataIcon
            id={id}
            glyph={glyph}
            fill={!children ? 'gray.400' : getMetadataColor(glyph)}
            boxSize={6}
            title={label}
            opacity={children ? 1 : 0.6}
            m={2}
            mr={0}
          />
        </MetadataToolTip>
        <Text
          color='text.body'
          fontSize='sm'
          fontWeight='medium'
          opacity={children ? 1 : 0.9}
          ml={2}
        >
          {label} :
        </Text>
      </Flex>
      <Box
        m={2}
        mt={0}
        p={2}
        borderTop='0.625px solid'
        borderColor='gray.100'
        opacity={children ? 1 : 0.4}
        color='text.heading'
        fontSize='sm'
      >
        {children || (
          <Box w='100%' h='1rem'>
            --
            <VisuallyHidden>No data available.</VisuallyHidden>
          </Box>
        )}
      </Box>
    </Box>
  );
};
