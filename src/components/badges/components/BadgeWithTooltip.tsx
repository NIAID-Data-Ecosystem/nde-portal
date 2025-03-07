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
  colorScheme,
  tooltipLabel,
  leftIcon,
  value,
  ...props
}: BadgeWithTooltipProps) => {
  return (
    <Tooltip label={tooltipLabel}>
      <Tag
        size='md'
        colorScheme={colorScheme}
        borderRadius='full'
        variant='subtle'
        {...props}
      >
        {leftIcon && <TagLeftIcon as={leftIcon} mr={0} />}

        <TagLabel>{value || children}</TagLabel>
      </Tag>
    </Tooltip>
  );
};
