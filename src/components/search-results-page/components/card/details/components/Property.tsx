import React from 'react';
import { Box, Flex, Text, VisuallyHidden, BoxProps } from 'nde-design-system';
import { MetadataIcon } from 'src/components/icon';
import { getMetadataColor } from 'src/components/icon/helpers';

interface MetadataPropertyProps extends BoxProps {
  id: string;
  label: string;
  glyph?: string;
}

export const MetadataProperty: React.FC<MetadataPropertyProps> = ({
  label,
  glyph,
  id,
  children,
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
        <MetadataIcon
          id={`icon-${label}-${id}`}
          viewBox='0 0 200 200'
          fill={!children ? 'gray.400' : getMetadataColor(glyph)}
          opacity={children ? 1 : 0.6}
          boxSize={6}
          glyph={glyph}
          m={2}
          label={label}
        />

        <Text
          color='text.body'
          fontSize='sm'
          fontWeight='medium'
          opacity={children ? 1 : 0.9}
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
        color={'text.heading'}
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
