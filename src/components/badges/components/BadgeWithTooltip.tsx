import { Badge, BadgeProps, Flex } from '@chakra-ui/react';
import React from 'react';
import Tooltip from 'src/components/tooltip';

export interface BadgeWithTooltipProps extends BadgeProps {
  value?: string;
  tooltipLabel?: string;
  leftIcon?: React.ReactNode;
}
export const BadgeWithTooltip = ({
  children,
  tooltipLabel,
  leftIcon,
  value,
  ...props
}: BadgeWithTooltipProps) => {
  return (
    <Tooltip label={tooltipLabel}>
      <Badge size='xs' display='flex' alignItems='center' {...props}>
        {leftIcon && (
          <Flex
            alignItems='center'
            pr={0.5}
            pb={0.5}
            sx={{ svg: { boxSize: 3, pr: 0.5 } }}
          >
            {leftIcon}
          </Flex>
        )}
        {value || children}
      </Badge>
    </Tooltip>
  );
};
