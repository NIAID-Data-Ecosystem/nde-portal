import { Icon, Tag, TagRootProps } from '@chakra-ui/react';
import React from 'react';
import { IconType } from 'react-icons';
import { Tooltip } from 'src/components/tooltip';

export interface TagWithTooltipProps extends TagRootProps {
  tooltipContent?: string;
  leftIcon?: IconType;
}
export const TagWithTooltip = ({
  borderRadius = 'full',
  children,
  colorPalette,
  tooltipContent,
  leftIcon,
  size = 'md',
  variant = 'surface',
  ...props
}: TagWithTooltipProps) => {
  return (
    <Tooltip content={tooltipContent}>
      <Tag.Root
        borderRadius={borderRadius}
        colorPalette={colorPalette}
        size={size}
        variant={variant}
        {...props}
      >
        {leftIcon && (
          <Tag.StartElement>
            <Icon as={leftIcon} />
          </Tag.StartElement>
        )}
        <Tag.Label>{children}</Tag.Label>
      </Tag.Root>
    </Tooltip>
  );
};
