import React from 'react';
import { BoxProps } from '@chakra-ui/react';
import Tooltip from 'src/components/tooltip';
import { TagWithUrl } from 'src/components/tag-with-url';

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
    <Tooltip content={tooltipLabel} fontSize='12px'>
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
