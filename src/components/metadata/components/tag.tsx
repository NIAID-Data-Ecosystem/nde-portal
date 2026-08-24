import { BoxProps, Flex } from '@chakra-ui/react';
import React from 'react';
import { TagWithUrl } from 'src/components/tag-with-url';
import Tooltip from 'src/components/tooltip';

interface MetadataWithTagProps extends BoxProps {
  label?: string;
  value: string;
  url?: string | null;
  colorPalette?: string;
  tooltipLabel?: string;
}

export const MetadataWithTag = ({
  label,
  url,
  value,
  colorPalette = 'gray',
  tooltipLabel,
}: MetadataWithTagProps) => {
  return (
    <Tooltip content={<Flex fontSize='12px'>{tooltipLabel}</Flex>}>
      <TagWithUrl
        colorPalette={colorPalette}
        fontSize='13px'
        href={url}
        isExternal
        label={label + ' |'}
        lineHeight='shorter'
      >
        {value}
      </TagWithUrl>
    </Tooltip>
  );
};
