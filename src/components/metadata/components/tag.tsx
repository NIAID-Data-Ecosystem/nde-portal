import { BoxProps } from '@chakra-ui/react';
import { LinkProps } from 'next/link';
import React from 'react';
import { Tag } from 'src/components/tag';

interface MetadataWithTagProps extends BoxProps {
  label?: string;
  value: string;
  url?: LinkProps['href'];
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
    <Tag
      colorPalette={colorScheme}
      fontSize='13px'
      linkProps={
        url
          ? {
              href: url,
              isExternal: true,
            }
          : undefined
      }
      tooltipProps={{
        content: tooltipLabel,
      }}
      lineHeight='shorter'
    >
      {label + ' |'}
      {value}
    </Tag>
  );
};
