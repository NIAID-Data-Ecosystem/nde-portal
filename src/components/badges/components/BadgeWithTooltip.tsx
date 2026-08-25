import { Tag, TagRootProps } from '@chakra-ui/react';
import React from 'react';
import { IconType } from 'react-icons';
import Tooltip from 'src/components/tooltip';

export interface BadgeWithTooltipProps extends TagRootProps {
  leftIcon?: IconType;
  tooltipLabel?: string;
  value?: string;
}
export const BadgeWithTooltip = ({
  children,
  colorPalette,
  leftIcon,
  size = 'md',
  tooltipLabel,
  value,
  variant = 'subtle',
  ...rest
}: BadgeWithTooltipProps) => {
  return (
    <Tooltip content={tooltipLabel}>
      <Tag.Root
        size={size}
        colorPalette={colorPalette}
        borderRadius='full'
        variant={variant}
        {...rest}
      >
        {leftIcon && <Tag.StartElement as={leftIcon} mr={0} />}

        <Tag.Label>{value || children}</Tag.Label>
      </Tag.Root>
    </Tooltip>
  );
};
