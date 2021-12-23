import React from 'react';
import {Box, Flex, FlexProps, Text} from '@chakra-ui/react';

/**
 * UI for swatch + description of theme color fields.
 */

interface ColorSwatchProps extends FlexProps {
  description?: string | null;
  hexValue: string;
  /**
   * theme object string for accessing color value.
   */
  themeColor: string;
}

const ColorSwatch: React.FC<ColorSwatchProps> = ({
  hexValue,
  themeColor,
  description,
  ...props
}) => {
  return (
    <Flex
      width='100%'
      direction={['row', 'column']}
      flex='0 1 10%'
      pr={1}
      {...props}
    >
      <Box
        width={['30%', '100%']}
        bg={themeColor}
        height={['5rem']}
        minWidth={['3rem', '9rem']}
      ></Box>
      <Flex direction='column' m={2}>
        <Text
          fontSize='xs'
          wordBreak='break-all'
          color='gray.700'
          lineHeight='short'
        >
          {hexValue}
        </Text>
        <Text
          fontSize='xs'
          wordBreak='break-all'
          color='gray.700'
          lineHeight='short'
        >
          {themeColor}
        </Text>
        {description && (
          <Text fontSize='xs' color='gray.900' lineHeight='short'>
            {description}
          </Text>
        )}
      </Flex>
    </Flex>
  );
};

export default ColorSwatch;
