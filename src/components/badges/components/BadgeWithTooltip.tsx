import { BadgeProps, Tag, TagLabel, TagLeftIcon } from '@chakra-ui/react';
import React from 'react';
import { IconType } from 'react-icons';
import Tooltip from 'src/components/tooltip';

export interface BadgeWithTooltipProps extends BadgeProps {
  value?: string;
  tooltipLabel?: string;
  leftIcon?: IconType;
}
export const BadgeWithTooltip = ({
  children,
  colorPalette,
  tooltipLabel,
  leftIcon,
  value,
  ...props
}: BadgeWithTooltipProps) => {
  return (
    <Tooltip content={tooltipLabel}>
      <Tag.Root
        size='md'
        colorPalette={colorPalette}
        borderRadius='full'
        variant='subtle'
        {...props}
      >
        {leftIcon && <Tag.StartElement as={leftIcon} mr={0} />}

        <Tag.Label>{value || children}</Tag.Label>
      </Tag.Root>
    </Tooltip>
  );
};
