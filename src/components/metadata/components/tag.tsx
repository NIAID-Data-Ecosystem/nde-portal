import React from 'react';
import { BoxProps } from '@chakra-ui/react';
import Tooltip from 'src/components/tooltip';
import { TagWithUrl } from 'src/components/tag-with-url';

interface MetadataWithTagProps extends BoxProps {
  label?: string;
  value: string;
  url?: string | null;
  colorScheme?: string;
  tooltipLabel?: string;
}

export const MetadataWithTag = ({
  label,
  url,
  value,
  colorScheme = 'gray',
  tooltipLabel,
}: MetadataWithTagProps) => {
  return (
    <Tooltip label={tooltipLabel} fontSize='12px'>
      <TagWithUrl
        colorScheme={colorScheme}
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
